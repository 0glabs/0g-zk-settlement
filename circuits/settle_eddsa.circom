include "../node_modules/circomlib/circuits/comparators.circom";
include "./settlement_eddsa/commit_account.circom";
include "./settlement_eddsa/check_balance.circom";
include "./settlement_eddsa/check_nonce.circom";
include "./settlement_eddsa/verify_signature.circom";

// l: trace length
template SettleTrace(l) {
    var i;
    var j; 
    
    var serviceNameBytesWidth = 16; // string:[u8;32]
    var countBytesWidth = 4; // uint32:[u8;4]
    var nonceBytesWidth = 4; // unit32:[u8;4]
    var dataBytesWidth = 8; // unit64:[u8;4]
    var addressBytesWidth = 20; // unit160:[u8; 20]
    var balanceBytesWidth = 8; // unit64:[u8; 8]
    var requestBytesWidth = nonceBytesWidth + countBytesWidth * 2 + dataBytesWidth * 2 + balanceBytesWidth + serviceNameBytesWidth + addressBytesWidth * 2;
    var accountBytesWidth = nonceBytesWidth + balanceBytesWidth + addressBytesWidth*2;

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

    // account content
    // every settlment just process one account
    signal input serializedAccount[accountBytesWidth];
    component accountCommit = AccountCommit();
    accountCommit.serializedAccount <== serializedAccount;
    signal output old_commitment[2];
    old_commitment <== accountCommit.accountCommitment;

    // check signers for request in signer in account are mathched

    // check nonce is valid
    component checkNonce = NonceCheck(l);
    checkNonce.nonce <== sigVerifier.nonce;
    checkNonce.initNonce <== accountCommit.nonce;
    signal output nonce;
    nonce <== checkNonce.finalNonce;

    // check balance trace is valid
    component checkBalance = BalanceCheck(l);
    checkBalance.initBalance <== accountCommit.balance;
    checkBalance.inputCount <== sigVerifier.inputCount;
    checkBalance.outputCount <== sigVerifier.outputCount;
    checkBalance.updatedAt <== sigVerifier.updatedAt;
    checkBalance.createdAt <== sigVerifier.createdAt;
    checkBalance.price <== sigVerifier.price;
    signal output balance;
    balance <== checkBalance.finalBalance;
}

component main = SettleTrace(40);