const snarkjs = require('snarkjs');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

let lastUsedInput = null;

async function fileExists(filePath) {
    try {
        await fs.access(filePath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

async function getVerificationKey() {
    try {
        return await fs.readFile(config.vkeyPath, 'utf8').then(JSON.parse);
    } catch (error) {
        console.error('Error reading verification key:', error);
        throw error;
    }
}

async function getVerifierContract() {
    try {
        const templates = {
            groth16: await fs.readFile(path.join(__dirname, '../node_modules/snarkjs/templates/verifier_groth16.sol.ejs'), 'utf8'),
            plonk: await fs.readFile(path.join(__dirname, '../node_modules/snarkjs/templates/verifier_plonk.sol.ejs'), 'utf8'),
            fflonk: await fs.readFile(path.join(__dirname, '../node_modules/snarkjs/templates/verifier_fflonk.sol.ejs'), 'utf8')
        };

        const verifierCode = await snarkjs.zKey.exportSolidityVerifier(config.zkeyPath, templates);
        return verifierCode;
    } catch (error) {
        console.error('Error generating verifier contract:', error);
        throw error;
    }
}

async function generateProof(inputs) {
    if (!inputs) {
        throw new Error("Input is required");
    }

    try {
        console.log('Generating new proof and public input.');
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, config.wasmPath, config.zkeyPath);
        return { proof, publicSignals };
    } catch (error) {
        console.error('Error generating proof:', error);
        throw error;
    }
}

async function getSolidityCalldata(inputs) {
    if (!inputs) {
        throw new Error("Input is required");
    }

    try {
        console.log('Generating new proof...');
        const { proof, publicSignals } = await generateProof(inputs);

        let res;
        if (proof.protocol === "groth16") {
            res = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
        } else if (proof.protocol === "plonk") {
            res = await snarkjs.plonk.exportSolidityCallData(proof, publicSignals);
        } else if (proof.protocol === "fflonk") {
            res = await snarkjs.fflonk.exportSolidityCallData(publicSignals, proof);
        } else {
            throw new Error("Invalid Protocol");
        }

        return res;
    } catch (error) {
        console.error('Error generating Solidity calldata:', error);
        throw error;
    }
}
module.exports = { generateProof, getVerificationKey, getVerifierContract, getSolidityCalldata };