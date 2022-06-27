import { useEffect, useState } from 'react';
import { Board } from '../components/Board';
import { getContract } from '../utils/getContract';
import { checkOngoingGame } from '../utils/checkOngoingGame';
import { ethers } from 'ethers';
import { InitialBoard } from '../components/InitialBoard';

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

const Ghosts = () => {
  const [status, setStatus] = useState('Waiting ...');
  const [element, setElement] = useState(<div></div>);

  // useEffect(() => {
  //   const contract = new Contract(tokenAddress, abi, provider);
  //   const filter = contract.filters.Transfer(myAddress, null, null)
  //   contract.on(filter, (from, to, amount) => {
  //     console.log(`send to:  ${to} ${amount}`)
  //   })
  // , []}

  useEffect(() => {
    const f = async () => {
      const { contract, account } = await getContract();
      const game = await checkOngoingGame(contract, account);
      if (game !== ethers.constants.HashZero) {
        const filter = contract.filters.Winner(game, null);
        contract.on(filter, (game, winnerAddress) => {
          if (winnerAddress.toLowerCase() == account.toLowerCase()) {
            alert('You won!');
          } else {
            alert('You lost...');
          }
        });
        const player = await contract.players(game, 1);
        if (player !== ethers.constants.AddressZero) {
          const turnPlayer = await contract.turnPlayer(game);
          if (turnPlayer.toLowerCase() == account.toLowerCase()) {
            setStatus('Your Turn');
          }
        } else {
          setStatus('Waiting another player.');
        }

        setElement(<Board />);
      } else {
        setStatus(
          'Select initial good ghosts positions from light blue squares.',
        );
        setElement(<InitialBoard />);
      }
    };
    f();
  }, []);

  return (
    <div>
      <div style={statusStyle}>{status}</div>
      <div style={containerStyle}>{element}</div>
    </div>
  );
};

export default Ghosts;
