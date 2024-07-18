pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../hasher/pedersen_bytes.circom";
include "./accumulate_cost.circom";

template BalanceCheck(traceLen) {
    var i;
    var balanceBytesWidth = 8; // uint128:[u8;16]
    
    signal input inputCount[traceLen];
    signal input outputCount[traceLen];
    signal input updatedAt[traceLen];
    signal input createdAt[traceLen];
    signal input price[traceLen];

    // calculate total cost
    component costAccumulator = CostAccumulate(traceLen);
    costAccumulator.updatedAt <== updatedAt;
    costAccumulator.price <== price;
    costAccumulator.inputCount <== inputCount;
    costAccumulator.outputCount <== outputCount;
    costAccumulator.createdAt <== createdAt;

    signal input initBalance;
    // costAccumulator must less eq than initBalance
    component let = LessEqThan(balanceBytesWidth*8);
    let.in[0] <== costAccumulator.totalCost;
    let.in[1] <== initBalance;
    let.out === 1;
    
    signal output finalBalance;
    finalBalance <== initBalance - costAccumulator.totalCost;
}
