import { getGSTCoinContract } from './getGSTCoinContract';

export const balanceOf = async () => {
  const { contract, account } = await getGSTCoinContract();

  const isClaimed = await contract.isClaimed(account);
  const balance = await contract.balanceOf(account);

  console.log(isClaimed);
  console.log(balance.toNumber());

  return {
    balance: balance.toNumber(),
    claimable: !isClaimed,
  };
};
