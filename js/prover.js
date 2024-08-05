const snarkjs = require('snarkjs');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

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

async function getVerifierContract(if_batch=false) {
    try {
        const templates = {
            groth16: await fs.readFile(path.join(__dirname, '../node_modules/snarkjs/templates/verifier_groth16.sol.ejs'), 'utf8'),
            plonk: await fs.readFile(path.join(__dirname, '../node_modules/snarkjs/templates/verifier_plonk.sol.ejs'), 'utf8'),
            fflonk: await fs.readFile(path.join(__dirname, '../node_modules/snarkjs/templates/verifier_fflonk.sol.ejs'), 'utf8'),
            batchGroth16: await fs.readFile(path.join(__dirname, '../contract/batch_verifier.sol.ejs'), 'utf8')
        };
        let verifierCode;
        if (if_batch) {
            verifierCode = await snarkjs.zKey.exportSolidityVerifier(config.zkeyPath, { groth16: templates.batchGroth16 });
        } else {
            verifierCode = await snarkjs.zKey.exportSolidityVerifier(config.zkeyPath, templates);
        }
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
        const start_cal_wnts = Date.now();
        await snarkjs.wtns.calculate(inputs, config.wasmPath, config.wtnsPath, {});
        const end_cal_wnts = Date.now();
        const dua_cal_wnts = end_cal_wnts - start_cal_wnts;
        console.log(`calculate witness time: ${dua_cal_wnts} ms`);
        const start_gen_proof = Date.now();
        const { proof, publicSignals } = await snarkjs.groth16.prove(config.zkeyPath, config.wtnsPath);
        const end_gen_proof = Date.now();
        const dua_gen_proof = end_gen_proof - start_gen_proof;
        console.log(`generate proof time: ${dua_gen_proof} ms`);
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
        console.log("proof:", proof);
        console.log("publicSignals:", publicSignals);
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