import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { Board } from '../components/Board';
import { getContract } from '../utils/getContract';
import { checkOngoingGame } from '../utils/checkOngoingGame';
import { ethers } from 'ethers';
import { InitialBoard } from '../components/InitialBoard';
import { useRouter } from 'next/router';
import { checkWalletConnection } from '../utils/checkWalletConnection';

const style = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
};

const statusStyle = {
  width: 500,
  fontSize: '30px',
  color: 'white',
  marginTop: '60px',
};
const containerStyle = {
  width: 500,
  height: 500,
  border: '1px solid gray',
  marginTop: '30px',
};

export default function Ghosts() {
  const router = useRouter();
  const [status, setStatus] = useState('Waiting ...');
  const [element, setElement] = useState(<div></div>);

  const gameStartHandler = (text: string) => {
    setStatus(text);
  };

  useEffect(() => {
    const f = async () => {
      try {
        const { contract, account } = await getContract();

        const accounts = await checkWalletConnection();

        if (!accounts || accounts.length === 0) {
          router.push('/');
          return;
        }

        const game = await checkOngoingGame(contract, account);
        if (game !== ethers.constants.HashZero) {
          const filter = contract.filters.Winner(game, null);

          contract.on(filter, (_, winnerAddress) => {
            if (winnerAddress.toLowerCase() == account.toLowerCase()) {
              alert('You won! Claim you GSTCoin');
              router.push('/');
            } else {
              alert('You lost...');
              router.push('/');
            }
          });

          const turnFilter = contract.filters.TurnStart(game, null);
          contract.on(turnFilter, (_, turnUserAddress) => {
            if (turnUserAddress == account) {
              router.reload();
            }
          });

          const player = await contract.players(game, 1);
          if (player !== ethers.constants.AddressZero) {
            const turnPlayer = await contract.turnPlayer(game);
            if (turnPlayer.toLowerCase() == account.toLowerCase()) {
              setStatus('Your Turn');
            }
          } else {
            setStatus('Waiting another player joining.');
          }

          setElement(<Board />);
        } else {
          setStatus(
            'Select initial good ghosts positions from light blue squares.',
          );
          setElement(<InitialBoard gameStartHandler={gameStartHandler} />);
        }
      } catch (error) {
        console.error(error);
      }
    };
    f();
  }, []);

  return (
    <Layout home>
      <Head>
        <title>Ghosts</title>
      </Head>
      <div style={style}>
        <div>
          <div style={statusStyle}>{status}</div>
          <div style={containerStyle}>{element}</div>
        </div>
      </div>
    </Layout>
  );
}
