pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "./settlement_eddsa/commit_account.circom";
include "./settlement_eddsa/check_balance.circom";
include "./settlement_eddsa/check_nonce.circom";
include "./settlement_eddsa/verify_signature.circom";
include "./utils/bytes_to_num.circom";

// l: trace length
template SettleTrace(l) {
    var i;
    var j; 
    
    var serviceNameBytesWidth = 16; // string:[u8;32]
    var countBytesWidth = 4; // uint32:[u8;4]
    var nonceBytesWidth = 4; // unit32:[u8;4]
    var addressBytesWidth = 20; // unit160:[u8; 20]
    var balanceBytesWidth = 8; // unit64:[u8; 8]
    var requestBytesWidth = nonceBytesWidth + countBytesWidth * 2 + balanceBytesWidth * 2 + serviceNameBytesWidth + addressBytesWidth * 2;

    // request content
    // every settlment just process one account, so the signer should be same
    signal input signer[32];
    signal input r8[l][32];
    signal input s[l][32];
    signal input serializedRequest[l][requestBytesWidth];

    // verify signature
    component sigVerifier = SignatureVerify(l);
    sigVerifier.serializedRequest <== serializedRequest;
    sigVerifier.r8 <== r8;
    sigVerifier.s <== s;
    sigVerifier.pubkey <== signer;
    component packSigner1 = Bytes2Num(16);
    component packSigner2 = Bytes2Num(16);
    for (i=0; i<16; i++) {
        packSigner1.in[i] <== signer[i];
        packSigner2.in[i] <== signer[16+i];
    }
    signal output packedSigner[2];
    packedSigner[0] <== packSigner1.out;
    packedSigner[1] <== packSigner2.out;
    signal output userAddress;
    signal output providerAddress;
    userAddress <== sigVerifier.userAddress[0];
    providerAddress <== sigVerifier.providerAddress[0];

    // check nonce is valid
    component checkNonce = NonceCheck(l);
    checkNonce.nonce <== sigVerifier.nonce;
    signal output initNonce;
    signal output finalNonce;
    initNonce <== checkNonce.initNonce;
    finalNonce <== checkNonce.finalNonce;

    // check balance trace is valid
    component checkBalance = BalanceCheck(l);
    checkBalance.inputCount <== sigVerifier.inputCount;
    checkBalance.outputCount <== sigVerifier.outputCount;
    checkBalance.inputPrice <== sigVerifier.inputPrice;
    checkBalance.outputPrice <== sigVerifier.outputPrice;
    signal output totalCost;
    totalCost <== checkBalance.totalCost;
}