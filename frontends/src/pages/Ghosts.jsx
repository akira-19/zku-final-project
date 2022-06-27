import React, { useState } from 'react';
// import './App.css';

const snarkjs = require('snarkjs');

// const poseidon = require('circomlibjs').poseidon;

// const getSolidityProofArray = (proof) => {
//   let proofList = [
//     proof['pi_a'][0],
//     proof['pi_a'][1],
//     proof['pi_b'][0][1],
//     proof['pi_b'][0][0],
//     proof['pi_b'][1][1],
//     proof['pi_b'][1][0],
//     proof['pi_c'][0],
//     proof['pi_c'][1],
//   ];
//   return proofList;
// };

const makeProof = async (_proofInput, _wasm, _zkey) => {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    _proofInput,
    _wasm,
    _zkey,
  );
  return { proof, publicSignals };
};

const verifyProof = async (_verificationkey, signals, proof) => {
  const vkey = await fetch(_verificationkey).then(function (res) {
    return res.json();
  });

  const res = await snarkjs.groth16.verify(vkey, signals, proof);
  return res;
};

function Ghosts() {
  const [proof, setProof] = useState('');
  const [signals, setSignals] = useState('');
  const [isValid, setIsValid] = useState(false);

  let wasmFile = 'http://localhost:8000/Ghosts.wasm';
  let zkeyFile = 'http://localhost:8000/circuit_final.zkey';
  let verificationKey = 'http://localhost:8000/verification_key.json';

  const runProofs = async () => {
    // let poseidon;
    // let F;
    const buildPoseidon = require('circomlibjs').buildPoseidon;
    const poseidon = await buildPoseidon();
    const F = poseidon.F;

    const res = poseidon([240, 111]);
    // const res = poseidon([240, 111]).toString();
    const proofInput = {
      ghosts: [1, 1, 1, 1, 0, 0, 0, 0],
      pubHash: F.toObject(res),
      // pubHash: res,
      privSalt: 111,
    };

    makeProof(proofInput, wasmFile, zkeyFile).then(
      ({ proof: _proof, publicSignals: _signals }) => {
        setProof(JSON.stringify(_proof, null, 2));
        setSignals(JSON.stringify(_signals, null, 2));
        verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
          setIsValid(_isValid);
        });
      },
    );
  };

  return (
    <div>
      <header className="App-header">
        <button onClick={runProofs}>Generate Proof</button>
        Proof: <p>{proof}</p>
        Signals: <p>{signals}</p>
        Result:
        {proof.length > 0 && <p>{isValid ? 'Valid proof' : 'Invalid proof'}</p>}
      </header>
    </div>
  );
}

export default Ghosts;
