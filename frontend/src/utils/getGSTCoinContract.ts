import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, providers } from 'ethers';
import GSTCoinContract from '../../public/GSTCoin.json';

export const getGSTCoinContract = async () => {
  // devnet
  // const contractAddress = '0x9A5741235370E407F82F84865FA20f89A2ec641c';

  // local
  // const contractAddress = '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8';

  // prd
  const contractAddress = '0xF73C360518Ebede718a3590A88b287aDe3D229F9';
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
