const { Request } = require('./request');
const helper = require("./helper");
const utils = require("./utils");
const eddsa = require('./eddsa');

async function main() {
    eddsa.init();
    const privkey = [115, 207, 153, 233, 130, 53, 126, 224, 210, 141, 150, 42, 168, 70, 164, 94, 49, 94, 236, 143, 159, 216, 173, 159, 196, 220, 158, 41, 61, 148, 167, 28];
    const pubkey = eddsa.packPoint(await helper.genPubkey(privkey));

    console.log("privkey:", privkey);
    console.log("pubkey:", pubkey);

    const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    const providerAddress = '0x1234567890123456789012345678901234567890';

    const requests = [
        new Request(1, '5', userAddress, providerAddress),
        new Request(2, '6', userAddress, providerAddress),
        new Request(3, '7', userAddress, providerAddress)
    ];

    const signatures = await helper.signRequests(requests, privkey);
    console.log("signatures:", signatures);

    const packedPubkey0 = utils.bytesToBigint(pubkey.slice(0, 16));
    const packedPubkey1 = utils.bytesToBigint(pubkey.slice(16));
    console.log("packedPubkey0:", packedPubkey0);
    console.log("packedPubkey1:", packedPubkey1);
    const isValid = await helper.verifySig(requests, signatures, [packedPubkey0, packedPubkey1])
    console.log("isValid:", isValid);

    const input = await helper.generateProofInput(requests, 4, [packedPubkey0, packedPubkey1], signatures);

    console.log("Proof input:", utils.jsonifyData(input, true));
}

main().catch(console.error);