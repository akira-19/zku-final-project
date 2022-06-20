const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Ghosts', function () {
  let ghosts;
  let player1;
  let player2;

  beforeEach(async () => {
    [player1, player2] = await ethers.getSigners();
    const Ghosts = await ethers.getContractFactory('Ghosts');
    ghosts = await Ghosts.deploy();
    await ghosts.deployed();
  });

  describe('start game function', function () {
    it('should start a game', async function () {
      await ghosts.startGame();
      const game = await ghosts.playingGame(player1.address);
      expect(game).not.equal(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      );
    });
  });
});
