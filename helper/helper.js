const { Point, getPublicKey, sign, utils } = require('@noble/secp256k1');
const { bls12_381 } = require('@noble/curves/bls12-381');
const circomlibjs = require('circomlibjs');

let pedersenHash;
let eddsa;
let babyjubjub;

async function initPedersenHash() {
    if (!pedersenHash) {
        pedersenHash = await circomlibjs.buildPedersenHash();
    }
}

async function initEdDSA() {
    if (!eddsa) {
        eddsa = await circomlibjs.buildEddsa();
    }
    if (!babyjubjub) {
        babyjubjub = await circomlibjs.buildBabyjub();
    }
}

function secp256k1GeneratePublicKey(privateKey) {
    const publicKey = getPublicKey(privateKey, false);  // false for uncompressed public key
    return {
        x: publicKey.slice(1, 33),  // Remove prefix 04, take first 32 bytes
        y: publicKey.slice(33)      // Take last 32 bytes
    };
}

async function secp256k1Signature(messageHash, privateKey) {
    const signature = await sign(messageHash, privateKey, { canonical: true, der: false });
    return {
        r: signature.slice(0, 32),
        s: signature.slice(32, 64)
    };
}

function BLSGeneratePublicKey(privateKey) {
    return bls12_381.getPublicKey(privateKey);
}

async function BLSSignature(messageHash, privateKey) {
    return bls12_381.sign(messageHash, privateKey);
}

function formatBytes(bytes) {
    return '[' + Array.from(bytes).map(b => `"${b}"`).join(', ') + ']';
}

function parseBytes(str) {
    const arr = JSON.parse(str);
    return new Uint8Array(arr.map(s => parseInt(s)));
}

function arrayToBigint(x) {
    let ret = 0n;
    for (let idx = 0; idx < x.length; idx++) {
        ret = ret * 256n;
        ret = ret + BigInt(x[idx]);
    }
    return ret;
}

function bigintToArray(n, k, x) {
    let mod = 1n;
    for (let idx = 0; idx < n; idx++) {
        mod = mod * 2n;
    }

    let ret = [];
    let x_temp = x;
    for (let idx = 0; idx < k; idx++) {
        ret.push(x_temp % mod);
        x_temp = x_temp / mod;
    }
    return ret;
}

async function commitAccount(account) {
    await initPedersenHash();

    const userAddress = parseBytes(account.userAddress);
    const providerAddress = parseBytes(account.providerAddress);
    const nonce = parseBytes(account.nonce);
    const balance = parseBytes(account.balance);

    const concatenated = new Uint8Array([...userAddress, ...providerAddress, ...nonce, ...balance]);
    console.log("serialized account:", formatBytes(concatenated))
    const hash = pedersenHash.hash(concatenated);
    return new Uint8Array(hash);
}

async function hashRequest(request) {
    await initPedersenHash();

    const serviceName = parseBytes(request.serviceName);
    const inputCount = parseBytes(request.inputCount);
    const outputCount = parseBytes(request.outputCount);
    const nonce = parseBytes(request.nonce);

    const concatenated = new Uint8Array([...serviceName, ...inputCount, ...outputCount, ...nonce]);
    const hash = pedersenHash.hash(concatenated);
    return [concatenated, new Uint8Array(hash)];
}

// 新增 Baby JubJub EdDSA 函数
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

