import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, providers } from 'ethers';
import GSTCoinContract from '../../public/GSTCoin.json';

export const getGSTCoinContract = async () => {
  const contractAddress = '0x9A5741235370E407F82F84865FA20f89A2ec641c';
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
