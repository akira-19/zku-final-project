import detectEthereumProvider from '@metamask/detect-provider';
import { providers } from 'ethers';

export const connectWallet = async () => {
  try {
    const provider = (await detectEthereumProvider()) as any;
    if (!provider) {
      alert('please install metamask');
    }
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const message = await signer.signMessage(
      'Sign this message to create your identity!',
    );

    return accounts;
  } catch (err) {
    console.log(err);
  }
};
