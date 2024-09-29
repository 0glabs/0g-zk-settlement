const { genKeyPair, sign, verifySig } = require('./signer');
const utils = require('./helper/utils');

async function getSignKeyPair() {
    const { packPrivkey0, packPrivkey1, packedPubkey0, packedPubkey1 } = await genKeyPair();
    return {
        privkey: ["0x" + packPrivkey0.toString(16), "0x" + packPrivkey1.toString(16)],
        pubkey: ["0x" + packedPubkey0.toString(16), "0x" + packedPubkey1.toString(16)],
    };
}

async function signData(data) {
    const signatures = await sign(data);
    return { signatures };
}

async function verifySignature(data) {
    const isValid = await verifySig(data);
    return isValid;
}

module.exports = {
    getSignKeyPair,
    signData,
    verifySignature,
};