import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, providers, BigNumber } from 'ethers';
import GhostsContract from '../../public/Ghosts.json';
import { verifierCalldata } from '../zkproof/verifier';
import { connectWallet } from '../utils/connectWallet';
import { checkWalletConnection } from '../utils/checkWalletConnection';
import Ghosts from './Ghosts';

const buildPoseidon = require('circomlibjs').buildPoseidon;

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletIsConnected = async () => {
    const accounts = await checkWalletConnection();

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
    } else {
      console.log('No authorized acccount found');
    }
  };

  const connectWalletHandler = async () => {
    try {
      const accounts = await connectWallet();

      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const connectWalletButton = () => {
    return (
      <button
        onClick={connectWalletHandler}
        className="cta-button connect-wallet-button"
      >
        Connect Wallet
      </button>
    );
  };

  const startGameButton = () => {
    return (
      <button
        onClick={() => {
          alert(currentAccount);
        }}
        className="cta-button mint-nft-button"
      >
        Start Game
      </button>
    );
  };

  const verify = async () => {
    const contractAddress = '0xe8083f082a68aB2BD956b508A6baBaa9967E3afF';
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
    const poseidon = await buildPoseidon();
    const F = poseidon.F;
    const ress = poseidon([240, 111]);
    const inputs = {
      pubHash: F.toObject(ress),
      ghosts: [1, 1, 1, 1, 0, 0, 0, 0].reverse(),
      privSalt: 111,
    };
    const input = await verifierCalldata(inputs);
    if (input && input.length > 0) {
      let txn = await contract.startGame(
        input[0],
        input[1],
        input[2],
        input[3],
      );
      console.log(txn);
      let tx = await txn.wait();
      console.log(tx);
    }
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);
  return (
    <Layout home>
      <Head>
        <title>Ghosts</title>
      </Head>
      <div>
        {/* <div className="main-app">
          <h1>Ghosts</h1>
          <div>{connectWalletButton()}</div>
          <button onClick={verify}>Verify</button>
        </div> */}
        {currentAccount ? (
          <Ghosts />
        ) : (
          <div className="main-app">
            <h1>Ghosts</h1>
            <div>{connectWalletButton()}</div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// import { useEffect, useState } from 'react';
// import './App.css';
// import Ghosts from './pages/Ghosts';
// // import contract from './contracts/NFTCollectible.json';

// // const contractAddress = '0x355638a4eCcb777794257f22f50c289d4189F245';
// // const abi = contract.abi;

// function App() {
//   const [currentAccount, setCurrentAccount] = useState(null);

//   const checkWalletIsConnected = async () => {
//     const { ethereum } = window;

//     if (!ethereum) {
//       console.log('Make sure you have metamask installed');
//       return;
//     } else {
//       console.log("Wallet exists! We're ready to go");
//     }

//     const accounts = await ethereum.request({ method: 'eth_accounts' });

//     if (accounts.length !== 0) {
//       const account = accounts[0];
//       setCurrentAccount(account);
//     } else {
//       console.log('No authorized acccount found');
//     }
//   };

//   const connectWalletHandler = async () => {
//     const { ethereum } = window;

//     if (!ethereum) {
//       alert('please install metamask');
//     }
//     try {
//       const accounts = await ethereum.request({
//         method: 'eth_requestAccounts',
//       });
//       setCurrentAccount(accounts[0]);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const connectWalletButton = () => {
//     return (
//       <button
//         onClick={connectWalletHandler}
//         className="cta-button connect-wallet-button"
//       >
//         Connect Wallet
//       </button>
//     );
//   };

//   const startGameButton = () => {
//     return (
//       <button
//         onClick={() => {
//           alert(currentAccount);
//         }}
//         className="cta-button mint-nft-button"
//       >
//         Start Game
//       </button>
//     );
//   };

//   useEffect(() => {
//     checkWalletIsConnected();
//   }, []);

//   return (
//     <>
//       {currentAccount ? (
//         <Ghosts />
//       ) : (
//         <div className="main-app">
//           <h1>Ghosts</h1>
//           <div>{connectWalletButton()}</div>
//         </div>
//       )}
//     </>
//   );
// }
