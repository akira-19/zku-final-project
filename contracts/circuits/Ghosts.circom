pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

template Ghosts() {
   // Public inputs
   signal input pubHash;

   // Private inputs
   signal input ghosts[8];
   signal input privSalt;

   // Output
   signal output hashOut;

   var inputSum = 0;

   for (var i=0; i<8; i++) {
      inputSum += ghosts[i];
   }
   inputSum === 4;

   var num;
   component bit2num = Bits2Num(8);
   component poseidon = Poseidon(2);

   for (var i=0; i<8; i++) {
      bit2num.in[i] <== ghosts[i];
   }

   num = bit2num.out;

   poseidon.inputs[0] <== num;
   poseidon.inputs[1] <== privSalt;

   hashOut <== poseidon.out;
   pubHash === hashOut;
}

component main {public [pubHash]} = Ghosts();