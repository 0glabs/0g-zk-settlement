const snarkjs = require('snarkjs');
const config = require('./config');

async function generateProof(inputs) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, config.wasmPath, config.zkeyPath);
    return { proof, publicSignals };
}

async function getVerificationKey() {
    return fs.readJSON(config.vkeyPath);
}

module.exports = { generateProof, getVerificationKey };