import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, providers } from 'ethers';
import GhostsContract from '../../public/Ghosts.json';

export const getContract = async () => {
  const contractAddress = '0x6CF047325F32F8A261Fe6738D3b2c81F3aBADE5A';
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
