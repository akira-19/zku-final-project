import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, providers } from 'ethers';
import GSTCoinContract from '../../public/GSTCoin.json';

export const getGSTCoinContract = async () => {
  const contractAddress = '0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E';
  const provider = (await detectEthereumProvider()) as any;
  if (!provider) {
    alert('please install metamask');
  }
  const accounts = await provider.request({
    method: 'eth_requestAccounts',
  });
  const ethersProvider = new providers.Web3Provider(provider);
  const signer = ethersProvider.getSigner();
  const contract = new ethers.Contract(
    contractAddress,
    GSTCoinContract.abi,
    signer,
  );
  return {
    contract: contract,
    account: accounts[0],
  };
};
