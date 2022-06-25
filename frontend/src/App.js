import { useMemo } from 'react';
import { Game } from './Game';
import { Board } from './components/Board';

const containerStyle = {
  width: 500,
  height: 500,
  border: '1px solid gray',
};
const App = () => {
  const game = useMemo(() => new Game([0, 0, 0, 0, 1, 1, 1, 1]), []);
  return (
    <div style={containerStyle}>
      <Board game={game} />
    </div>
  );
};

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

export default App;
