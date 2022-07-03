import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';

import { connectWallet } from '../utils/connectWallet';
import { checkWalletConnection } from '../utils/checkWalletConnection';
import { claimGhost } from '../utils/claimGhost';
import { balanceOf } from '../utils/balanceOf';

const style = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);

  const checkWalletIsConnected = async () => {
    try {
      const accounts = await checkWalletConnection();
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setCurrentAccount(account);
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
      await claimGhost();
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
