import detectEthereumProvider from '@metamask/detect-provider';

export const checkWalletConnection = async () => {
  try {
    const provider = (await detectEthereumProvider()) as any;

    const accounts = await provider.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      return accounts;
    } else {
      console.log('No authorized acccount found');
    }
  } catch (error) {
    console.log(error);
  }
};
