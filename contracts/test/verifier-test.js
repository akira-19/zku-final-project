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

describe.only('Ghosts test', function () {
  let poseidon;
  let F;

  this.timeout(100000);

  before(async () => {
    poseidon = await buildPoseidon();
    F = poseidon.F;
  });

  it('Should create ghost circuit', async () => {
    const circuit = await wasm_tester(resolve('./circuits/Ghosts.circom'));
    const res = poseidon([240, 111]);

    let witness;
    witness = await circuit.calculateWitness(
      {
        ghosts: [1, 1, 1, 1, 0, 0, 0, 0].reverse(),
        pubHash: F.toObject(res),
        privSalt: 111,
      },
      true,
    );

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert(F.eq(F.e(witness[1]), F.e(res)));
    await circuit.assertOut(witness, { hashOut: F.toObject(res) });
    await circuit.checkConstraints(witness);
  });
});
