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
    try {
        console.log('Generating new proof and public input.');
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, config.wasmPath, config.zkeyPath);
        
        // save proof and public inputs
        await fs.writeFile(path.join(config.buildDir, 'proof.json'), JSON.stringify(proof, null, 2));
        await fs.writeFile(path.join(config.buildDir, 'public.json'), JSON.stringify(publicSignals, null, 2));

        return { proof, publicSignals };
    } catch (error) {
        console.error('Error generating proof:', error);
        throw error;
    }
}

async function getSolidityCalldata(inputs = null) {
    const proofPath = path.join(config.buildDir, 'proof.json');
    const publicPath = path.join(config.buildDir, 'public.json');
    const inputPath = path.join(config.buildDir, 'input.json');

    let proof, publicSignals;

    if (await fileExists(proofPath) && await fileExists(publicPath)) {
        console.log('Existing proof and public input files found. Reading from files.');
        proof = JSON.parse(await fs.readFile(proofPath, 'utf8'));
        publicSignals = JSON.parse(await fs.readFile(publicPath, 'utf8'));
        
        if (!inputs) {
            // 如果没有提供新的输入，尝试读取保存的输入
            if (await fileExists(inputPath)) {
                lastUsedInput = JSON.parse(await fs.readFile(inputPath, 'utf8'));
            } else if (!lastUsedInput) {
                throw new Error("No input provided and no saved input found");
            }
        } else {
            // 如果提供了新的输入，更新并保存
            lastUsedInput = inputs;
            await fs.writeFile(inputPath, JSON.stringify(inputs, null, 2));
        }
    } else {
        if (!inputs && !lastUsedInput) {
            throw new Error("Input is required for the first call");
        }
        console.log('No existing proof and public input, prepare to genereate new...');
        ({ proof, publicSignals } = await generateProof(inputs || lastUsedInput));
    }

    try {
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