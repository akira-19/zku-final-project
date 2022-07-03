const { expect } = require('chai');
const { ethers } = require('hardhat');
const { groth16 } = require('snarkjs');
const { poseidonContract } = require('circomlibjs');

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
  let ghosts;
  let player1;
  let player2;
  let a;
  let b;
  let c;
  let Input;

  beforeEach(async () => {
    [player1, player2] = await ethers.getSigners();
    const Verifier = await ethers.getContractFactory('Verifier');
    verifier = await Verifier.deploy();

    const PoseidonT3 = await ethers.getContractFactory(
      poseidonContract.generateABI(2),
      poseidonContract.createCode(2),
    );
    const poseidonT3 = await PoseidonT3.deploy();
    await poseidonT3.deployed();

    const Ghosts = await ethers.getContractFactory('Ghosts', {
      libraries: {
        PoseidonT3: poseidonT3.address,
      },
    });
    ghosts = await Ghosts.deploy(verifier.address);
    await ghosts.deployed();

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

    // convert the argv into the format which is accepted solidity smart contract
    a = [argv[0], argv[1]];
    b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    c = [argv[6], argv[7]];
    Input = argv.slice(8);
  });

  describe.only('start game function', function () {
    it('should start a game', async function () {
      await ghosts.startGame(a, b, c, Input);
      const game = await ghosts.playingGame(player1.address);
      expect(game).not.equal(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      );
    });

    it('should join a game', async function () {
      await ghosts.startGame(a, b, c, Input);
      await ghosts.connect(player2).startGame(a, b, c, Input);
      const game = await ghosts.playingGame(player2.address);
      expect(game).not.equal(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      );
    });
  });

  describe('move function', function () {
    beforeEach(async () => {
      await ghosts.startGame(a, b, c, Input);
      await ghosts.connect(player2).startGame(a, b, c, Input);
    });

    it('should move a piece', async function () {
      await ghosts.connect(player1).move(0, 1, 3);
      const game = await ghosts.playingGame(player1.address);
      const pieceX = await ghosts.pieces(game, player1.address, 0, 0);
      const pieceY = await ghosts.pieces(game, player1.address, 0, 1);
      expect(pieceX).to.equal(1);
      expect(pieceY).to.equal(3);
    });

    it('should revert moving a piece when not my turn', async function () {
      await expect(ghosts.connect(player2).move(0, 1, 2)).to.be.revertedWith(
        'must be your turn.',
      );
    });

    it('should revert moving a piece when moving 2 squares', async function () {
      await expect(ghosts.connect(player1).move(0, 1, 2)).to.be.revertedWith(
        'must be movable.',
      );
    });
    it('should revert moving a piece when moving to my own piece on it', async function () {
      await expect(ghosts.connect(player1).move(0, 2, 4)).to.be.revertedWith(
        'must be movable.',
      );
    });
    it('should revert moving a piece when moving to the same square', async function () {
      await expect(ghosts.connect(player1).move(0, 1, 4)).to.be.revertedWith(
        'must be movable.',
      );
    });
  });

  describe('get opponent piece in move function', function () {
    beforeEach(async () => {
      await ghosts.startGame(a, b, c, Input);
      await ghosts.connect(player2).startGame(a, b, c, Input);
      await ghosts.connect(player1).move(0, 1, 3);
      await ghosts.connect(player2).move(4, 1, 2);
      await ghosts.connect(player1).move(0, 1, 2);
    });

    it('should set piece location is 10, 10', async function () {
      const game = await ghosts.playingGame(player1.address);
      const pieceX = await ghosts.pieces(game, player2.address, 4, 0);
      const pieceY = await ghosts.pieces(game, player2.address, 4, 1);
      expect(pieceX).to.equal(10);
      expect(pieceY).to.equal(10);
    });

    it('should set piece status is 10', async function () {
      const game = await ghosts.playingGame(player1.address);
      const status = await ghosts.pieceStatuses(game, player2.address, 4);
      expect(status).to.equal(10);
    });
  });

  describe('move function with need reveal piece', function () {
    beforeEach(async () => {
      await ghosts.startGame(a, b, c, Input);
      await ghosts.connect(player2).startGame(a, b, c, Input);
      await ghosts.connect(player1).move(0, 1, 3);
      await ghosts.connect(player2).move(4, 1, 2);
      await ghosts.connect(player1).move(0, 1, 2);
    });

    it('should revert moving a piece when moving with need reveal piece', async function () {
      await expect(ghosts.connect(player2).move(0, 1, 1)).to.be.revertedWith(
        'need to reveal your piece.',
      );
    });
  });

  describe('revealPiece function', function () {
    beforeEach(async () => {
      await ghosts.startGame(a, b, c, Input);
      await ghosts.connect(player2).startGame(a, b, c, Input);
      await ghosts.connect(player1).move(0, 1, 3);
      await ghosts.connect(player2).move(4, 1, 2);
      await ghosts.connect(player1).move(0, 1, 2);
    });

    it('should succeed', async function () {
      const game = await ghosts.playingGame(player1.address);
      await ghosts.connect(player2).revealPiece(4, 0);
      const status = await ghosts.pieceStatuses(game, player2.address, 4);
      expect(status).to.equal(0);
    });

    it('should fail when not status 10', async function () {
      await expect(
        ghosts.connect(player2).revealPiece(3, 0),
      ).to.be.revertedWith('must be need reveal status.');
    });

    it('should fail when not 0 or 1', async function () {
      await expect(
        ghosts.connect(player2).revealPiece(4, 2),
      ).to.be.revertedWith('must be zero or one.');
    });

    describe('checkWinnerAfterReveal function in revealPiece function', function () {
      describe('get evil ghosts', function () {
        beforeEach(async () => {
          await ghosts.connect(player2).revealPiece(4, 0);

          // Player2's all pieces set in front of Player1's
          await ghosts.connect(player2).move(5, 2, 2);
          await ghosts.connect(player1).move(1, 2, 3);
          await ghosts.connect(player2).move(6, 3, 2);
          await ghosts.connect(player1).move(2, 3, 3);
          await ghosts.connect(player2).move(7, 4, 2);
          await ghosts.connect(player1).move(3, 4, 3);

          // Player2 moves not related pieces and Player1 gets Player2's all pieces
          await ghosts.connect(player2).move(1, 2, 1);
          await ghosts.connect(player1).move(1, 2, 2);
          await ghosts.connect(player2).revealPiece(5, 0);

          await ghosts.connect(player2).move(1, 2, 0);
          await ghosts.connect(player1).move(2, 3, 2);
          await ghosts.connect(player2).revealPiece(6, 0);

          await ghosts.connect(player2).move(1, 2, 1);
          await ghosts.connect(player1).move(3, 4, 2);
          await ghosts.connect(player2).revealPiece(7, 0);
        });
        it('should set winner player2', async function () {
          const game = await ghosts.playingGame(player1.address);
          const winner = await ghosts.winner(game);
          expect(winner).to.equal(player2.address);
          // const playingGame1 = await ghosts.playingGame(player1.address);
          // const playingGame2 = await ghosts.playingGame(player2.address);

          // expect(playingGame1).to.equal(
          //   '0x0000000000000000000000000000000000000000000000000000000000000000',
          // );
          // expect(playingGame2).to.equal(
          //   '0x0000000000000000000000000000000000000000000000000000000000000000',
          // );
        });
      });
      describe('get good ghosts', function () {
        beforeEach(async () => {
          await ghosts.connect(player2).revealPiece(4, 1);

          // Player2's all pieces set in front of Player1's
          await ghosts.connect(player2).move(5, 2, 2);
          await ghosts.connect(player1).move(1, 2, 3);
          await ghosts.connect(player2).move(6, 3, 2);
          await ghosts.connect(player1).move(2, 3, 3);
          await ghosts.connect(player2).move(7, 4, 2);
          await ghosts.connect(player1).move(3, 4, 3);

          // Player2 moves not related pieces and Player1 gets Player2's all pieces
          await ghosts.connect(player2).move(1, 2, 1);
          await ghosts.connect(player1).move(1, 2, 2);
          await ghosts.connect(player2).revealPiece(5, 1);

          await ghosts.connect(player2).move(1, 2, 0);
          await ghosts.connect(player1).move(2, 3, 2);
          await ghosts.connect(player2).revealPiece(6, 1);

          await ghosts.connect(player2).move(1, 2, 1);
          await ghosts.connect(player1).move(3, 4, 2);
          await ghosts.connect(player2).revealPiece(7, 1);
        });
        it('should set winner player1', async function () {
          const game = await ghosts.playingGame(player1.address);
          const winner = await ghosts.winner(game);
          expect(winner).to.equal(player1.address);
          // const playingGame1 = await ghosts.playingGame(player1.address);
          // const playingGame2 = await ghosts.playingGame(player2.address);
          // expect(playingGame1).to.equal(
          //   '0x0000000000000000000000000000000000000000000000000000000000000000',
          // );
          // expect(playingGame2).to.equal(
          //   '0x0000000000000000000000000000000000000000000000000000000000000000',
          // );
        });
      });
    });
  });
});

// function revealPiece(uint8 idx, uint8 status) public isMyTurn {
//   require(
//       pieceStatuses[playingGame[msg.sender]][msg.sender][idx] == 10,
//       "must be need reveal status."
//   );
//   require(status == 0 || status == 1, "must be zero or one.");
//   pieceStatuses[playingGame[msg.sender]][msg.sender][idx] = status;
//   checkWinnerAfterReveal();
// }
