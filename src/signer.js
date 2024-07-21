const { Request } = require('../helper/request');
const { Account } = require('../helper/account');
const eddsa = require('../helper/eddsa');
const utils = require('../helper/utils');
const helper = require('../helper/helper');

async function sign(requestBody) {
    await eddsa.init();
    
    // 从请求体中提取数据
    const { requests, privkey } = requestBody;

    // 验证必要的字段
    if (!requests || !privkey) {
        throw new Error('Missing required fields in request body');
    }

    const pubkey = eddsa.babyJubJubGeneratePublicKey(privkey);

    const requestInstances = requests.map(data => new Request(
        data.nonce,
        data.inputCount,
        data.outputCount,
        data.price.toString(),
        data.updatedAt,
        data.createdAt,
        data.serviceName.toString(),
        data.userAddress.toString(),
        data.providerAddress.toString()
    ));

    return helper.signAndVerifyRequests(requestInstances, privkey, pubkey);
}

async function genProofInput(requestBody) {
    await eddsa.init();

    // 从请求体中提取数据
    const { requests, account, l, privkey } = requestBody;

    // 验证必要的字段
    if (!requests || !account || !l || !privkey) {
        throw new Error('Missing required fields in request body');
    }

    // 将JSON对象转换为Request实例
    const requestInstances = requests.map(req => new Request(
        req.nonce,
        req.inputCount,
        req.outputCount,
        req.price,
        req.updatedAt,
        req.createdAt,
        req.serviceName,
        req.userAddress,
        req.providerAddress
    ));

    const accountInstance = new Account(
        account.balance,
        account.nonce,
        account.userAddress,
        account.providerAddress
    );

    return helper.generateProofInput(requestInstances, accountInstance, l, privkey);
}

async function genKeyPair(requestBody) {
    await eddsa.init();

    const privkey = eddsa.babyJubJubGeneratePrivateKey();
    const pubkey = eddsa.babyJubJubGeneratePublicKey(privkey);

    return {privkey, pubkey};
}

module.exports = {
    sign,
    genProofInput,
    genKeyPair
};