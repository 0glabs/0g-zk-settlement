const path = require('path');

const circuitName = 'settle_ecdsa';

const config = {
    circuitName,
    circuitsDir: path.join(__dirname, '../circuits'),
    buildDir: path.join(__dirname, '../build_ecdsa'),
    ptauPath: path.join(__dirname, '../circuits/pot22_final.ptau'),
    port: 3000
};

config.circuitPath = path.join(config.circuitsDir, `${circuitName}.circom`);
config.wasmPath = path.join(config.buildDir, `${circuitName}_js/${circuitName}.wasm`);
config.zkeyPath = path.join(config.buildDir, `${circuitName}.zkey`);
config.vkeyPath = path.join(config.buildDir, `vkey.json`);

module.exports = config;