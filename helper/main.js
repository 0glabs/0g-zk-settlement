const { Request } = require('./request');
const { Account } = require('./account');
const helper = require("./helper");
const utils = require("./utils");

async function main() {
    const privkey = [248, 249, 209, 134, 89, 173, 186, 208, 180, 107, 31, 177, 20, 172, 49, 114, 238, 213, 142, 203, 211, 98, 74, 62, 12, 119, 100, 107, 165, 252, 1, 49];
    
    const serviceName = '0x1234567890abcdef1234567890abcdef';
    const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    const providerAddress = '0x1234567890123456789012345678901234567890';

    const requests = [
        new Request(1, 1, 0, '10', '2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z', serviceName, userAddress, providerAddress),
        new Request(2, 1, 2, '10', '2024-01-01T00:00:00Z', '2024-01-02T00:00:01Z', serviceName, userAddress, providerAddress),
        new Request(3, 0, 1, '10', '2024-01-01T00:00:00Z', '2024-01-02T00:00:02Z', serviceName, userAddress, providerAddress)
    ];

    const account = new Account(0, 100, userAddress, providerAddress);

    const input = await helper.generateProofInput(requests, account, 4, privkey);
    
    console.log("Proof input:", utils.jsonifyData(input, true));
    utils.writeJsonToFile(input, "../build_eddsa/input.json");
}

main().catch(console.error);