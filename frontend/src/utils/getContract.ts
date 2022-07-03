import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, providers } from 'ethers';
import GhostsContract from '../../public/Ghosts.json';

export const getContract = async () => {
  const contractAddress = '0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690';
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
    GhostsContract.abi,
    signer,
  );
  return {
    contract: contract,
    account: accounts[0],
  };
};
