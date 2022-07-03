import { getGSTCoinContract } from './getGSTCoinContract';

export const claimGhost = async () => {
  const { contract } = await getGSTCoinContract();

  try {
    const res = await contract.claim();
  } catch (error) {
    console.log(error);
  }
};
