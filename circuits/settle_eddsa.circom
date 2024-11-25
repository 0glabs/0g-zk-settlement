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
    
    var nonceBytesWidth = 8; // unit32:[u8;8]
    var addressBytesWidth = 20; // unit160:[u8; 20]
    var balanceBytesWidth = 16; // unit128:[u8; 16]
    var requestBytesWidth = nonceBytesWidth + balanceBytesWidth + addressBytesWidth * 2;

    // request content
    // every settlment just process one account, so the signer should be same
    signal input signer[2];
    signal input r8[l][32];
    signal input s[l][32];
    signal input serializedRequest[l][requestBytesWidth];

    // verify signature
    component sigVerifier = SignatureVerify(l);
    sigVerifier.serializedRequest <== serializedRequest;
    sigVerifier.r8 <== r8;
    sigVerifier.s <== s;
    component unpackSigner0 = Num2Bytes(16);
    component unpackSigner1 = Num2Bytes(16);
    unpackSigner0.in <== signer[0];
    unpackSigner1.in <== signer[1];
    for (i=0; i<16; i++) {
        sigVerifier.signer[i] <== unpackSigner0.out[i];
        sigVerifier.signer[16 + i] <== unpackSigner1.out[i];
    }
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
    checkBalance.fee <== sigVerifier.fee;
    signal output totalFee;
    totalFee <== checkBalance.totalFee;
}