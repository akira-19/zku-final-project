import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';

import { connectWallet } from '../utils/connectWallet';
import { checkWalletConnection } from '../utils/checkWalletConnection';
import { claimGhost } from '../utils/claimGhost';
import { balanceOf } from '../utils/balanceOf';
import { getWinner } from '../utils/getWinner';

const style = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const checkWalletIsConnected = async () => {
    try {
      const accounts = await checkWalletConnection();
      const w = await getWinner();
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        setWinner(w);
        const { balance, claimable } = await balanceOf();
        setCurrentBalance(balance);
      } else {
        console.log('No authorized acccount found');
      }
    } catch (error) {
      console.log(error);
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

  const claimGhostHandler = async () => {
    try {
      const initialGhostTypeIndices =
        localStorage.getItem('GHOST_TYPE_INDICES');
      const salt = localStorage.getItem('SALT');
      let decimal = 0;
      const ghostTypeIndices = initialGhostTypeIndices
        ? JSON.parse(initialGhostTypeIndices)
        : [1, 1, 1, 1, 0, 0, 0, 0];
      for (let i = 0; i < 8; i++) {
        const j = 7 - i;
        decimal += ghostTypeIndices[j] * 2 ** i;
      }
      await claimGhost(decimal, Number(salt));
    } catch (err) {
      console.log(err);
    }
  };

  const connectWalletButton = () => {
    return (
      <div className="button01" onClick={connectWalletHandler}>
        <a href="">Connect Wallet</a>
      </div>
    );
  };

  const claimableComponent = () => {
    if (winner == null) {
      return (
        <>
          <div className="button01">
            <Link href="/ghosts">
              <a>Game Start</a>
            </Link>
          </div>
          <p>Current GST balance: {currentBalance}</p>
        </>
      );
    } else if (
      currentAccount &&
      winner.toLowerCase() == currentAccount.toLowerCase()
    ) {
      return (
        <>
          <div className="button01">
            <button onClick={claimGhostHandler}>Claim GST</button>
          </div>
          <p>Current GST balance: {currentBalance}</p>
        </>
      );
    } else {
      return (
        <>
          <div className="button01">
            <p>Wait for the opponent completes the game.</p>
          </div>
          <p>Current GST balance: {currentBalance}</p>
        </>
      );
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
      <div style={style}>
        {currentAccount ? (
          <div className="main-app">
            <h1 style={{ fontSize: '60px', color: 'white', marginTop: '75px' }}>
              Ghosts
            </h1>
            <div>{claimableComponent()}</div>
          </div>
        ) : (
          <div className="main-app">
            <h1 style={{ fontSize: '60px', color: 'white', marginTop: '75px' }}>
              Ghosts
            </h1>
            <div>{connectWalletButton()}</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
