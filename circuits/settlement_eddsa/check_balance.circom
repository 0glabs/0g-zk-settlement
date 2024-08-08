pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../hasher/pedersen_bytes.circom";
include "./accumulate_cost.circom";

template BalanceCheck(traceLen) {
    var i;
    
    signal input inputCount[traceLen];
    signal input outputCount[traceLen];
    signal input inputPrice[traceLen];
    signal input outputPrice[traceLen];

    // calculate total cost
    component costAccumulator = CostAccumulate(traceLen);
    costAccumulator.inputPrice <== inputPrice;
    costAccumulator.outputPrice <== outputPrice;
    costAccumulator.inputCount <== inputCount;
    costAccumulator.outputCount <== outputCount;
    
    signal output totalCost;
    totalCost <== costAccumulator.totalCost;
}
