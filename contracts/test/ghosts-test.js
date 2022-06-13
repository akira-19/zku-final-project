const chai = require('chai');
const { resolve } = require('path');
const F1Field = require('ffjavascript').F1Field;
const Scalar = require('ffjavascript').Scalar;
exports.p = Scalar.fromString(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617',
);
const Fr = new F1Field(exports.p);

const wasm_tester = require('circom_tester').wasm;
const buildPoseidon = require('circomlibjs').buildPoseidon;

const assert = chai.assert;

describe('Ghosts test', function () {
  let poseidon;
  let F;
  // let circuit6;
  // let circuit3;

  this.timeout(100000);

  before(async () => {
    poseidon = await buildPoseidon();
    F = poseidon.F;
    // circuit6 = await wasm_tester(
    //   path.join(__dirname, 'circuits', 'poseidon6_test.circom'),
    // );
    // circuit3 = await wasm_tester(
    //   path.join(__dirname, 'circuits', 'poseidon3_test.circom'),
    // );
  });
  // after(async () => {
  //   globalThis.curve_bn128.terminate();
  // });

  it('Should create ghost circuit', async () => {
    const circuit = await wasm_tester(
      // path.join(__dirname, 'circuits', 'MastermindVariation.circom'),
      resolve('./contracts/circuits/MastermindVariation.circom'),
    );

    const res = poseidon([111, 5, 7, 6]);

    let witness;
    witness = await circuit.calculateWitness(
      {
        pubGuessA: 3,
        pubGuessB: 4,
        pubGuessC: 9,
        privSolnA: 5,
        privSolnB: 7,
        privSolnC: 6,
        pubNumHit: 0,
        pubNumBlow: 0,
        pubSolnHash: F.toObject(res),
        privSalt: 111,
      },
      true,
    );

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert(F.eq(F.e(witness[1]), F.e(res)));
    await circuit.assertOut(witness, { solnHashOut: F.toObject(res) });
    await circuit.checkConstraints(witness);
  });
});
