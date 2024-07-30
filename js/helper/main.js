const { Request } = require('./request');
const { Account } = require('./account');
const helper = require("./helper");
const utils = require("./utils");
const eddsa = require('./eddsa');

async function main() {
    eddsa.init();
    const privkey = [115, 207, 153, 233, 130, 53, 126, 224, 210, 141, 150, 42, 168, 70, 164, 94, 49, 94, 236, 143, 159, 216, 173, 159, 196, 220, 158, 41, 61, 148, 167, 28];
    const pubkey = await helper.genPubkey(privkey);
    console.log("privkey:", privkey);
    console.log("pubkey:", pubkey);

    const serviceName = '0x1234567890abcdef1234567890abcdef';
    const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    const providerAddress = '0x1234567890123456789012345678901234567890';

    const requests = [
        new Request(1, 1, 0, '10', '2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z', serviceName, userAddress, providerAddress),
        new Request(2, 1, 2, '10', '2024-01-01T00:00:00Z', '2024-01-02T00:00:01Z', serviceName, userAddress, providerAddress),
        new Request(3, 0, 1, '10', '2024-01-01T00:00:00Z', '2024-01-02T00:00:02Z', serviceName, userAddress, providerAddress)
    ];

    const signatures = await helper.signRequests(requests, privkey);
    console.log("signatures:", signatures);
    const isValid = await helper.verifySig(requests, signatures, pubkey)
    console.log("isValid:", isValid);

    const account = new Account(0, 100, userAddress, providerAddress);

    const input = await helper.generateProofInput(requests, account, 4, pubkey, signatures);

    console.log("Proof input:", utils.jsonifyData(input, true));
    utils.writeJsonToFile(input, "../build_eddsa/input.json");
}

main().catch(console.error);