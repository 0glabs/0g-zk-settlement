const utils = require('./utils');
const eddsa = require('./eddsa');
const { Request } = require('./request');
const { format } = require('path');

const serviceName = '0x1234567890abcdef1234567890abcdef';
const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
const providerAddress = '0x1234567890123456789012345678901234567890';
const THEORETICAL_EARLIEST_TIME = '2020-01-01T00:00:00Z';
const THEORETICAL_LATEST_TIME = '2030-01-01T00:00:00Z';

async function signAndVerifyRequests(serializedRequestTrace, babyJubJubPrivateKey, babyJubJubPublicKey) {
    // Pack public key
    const packPubkey = eddsa.packPoint(babyJubJubPublicKey);
    const signatures = [];
    const packSignature = [];
    const R8 = [];
    const S = [];

    for (let i = 0; i < serializedRequestTrace.length; i++) {
        // Baby JubJub EdDSA signature
        const signature = await eddsa.babyJubJubSignature(serializedRequestTrace[i], babyJubJubPrivateKey);
        signatures.push(signature);

        // Verify Baby JubJub EdDSA signature
        const isValid = await eddsa.babyJubJubVerify(serializedRequestTrace[i], signature, babyJubJubPublicKey);
        console.log("Signature", i, "is valid:", isValid);

        // Pack signature for circom
        const packedSig = eddsa.packSignature(signature);
        packSignature.push(packedSig);
        R8.push(utils.formatBytes(packedSig.slice(0, 32)));
        S.push(utils.formatBytes(packedSig.slice(32, 64)));
    }

    return { packPubkey, R8, S };
}

async function paddingSignature(serializedRequestTrace, R8, S, l) {
    if (l < serializedRequestTrace.length) {
        throw new Error('l must be greater than or equal to the length of serializedRequestTrace');
    }

    const lastRequest = Request.deserialize(serializedRequestTrace[serializedRequestTrace.length - 1]);
    const lastR8 = R8[R8.length - 1];
    const lastS = S[S.length - 1];

    let currentNonce = lastRequest.nonce;
    for (let i = serializedRequestTrace.length; i < l; i++) {
        currentNonce += 1;
        const noopRequest = new Request(
            currentNonce,
            0,
            0,
            0n,
            THEORETICAL_EARLIEST_TIME,
            THEORETICAL_LATEST_TIME,
            '0x' + lastRequest.serviceName.toString(16),
            '0x' + lastRequest.userAddress.toString(16),
            '0x' + lastRequest.providerAddress.toString(16)
        );

        serializedRequestTrace.push(noopRequest.serialize());
        R8.push(lastR8);
        S.push(lastS);
    }
    formatTrace = [];
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        formatTrace[i] = utils.formatBytes(serializedRequestTrace[i]);
    }

    return { formatTrace, R8, S };
}

async function main() {
    await eddsa.init();

    console.log("\n--- Baby JubJub EdDSA Key Generation ---");
    // Example private key (32 bytes) input as a string
    const privateKeyStr = '["248", "249", "209", "134", "89", "173", "186", "208", "180", "107", "31", "177", "20", "172", "49", "114", "238", "213", "142", "203", "211", "98", "74", "62", "12", "119", "100", "107", "165", "252", "1", "49"]';
    const privateKey = utils.parseBytes(privateKeyStr);
    console.log("Private Key:", privateKeyStr);

    // Baby JubJub(bn128) EdDSA
    const babyJubJubPrivateKey = privateKey;
    const babyJubJubPublicKey = eddsa.babyJubJubGeneratePublicKey(babyJubJubPrivateKey);
    console.log("Baby JubJub Private Key:", babyJubJubPrivateKey);
    console.log("Baby JubJub Public Key:", babyJubJubPublicKey);

    console.log("\n--- Request Trace Serialize ---");
    var requestTrace = new Array();
    requestTrace[0] = new Request(
        1,
        1,
        0,
        1,
        '2024-01-01T00:00:00Z',
        '2024-01-02T00:00:00Z',
        serviceName,
        userAddress,
        providerAddress
    );
    requestTrace[1] = new Request(
        2,
        1,
        2,
        1,
        '2024-01-01T00:00:00Z',
        '2024-01-02T00:00:01Z',
        serviceName,
        userAddress,
        providerAddress
    );
    requestTrace[2] = new Request(
        3,
        0,
        1,
        1,
        '2024-01-01T00:00:00Z',
        '2024-01-02T00:00:02Z',
        serviceName,
        userAddress,
        providerAddress
    );
    var serializedRequestTrace = new Array();
    for (var i = 0; i < requestTrace.length; i++) {
        serializedRequestTrace[i] = requestTrace[i].serialize();
    }
    // console.log("serializedRequest: ", utils.formatArray(serializedRequestTrace));

    console.log("\n--- Request Trace Sign ---");
    // // pack public key
    // const packPubkey = eddsa.packPoint(babyJubJubPublicKey);
    // var signatures = new Array();
    // var packSignature = new Array();
    // var R8 = new Array();
    // var S = new Array();
    // for (var i = 0; i < requestTrace.length; i++) {
    //     // Baby JubJub EdDSA signature
    //     signatures[i] = await eddsa.babyJubJubSignature(serializedRequestTrace[i], babyJubJubPrivateKey);
    //     // Verify Baby JubJub EdDSA signature
    //     const isValidBabyJubJub = await eddsa.babyJubJubVerify(serializedRequestTrace[i], signatures[i], babyJubJubPublicKey);
    //     console.log("Signature",i, "is valid:", isValidBabyJubJub);

    //     // pack sig for circom
    //     packSignature[i] = eddsa.packSignature(signatures[i]);
    //     R8[i] = utils.formatBytes(packSignature[i].slice(0, 32));
    //     S[i] = utils.formatBytes(packSignature[i].slice(32, 64));
    // }
    // console.log("A:", utils.formatBytes(packPubkey));
    // console.log("R8:", utils.formatArray(R8));
    // console.log("S:", utils.formatArray(S));
    const result = await signAndVerifyRequests(serializedRequestTrace, babyJubJubPrivateKey, babyJubJubPublicKey);
    const paddingResult = paddingSignature(serializedRequestTrace, result.R8, result.S, 4);
    console.log("serializedRequest: ", utils.formatArray((await paddingResult).formatTrace));
    console.log("A:", utils.formatBytes(result.packPubkey));
    console.log("R8:", utils.formatArray((await paddingResult).R8));
    console.log("S:", utils.formatArray((await paddingResult).S));

    console.log("\n--- Commit Account ---");
    const { Account } = require('./account');
    const account = new Account(
        0,
        100,
        userAddress,
        providerAddress,
    );
    const serializedAccount = account.serialize();
    console.log('serializedAccount:', utils.formatBytes(serializedAccount));
    console.log('accountCommitment:', utils.formatBytes(account.commitment));
}

main().catch(console.error);