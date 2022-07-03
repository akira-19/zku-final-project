import { getContract } from './getContract';
import { ethers } from 'ethers';

export const getWinner = async () => {
  try {
    const { contract, account } = await getContract();
    const playingGame = await contract.playingGame(account);
    if (playingGame === ethers.constants.HashZero) {
      return null;
    }
    const res = await contract.winner(playingGame);
    if (res === ethers.constants.AddressZero) {
      return null;
    } else {
      return res;
    }
  } catch (error) {
    console.log(error);
  }
};
