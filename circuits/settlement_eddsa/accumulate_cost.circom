pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../utils/bytes_to_num.circom";

template CostAccumulate(traceLen) {
    var i;

    signal input inputPrice[traceLen];
    signal input outputPrice[traceLen];
    signal input inputCount[traceLen];
    signal input outputCount[traceLen];

    signal inputCostAccumulator[traceLen];
    signal outputCostAccumulator[traceLen];
  
    inputCostAccumulator[0] <== inputCount[0] * inputPrice[0]; 
    outputCostAccumulator[0] <== outputCount[0] * outputPrice[0]; 

    for (i=1; i<traceLen; i++) {
        inputCostAccumulator[i] <== inputCostAccumulator[i-1] + inputCount[i] * inputPrice[i];
        outputCostAccumulator[i] <== outputCostAccumulator[i-1] + outputCount[i] * outputPrice[i];
    }

    signal output totalCost;
    totalCost <== inputCostAccumulator[traceLen - 1] + outputCostAccumulator[traceLen - 1];
}