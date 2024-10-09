const { genKeyPair} = require('./signer');
const { signRequests, verifySig } = require('./helper/helper')
const utils = require('./helper/utils');

async function getSignKeyPair() {
    const { packPrivkey0, packPrivkey1, packedPubkey0, packedPubkey1 } = await genKeyPair();
    return {
        privkey: [packPrivkey0, packPrivkey1],
        pubkey: [packedPubkey0, packedPubkey1],
    };
}

async function signData(data, privkey) {
    const privkey0 = utils.bigintToBytes(privkey[0], 16)
    const privkey1 = utils.bigintToBytes(privkey[1], 16)
    const combinedKey = new Uint8Array(32);
    combinedKey.set(privkey0, 0); 
    combinedKey.set(privkey1, 16);

    const signatures = await signRequests(data, combinedKey);
    return signatures;
}

async function verifySignature(data, signatures, pubkey) {
    const isValid = await verifySig(data, signatures, pubkey)
    return isValid;
}

module.exports = {
    getSignKeyPair,
    signData,
    verifySignature,
};