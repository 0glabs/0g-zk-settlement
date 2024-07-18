pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../utils/bytes_to_num.circom";

template ParsePriceAndUpdatedAt() {
    var i;
    var servicePriceBytesWidth = 4;
    var serviceUpdatedAtBytesWidth = 8;

    signal input priceAndUpdatedAt;
    component unpackPriceAndUpdatedAt = Num2Bytes(servicePriceBytesWidth + serviceUpdatedAtBytesWidth);
    unpackPriceAndUpdatedAt.in <== priceAndUpdatedAt;

    component packPrice = Bytes2Num(servicePriceBytesWidth);
    component packUpdatedAt = Bytes2Num(serviceUpdatedAtBytesWidth);

    for (i=0; i<servicePriceBytesWidth; i++) {
        packPrice.in[i] <== unpackPriceAndUpdatedAt.out[i];
    }
    for (i=0; i<serviceUpdatedAtBytesWidth; i++) {
        packUpdatedAt.in[i] <== unpackPriceAndUpdatedAt.out[i + servicePriceBytesWidth];
    }

    signal output price;
    price <== packPrice.out;
    signal output updatedAt;
    updatedAt <== packUpdatedAt.out;
}

template CostAccumulate(traceLen) {
    var i;
    var serviceUpdatedAtBitsWidth = 64;

    signal input price[traceLen];
    signal input updatedAt[traceLen];
    signal input createdAt[traceLen];

    component GT[traceLen];
    for (i=0; i<traceLen; i++) {
        GT[i] = GreaterThan(serviceUpdatedAtBitsWidth);
        GT[i].in[0] <== createdAt[i];
        GT[i].in[1] <== updatedAt[i];
        GT[i].out === 1;
    }

    signal input inputCount[traceLen];
    signal input outputCount[traceLen];
    signal costAccumulator[traceLen];
  
    costAccumulator[0] <== (inputCount[0] + outputCount[0]) * price[0];
    for (i=1; i<traceLen; i++) {
        costAccumulator[i] <== costAccumulator[i-1] + (inputCount[i] + outputCount[i]) * price[0];
    }

    signal output totalCost;
    totalCost <== costAccumulator[traceLen - 1];
}