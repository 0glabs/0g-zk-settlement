pragma circom 2.0.2;

include "../keccak/keccak.circom";

include "../../node_modules/circomlib/circuits/bitify.circom";

/*
 * Possibly generalizable, but for now just flatten a single pubkey from k n-bit chunks to a * single bit array
 * representing the entire pubkey
 *
 */
template FlattenPubkey(numBits, k) {
  signal input chunkedPubkey[2][k];

  signal output pubkeyBits[512];

  // must be able to hold entire pubkey in input
  assert(numBits*k >= 256);

  // convert pubkey to a single bit array
  // - concat x and y coords
  // - convert each register's number to corresponding bit array
  // - concatenate all bit arrays in order

  component chunks2BitsY[k];
  for(var chunk = 0; chunk < k; chunk++){
    chunks2BitsY[chunk] = Num2Bits(numBits);
    chunks2BitsY[chunk].in <== chunkedPubkey[1][chunk];

    for(var bit = 0; bit < numBits; bit++){
        var bitIndex = bit + numBits * chunk;
        if(bitIndex < 256) {
          pubkeyBits[bitIndex] <== chunks2BitsY[chunk].out[bit];
        }
    }
  }

  component chunks2BitsX[k];
  for(var chunk = 0; chunk < k; chunk++){
    chunks2BitsX[chunk] = Num2Bits(numBits);
    chunks2BitsX[chunk].in <== chunkedPubkey[0][chunk];

    for(var bit = 0; bit < numBits; bit++){
        var bitIndex = bit + 256 + (numBits * chunk);
        if(bitIndex < 512) {
          pubkeyBits[bitIndex] <== chunks2BitsX[chunk].out[bit];
        }
    }
  }
}