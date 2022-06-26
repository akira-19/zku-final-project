const { expect } = require('chai');
const { ethers } = require('hardhat');
const fs = require('fs');
const { groth16 } = require('snarkjs');
const buildPoseidon = require('circomlibjs').buildPoseidon;

function unstringifyBigInts(o) {
  if (typeof o == 'string' && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == 'string' && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == 'object') {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}

describe.only('Ghosts', function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory('Verifier');
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it('Should return true for correct proof', async function () {
    // Create a proof, which is used for verifying the prover knows
    const poseidon = await buildPoseidon();
    const F = poseidon.F;
    const res = poseidon([240, 111]);
    const input = {
      pubHash: F.toObject(res),
      ghosts: [1, 1, 1, 1, 0, 0, 0, 0].reverse(),
      privSalt: 111,
    };
    const { proof, publicSignals } = await groth16.fullProve(
      input,
      'circuits/Ghosts_js/Ghosts.wasm',
      'circuits/circuit_final.zkey',
    );

    // convert proof and publicSignals into solidity-readable calldata
    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals,
    );

    // convert the calldata into big integers
    const argv = calldata
      .replace(/["[\]\s]/g, '')
      .split(',')
      .map((x) => BigInt(x).toString());

    // output log
    console.log(argv);

    // convert the argv into the format which is accepted solidity smart contract
    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    // verify the proof
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });
  // it('Should return false for invalid proof', async function () {
  //   let a = [0, 0];
  //   let b = [
  //     [0, 0],
  //     [0, 0],
  //   ];
  //   let c = [0, 0];
  //   let d = [0];
  //   expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  // });
});
