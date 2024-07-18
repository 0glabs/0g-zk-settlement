
pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/gates.circom";
include "../../node_modules/circomlib/circuits/binsum.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../utils/bytes_to_num.circom";
include "../eddsa/eddsa_verify.circom";

template SignatureVerify(traceLen) {
    var i;
    var j;
    var serviceNameBytesWidth = 16; // string:[u8;32]
    var countBytesWidth = 4; // uint32:[u8;4]
    var nonceBytesWidth = 4; // unit32:[u8;4]
    var dataBytesWidth = 8; // unit64:[u8;4]
    var addressBytesWidth = 20; // unit160:[u8; 20]
    var balanceBytesWidth = 8; // unit64:[u8; 8]
    var totalBytesWidth = nonceBytesWidth + countBytesWidth * 2 + dataBytesWidth * 2 + balanceBytesWidth + serviceNameBytesWidth + addressBytesWidth * 2;

    signal input pubkey[32];
    signal input r8[traceLen][32];
    signal input s[traceLen][32];
    signal input serializedRequest[traceLen][totalBytesWidth];

    component verifier[traceLen];
    for (i=0; i<traceLen; i++) {
        verifier[i] = EdDSAVerify(totalBytesWidth);
        verifier[i].R8 <== r8[i];
        verifier[i].S <== s[i];
        verifier[i].A <== pubkey;
        verifier[i].msg <== serializedRequest[i];
    }
    
    component packNonce[traceLen];
    component packInputCount[traceLen];
    component packOutputCount[traceLen];
    component packPrice[traceLen];
    component packUpdatedAt[traceLen];
    component packCreatedAt[traceLen];
    component packServiceName[traceLen];
    component packUserAddress[traceLen];
    component packProviderAddress[traceLen];
    for (i=0; i<traceLen; i++) {
        packNonce[i] = Bytes2Num(nonceBytesWidth);
        packInputCount[i] = Bytes2Num(countBytesWidth);
        packOutputCount[i] = Bytes2Num(countBytesWidth);
        packPrice[i] = Bytes2Num(balanceBytesWidth);
        packUpdatedAt[i] = Bytes2Num(dataBytesWidth);
        packCreatedAt[i] = Bytes2Num(dataBytesWidth);
        packServiceName[i] = Bytes2Num(serviceNameBytesWidth);
        packUserAddress[i] = Bytes2Num(addressBytesWidth);
        packProviderAddress[i] = Bytes2Num(addressBytesWidth);
        for (j=0; j<nonceBytesWidth; j++) {
            packNonce[i].in[j] <== serializedRequest[i][j];
        }
        for (j=0; j<countBytesWidth; j++) {
            packInputCount[i].in[j] <== serializedRequest[i][nonceBytesWidth + j];
        }
        for (j=0; j<countBytesWidth; j++) {
            packOutputCount[i].in[j] <== serializedRequest[i][nonceBytesWidth + countBytesWidth + j];
        }
        for (j=0; j<balanceBytesWidth; j++) {
            packPrice[i].in[j] <== serializedRequest[i][nonceBytesWidth + countBytesWidth*2 + j];
        }
        for (j=0; j<dataBytesWidth; j++) {
            packUpdatedAt[i].in[j] <== serializedRequest[i][nonceBytesWidth + countBytesWidth*2 + balanceBytesWidth + j];
        }
        for (j=0; j<dataBytesWidth; j++) {
            packCreatedAt[i].in[j] <== serializedRequest[i][nonceBytesWidth + countBytesWidth*2 + balanceBytesWidth + dataBytesWidth + j];
        }
        for (j=0; j<serviceNameBytesWidth; j++) {
            packServiceName[i].in[j] <== serializedRequest[i][nonceBytesWidth + countBytesWidth*2 + balanceBytesWidth + dataBytesWidth*2 + j];
        }
        for (j=0; j<addressBytesWidth; j++) {
            packUserAddress[i].in[j] <== serializedRequest[i][nonceBytesWidth + countBytesWidth*2 + balanceBytesWidth + dataBytesWidth*2 + serviceNameBytesWidth + j];
        }
        for (j=0; j<addressBytesWidth; j++) {
            packProviderAddress[i].in[j] <== serializedRequest[i][nonceBytesWidth + countBytesWidth*2 + balanceBytesWidth + dataBytesWidth*2 + serviceNameBytesWidth + addressBytesWidth + j];
        }
    }
    
    component inputIsZero[traceLen];
    component outputIsZero[traceLen];
    component countAllZero[traceLen];
    component sigValidOrCountAllZero[traceLen];
    component sumFlag = BinSum(1, traceLen);
    for (i=0; i<traceLen; i++) {
        inputIsZero[i] = IsZero();
        outputIsZero[i] = IsZero();
        inputIsZero[i].in <== packInputCount[i].out;
        outputIsZero[i].in <== packOutputCount[i].out;

        countAllZero[i] = AND();
        countAllZero[i].a <== inputIsZero[i].out;
        countAllZero[i].b <== outputIsZero[i].out;
        
        sigValidOrCountAllZero[i] = OR();
        sigValidOrCountAllZero[i].a <== verifier[i].result;
        sigValidOrCountAllZero[i].b <== countAllZero[i].out;
        
        sumFlag.in[i][0] <== sigValidOrCountAllZero[i].out;
    }

    var sumFlagOutBits = nbits((2**1 -1)*traceLen);
    component packFlag = Bits2Num(sumFlagOutBits);
    packFlag.in <== sumFlag.out;
    packFlag.out === traceLen;

    signal output nonce[traceLen];
    signal output inputCount[traceLen];
    signal output outputCount[traceLen];
    signal output price[traceLen];
    signal output updatedAt[traceLen];
    signal output createdAt[traceLen];
    signal output serviceName[traceLen];
    signal output userAddress[traceLen];
    signal output providerAddress[traceLen];
    for (i=0; i<traceLen; i++) {
        nonce[i] <== packNonce[i].out;
        inputCount[i] <== packInputCount[i].out;
        outputCount[i] <== packOutputCount[i].out;
        price[i] <== packPrice[i].out;
        updatedAt[i] <== packUpdatedAt[i].out;
        createdAt[i] <== packCreatedAt[i].out;
        serviceName[i] <== packServiceName[i].out;
        userAddress[i] <== packUserAddress[i].out;
        providerAddress[i] <== packProviderAddress[i].out;
    }
}