import { BigNumberish } from 'ethers';
// @ts-ignore
import { groth16 } from 'snarkjs';
const buildPoseidon = require('circomlibjs').buildPoseidon;
// import { buildPoseidon } from 'circomlibjs';

// const unstringifyBigInts = (o) => {
//   if (typeof o == 'string' && /^[0-9]+$/.test(o)) {
//     return BigInt(o);
//   } else if (typeof o == 'string' && /^0x[0-9a-fA-F]+$/.test(o)) {
//     return BigInt(o);
//   } else if (Array.isArray(o)) {
//     return o.map(unstringifyBigInts);
//   } else if (typeof o == 'object') {
//     if (o === null) return null;
//     const res = {};
//     const keys = Object.keys(o);
//     keys.forEach((k) => {
//       res[k] = unstringifyBigInts(o[k]);
//     });
//     return res;
//   } else {
//     return o;
//   }
// };

type ProofLocal = {
  pi_a: string[3];
  pi_b: string[3][2];
  pi_c: string[2];
  protocol: string;
  curve: string;
};

export const groth16verifier = async (verifierContract) => {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  const res = poseidon([240, 111]);

  const input = {
    pubHash: F.toObject(res),
    ghosts: [1, 1, 1, 1, 0, 0, 0, 0].reverse(),
    privSalt: 111,
  };

  let { proof } = await groth16.fullProve(
    input,
    '../public/zkproof/Ghosts.wasm',
    '../public/zkproof/circuit_final.zkey',
  );

  proof = proof as ProofLocal;

  return {
    a: [proof.pi_a[0], proof.pi_a[1]] as [BigNumberish, BigNumberish],
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ] as [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
    c: [proof.pi_c[0], proof.pi_c[1]] as [BigNumberish, BigNumberish],
  };

  // output log
  // console.log('1x2 =', publicSignals[0]);

  // // convert proof and publicSignals into solidity-readable calldata
  // const editedPublicSignals = unstringifyBigInts(publicSignals);
  // const editedProof = unstringifyBigInts(proof);
  // const calldata = await groth16.exportSolidityCallData(
  //   editedProof,
  //   editedPublicSignals,
  // );

  // // convert the calldata into big integers
  // const argv = calldata
  //   .replace(/["[\]\s]/g, '')
  //   .split(',')
  //   .map((x) => BigInt(x).toString());

  // // output log
  // console.log(argv);

  // // convert the argv into the format which is accepted solidity smart contract
  // const a = [argv[0], argv[1]];
  // const b = [
  //   [argv[2], argv[3]],
  //   [argv[4], argv[5]],
  // ];
  // const c = [argv[6], argv[7]];
  // const Input = argv.slice(8);

  // await verifierContract.verifyProof(a, b, c, Input);
};
