import { useCallback, useState } from 'react';
import { BoardSquare } from './BoardSquare';
import { Piece } from './Piece';
import { verifierCalldata } from '../zkproof/verifier';
import { getContract } from '../utils/getContract';
import { useRouter } from 'next/router';
import { NumberBox } from './NumberBox';
const buildPoseidon = require('circomlibjs').buildPoseidon;

type Props = {
  gameStartHandler: (text: string) => void;
};

export const InitialBoard: React.FC<Props> = ({ gameStartHandler }) => {
  const router = useRouter();
  const [goodPositions, setGoodPositions] = useState<number[]>([]);

  const clickHandler = async () => {
    gameStartHandler('Create a proof and waiting transaction confirmed.');
    try {
      if (goodPositions.length !== 4) {
        return;
      }
      const { contract } = await getContract();
      const poseidon = await buildPoseidon();
      const F = poseidon.F;

      let binary = '';
      const ghostTypeIndices = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => {
        if (goodPositions.includes(v + 1)) {
          binary = binary + '1';
          return 1;
        } else {
          binary = binary + '0';
          return 0;
        }
      });

      localStorage.setItem(
        'GHOST_TYPE_INDICES',
        JSON.stringify(ghostTypeIndices),
      );

      const salt = Math.floor(Math.random() * 10000000000);

      localStorage.setItem('SALT', salt.toString());

      const v = parseInt(binary, 2);

      const res = poseidon([v, salt]);
      const inputs = {
        pubHash: F.toObject(res),
        ghosts: ghostTypeIndices.reverse(),
        privSalt: salt,
      };
      const input = await verifierCalldata(inputs);
      if (input && input.length > 0) {
        console.log(input[3]);
        const txn = await contract.startGame(
          input[0],
          input[1],
          input[2],
          input[3],
        );

        const tx = await txn.wait();
        gameStartHandler('Transaction Confirmed');
        router.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderSquare = useCallback((i: number) => {
    const x = i % 6;
    const y = Math.floor(i / 6);

    const isSelectable =
      (x === 1 && y === 4) ||
      (x === 2 && y === 4) ||
      (x === 3 && y === 4) ||
      (x === 4 && y === 4) ||
      (x === 1 && y === 5) ||
      (x === 2 && y === 5) ||
      (x === 3 && y === 5) ||
      (x === 4 && y === 5);

    return (
      <div key={i} style={{ width: '16.66%', height: '16.66%' }}>
        <BoardSquare
          x={x}
          y={y}
          isSelected={false}
          isGoal={false}
          isSelectable={isSelectable}
        >
          <Piece isGhost={false} isGoodGhost={false} isOpponent={false} />
        </BoardSquare>
      </div>
    );
  }, []);
  const squares = Array.from(new Array(36), (_, i) => {
    return renderSquare(i);
  });

  const clickNumber = (i: number) => {
    if (goodPositions.includes(i)) {
      const newArray = goodPositions.filter((v: number) => {
        return v !== i;
      });
      setGoodPositions(newArray);
    } else if (goodPositions.length < 4) {
      const newArray = [...goodPositions, i];
      setGoodPositions(newArray);
    }
  };

  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        {squares}
        <div style={{ marginTop: '30px', width: '100%' }}>
          <NumberBox selected={goodPositions} clickHandler={clickNumber} />
          <div onClick={clickHandler} className="button02">
            <a href="#">Start Game</a>
          </div>
        </div>
      </div>
    </>
  );
};
