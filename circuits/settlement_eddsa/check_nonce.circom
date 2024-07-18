pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/binsum.circom";
include "../utils/bytes_to_num.circom";

template NonceCheck(traceLen) {
    var i;
    var nonceBytesWidth = 4; // unit32:[u8;4]

    signal input nonce[traceLen]; 
    signal input initNonce;

    component sumFlag = BinSum(1, traceLen);
    component LT[traceLen];
    LT[0] = LessThan(nonceBytesWidth);
    LT[0].in[0] <== initNonce;
    LT[0].in[1] <== nonce[0];
    sumFlag.in[0][0] <== LT[0].out;
    for (i=1; i<traceLen; i++) {
        LT[i] = LessThan(nonceBytesWidth);
        LT[i].in[0] <== nonce[i-1];
        LT[i].in[1] <== nonce[i];
        sumFlag.in[i][0] <== LT[i].out;
    }
    var sumFlagOutBits = nbits((2**1 -1)*traceLen);
    component packFlag = Bits2Num(sumFlagOutBits);
    packFlag.in <== sumFlag.out;
    packFlag.out === traceLen;

    signal output finalNonce;
    finalNonce <== nonce[traceLen-1];
}