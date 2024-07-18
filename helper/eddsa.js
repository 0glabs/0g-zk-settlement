const circomlibjs = require('circomlibjs');
const utils = require('circomlibjs').utils;

let eddsa;
let babyjubjub;
let pedersenHash;

async function init() {
    if (!pedersenHash) {
        pedersenHash = await circomlibjs.buildPedersenHash();
    }
    if (!eddsa) {
        eddsa = await circomlibjs.buildEddsa();
    }
    if (!babyjubjub) {
        babyjubjub = await circomlibjs.buildBabyjub();
    }
}

function babyJubJubGeneratePrivateKey() {
    return eddsa.pruneBuffer(utils.randomBytes(32));
}

function babyJubJubGeneratePublicKey(privateKey) {
    return eddsa.prv2pub(privateKey);
}

async function babyJubJubSignature(msg, privateKey) {
    return eddsa.signPedersen(privateKey, msg);
}

async function babyJubJubVerify(msg, signature, publicKey) {
    return eddsa.verifyPedersen(msg, signature, publicKey);
}

function packSignature(signature) {
    return eddsa.packSignature(signature);
}

function packPoint(point) {
    return babyjubjub.packPoint(point);
}

function hash(msg) {
    return pedersenHash.hash(msg);
}

module.exports = {
    init,
    babyJubJubGeneratePrivateKey,
    babyJubJubGeneratePublicKey,
    babyJubJubSignature,
    babyJubJubVerify,
    packSignature,
    packPoint,
    hash
};
