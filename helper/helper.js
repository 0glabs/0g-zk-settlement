const eddsa = require('./eddsa');
const utils = require('./utils');
const { Request } = require('./request');
const { Account } = require('./account');

async function generateProofInput(requests, account, l, privkey) {
    await eddsa.init();
    const babyJubJubPrivateKey = privkey;
    const babyJubJubPublicKey = eddsa.babyJubJubGeneratePublicKey(babyJubJubPrivateKey);

    const signResult = await signAndVerifyRequests(requests, babyJubJubPrivateKey, babyJubJubPublicKey);
    const paddingResult = await paddingSignature(requests, signResult.r8, signResult.s, l);

    const serializedAccount = account._serialize();

    const input = {
        serializedRequest: paddingResult.serializedRequestTrace,
        signer: signResult.packPubkey,
        r8: paddingResult.r8,
        s: paddingResult.s,
        serializedAccount: serializedAccount
    };

    return input;
}

// 辅助函数：签名并验证请求
async function signAndVerifyRequests(requests, babyJubJubPrivateKey, babyJubJubPublicKey) {
    const packPubkey = eddsa.packPoint(babyJubJubPublicKey);
    const signatures = [];
    const r8 = [];
    const s = [];
    const serializedRequestTrace = requests.map(request => request.serialize());

    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await eddsa.babyJubJubSignature(serializedRequestTrace[i], babyJubJubPrivateKey);
        signatures.push(signature);

        const isValid = await eddsa.babyJubJubVerify(serializedRequestTrace[i], signature, babyJubJubPublicKey);
        console.log("Signature", i, "is valid:", isValid);

        const packedSig = eddsa.packSignature(signature);
        r8.push(packedSig.slice(0, 32));
        s.push(packedSig.slice(32, 64));
    }

    return { packPubkey, r8, s };
}

// 辅助函数：填充签名
function paddingSignature(requests, r8, s, l) {
    if (l < requests.length) {
        throw new Error('l must be greater than or equal to the length of serializedRequestTrace');
    }

    const lastRequest = requests[requests.length - 1];
    const lastR8 = r8[r8.length - 1];
    const lastS = s[s.length - 1];

    let currentNonce = lastRequest.nonce;
    for (let i = requests.length; i < l; i++) {
        currentNonce += 1;
        const noopRequest = new Request(
            currentNonce,
            0,
            0,
            0n,
            '2000-01-01T00:00:00Z',
            '2030-01-01T00:00:00Z',
            '0x' + lastRequest.serviceName.toString(16),
            '0x' + lastRequest.userAddress.toString(16),
            '0x' + lastRequest.providerAddress.toString(16)
        );

        requests.push(noopRequest);
        r8.push(lastR8);
        s.push(lastS);
    }

    const serializedRequestTrace = requests.map(request => request.serialize());
    return { serializedRequestTrace, r8, s };
}

module.exports = {
    generateProofInput,
    signAndVerifyRequests
};