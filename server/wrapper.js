var ffi = require('ffi-napi');
// const ref = require('ref-napi');

const rustLib = ffi.Library('./build/librust_prover', {
    'init': ['string', []],
    'generate_calldata': ['string', ['string']],
    'generate_proof': ['string', ['string']],
});

function callRustFunction(funcName, ...args) {
    console.log(`Calling Rust function: ${funcName}`);
    try {
        const result = rustLib[funcName](...args);
        console.log(`Result from ${funcName}:`, result);
        return result;
    } catch (error) {
        console.error(`Error calling ${funcName}:`, error);
        throw error;
    }
}

module.exports = {
    callRustFunction
};