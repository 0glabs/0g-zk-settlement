const { Request } = require('./helper/request');
const eddsa = require('./helper/eddsa');
const helper = require('./helper/helper');
const utils = require('./helper/utils');

async function sign(requestBody) {
    await eddsa.init();
    
    // 从请求体中提取数据
    const { requests, privkey } = requestBody;

    // 验证必要的字段
    if (!requests || !privkey) {
        throw new Error('Missing required fields in request body');
    }

    const requestInstances = requests.map(data => new Request(
        data.nonce,
        data.fee,
        data.userAddress.toString(),
        data.providerAddress.toString()
    ));
    
    const unpackedPrivkey = new Uint8Array(32);
    unpackedPrivkey.set(utils.bigintToBytes(BigInt(privkey[0]), 16), 0);
    unpackedPrivkey.set(utils.bigintToBytes(BigInt(privkey[1]), 16), 16);

    return helper.signRequests(requestInstances, unpackedPrivkey);
}

async function genProofInput(requestBody) {
    await eddsa.init();

    // 从请求体中提取数据
    const { requests, l, pubkey, signatures } = requestBody;

    // 验证必要的字段
    if (!requests || !l || !pubkey || !signatures) {
        throw new Error('Missing required fields in request body');
    }

    // 将JSON对象转换为Request实例
    const requestInstances = requests.map(req => new Request(
        req.nonce,
        req.fee,
        req.userAddress,
        req.providerAddress
    ));
    
    return helper.generateProofInput(requestInstances, l, pubkey, signatures);
}

async function genKeyPair(requestBody) {
    await eddsa.init();

    const privkey = eddsa.babyJubJubGeneratePrivateKey();
    const pubkey = eddsa.babyJubJubGeneratePublicKey(privkey);

    const packedPubkey = eddsa.packPoint(pubkey);
    const packedPubkey0 = utils.bytesToBigint(packedPubkey.slice(0, 16));
    const packedPubkey1 = utils.bytesToBigint(packedPubkey.slice(16));
    const packPrivkey0 = utils.bytesToBigint(privkey.slice(0, 16));
    const packPrivkey1 = utils.bytesToBigint(privkey.slice(16));
    return {packPrivkey0, packPrivkey1, packedPubkey0, packedPubkey1};
}

async function verifySig(requestBody) {
    await eddsa.init();

    const { requests, pubkey, signatures } = requestBody;
    
    // 验证必要的字段
    if (!requests || !pubkey || !signatures) {
        throw new Error('Missing required fields in request body');
    }
    
    const requestInstances = requests.map(req => new Request(
        req.nonce,
        req.fee,
        req.userAddress,
        req.providerAddress
    ));
    return await helper.verifySig(requestInstances, signatures, pubkey);
}

module.exports = {
    sign,
    genProofInput,
    genKeyPair,
    verifySig
};