async function main() {
    await initPedersenHash();
    await initEdDSA();

    // Example private key (32 bytes) input as a string
    const privateKeyStr = '["248", "249", "209", "134", "89", "173", "186", "208", "180", "107", "31", "177", "20", "172", "49", "114", "238", "213", "142", "203", "211", "98", "74", "62", "12", "119", "100", "107", "165", "252", "1", "49"]';
    const privateKey = parseBytes(privateKeyStr);

    console.log("Private Key:", privateKeyStr);

    // secp256k1
    console.log("\n--- secp256k1 ---");
    const secp256k1PublicKey = secp256k1GeneratePublicKey(privateKey);
    console.log("secp256k1 Public Key X:", formatBytes(secp256k1PublicKey.x));
    console.log("secp256k1 Public Key Y:", formatBytes(secp256k1PublicKey.y));
    const secp256k1_pub0_big_int = arrayToBigint(secp256k1PublicKey.x);
    const secp256k1_pub1_big_int = arrayToBigint(secp256k1PublicKey.y);
    const secp256k1_pub0_arr = bigintToArray(64, 4, secp256k1_pub0_big_int);
    const secp256k1_pub1_arr = bigintToArray(64, 4, secp256k1_pub1_big_int);
    console.log("secp256k1 Public Key X:", secp256k1_pub0_arr);
    console.log("secp256k1 Public Key Y:", secp256k1_pub1_arr);

    // BLS
    console.log("\n--- BLS ---");
    const BLSPublicKey = BLSGeneratePublicKey(privateKey);
    console.log("BLS Public Key:", formatBytes(BLSPublicKey));
    const BLS_pub_big_int = arrayToBigint(BLSPublicKey);
    const BLS_pub_arr = bigintToArray(64, 6, BLS_pub_big_int);  // BLS public keys are typically 48 bytes
    console.log("BLS Public Key (BigInt Array):", BLS_pub_arr);

    // Baby JubJub EdDSA
    console.log("\n--- Baby JubJub EdDSA ---");
    const babyJubJubPrivateKey = privateKey;
    const babyJubJubPublicKey = babyJubJubGeneratePublicKey(babyJubJubPrivateKey);
    console.log("Baby JubJub Private Key:", formatBytes(babyJubJubPrivateKey));
    console.log("Baby JubJub Public Key:", babyJubJubPublicKey);

    const request = {
        serviceName: '["1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]',
        inputCount: '["1", "0", "0", "0"]',
        outputCount: '["2", "0", "0", "0"]',
        nonce: '["1", "0", "0", "0"]'
    };

    const [msg, msgHash] = await hashRequest(request);
    console.log("\nMessage Hash (Pedersen):", formatBytes(msgHash));
    console.log("serialized request:", formatBytes(msg))
    const msg_big_int = arrayToBigint(msgHash);
    const msg_arr = bigintToArray(64, 4, msg_big_int);
    console.log("Message Hash (Pedersen):", msg_arr);

    // secp256k1 signature
    console.log("\n--- secp256k1 Signature ---");
    const secp256k1Sig = await secp256k1Signature(msgHash, privateKey);
    console.log("secp256k1 Signature R:", formatBytes(secp256k1Sig.r));
    console.log("secp256k1 Signature S:", formatBytes(secp256k1Sig.s));
    const secp256k1_r_big_int = arrayToBigint(secp256k1Sig.r);
    const secp256k1_s_big_int = arrayToBigint(secp256k1Sig.s);
    const secp256k1_r_arr = bigintToArray(64, 4, secp256k1_r_big_int);
    const secp256k1_s_arr = bigintToArray(64, 4, secp256k1_s_big_int);
    console.log("secp256k1 Signature R:", secp256k1_r_arr);
    console.log("secp256k1 Signature S:", secp256k1_s_arr);

    // BLS signature
    console.log("\n--- BLS Signature ---");
    const BLSSig = await BLSSignature(msgHash, privateKey);
    console.log("BLS Signature:", formatBytes(BLSSig));
    const BLS_sig_big_int = arrayToBigint(BLSSig);
    const BLS_sig_arr = bigintToArray(64, 12, BLS_sig_big_int);  // BLS signatures are typically 96 bytes
    console.log("BLS Signature (BigInt Array):", BLS_sig_arr);

    // Verify BLS signature
    const isValidBLS = bls12_381.verify(BLSSig, msgHash, BLSPublicKey);
    console.log("BLS Signature is valid:", isValidBLS);

    // Baby JubJub EdDSA signature
    console.log("\n--- Baby JubJub EdDSA Signature ---");
    const babyJubJubSig = await babyJubJubSignature(msg, babyJubJubPrivateKey);

    // Verify Baby JubJub EdDSA signature
    const isValidBabyJubJub = await babyJubJubVerify(msg, babyJubJubSig, babyJubJubPublicKey);
    console.log("Baby JubJub Signature is valid:", isValidBabyJubJub);

    // pack sig for circom
    const pSignature = eddsa.packSignature(babyJubJubSig);
    const pPubkey = babyjubjub.packPoint(babyJubJubPublicKey);
    console.log("Baby JubJub Signature R8:", formatBytes(pSignature.slice(0, 32)));
    console.log("Baby JubJub Signature S:", formatBytes(pSignature.slice(32, 64)));
    console.log("Baby JubJub Public Key:", formatBytes(pPubkey));

    // Test commitAccount function
    const account = {
        userAddress: '["23", "195", "75", "108", "42", "129", "38", "229", "171", "223", "241", "105", "237", "137", "217", "105", "97", "110", "81", "60"]',
        providerAddress: '["143", "110", "41", "72", "222", "16", "210", "85", "166", "97", "47", "135", "245", "236", "81", "45", "183", "247", "171", "126"]',
        nonce: '["1", "0", "0", "0"]',
        balance: '["10", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]'
    };

    const commitment = await commitAccount(account);
    console.log("\nAccount Commitment:", formatBytes(commitment));
}

main().catch(console.error);