import { getContract } from './getContract';

export const claimGhost = async (v: number, salt: number) => {
  const { contract } = await getContract();

  try {
    const res = await contract.claimGstCoin(v, salt);
  } catch (error) {
    console.log(error);
  }
};
