import { BigNumberish } from 'ethers';
// @ts-ignore
import { groth16 } from 'snarkjs';
// @ts-ignore
import { utils } from 'ffjavascript';
const buildPoseidon = require('circomlibjs').buildPoseidon;

export type Input = {
  recipient: string;
  root: string;
  nullifier: string;
  secret: string;
  pathElements: string[];
  pathIndices: number[];
};

type ProofLocal = {
  pi_a: string[3];
  pi_b: string[3][2];
  pi_c: string[2];
  protocol: string;
  curve: string;
};

export type Proof = {
  a: [BigNumberish, BigNumberish];
  b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
  c: [BigNumberish, BigNumberish];
};

export const generateProof = async (): Promise<Proof> => {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;
  const res = poseidon([240, 111]);
  const input = {
    pubHash: F.toObject(res),
    ghosts: [1, 1, 1, 1, 0, 0, 0, 0].reverse(),
    privSalt: 111,
  };

  let { proof } = await groth16.fullProve(
    utils.stringifyBigInts(input),
    // input,
    './Ghosts.wasm',
    './circuit_final.zkey',
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
};
