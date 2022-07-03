import { ethers } from 'ethers';
export const checkOngoingGame = async (
  contract: ethers.Contract,
  account: any,
) => {
  try {
    const playingGame = await contract.playingGame(account);
    return playingGame;
  } catch (error) {
    console.error(error);
  }
};
