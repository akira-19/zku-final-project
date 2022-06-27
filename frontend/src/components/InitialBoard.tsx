import { useCallback, useState } from 'react';
import { BoardSquare } from './BoardSquare';
import { Piece } from './Piece';
import { verifierCalldata } from '../zkproof/verifier';
import { getContract } from '../utils/getContract';
const buildPoseidon = require('circomlibjs').buildPoseidon;

export const InitialBoard = () => {
  const [positions, setPositions] = useState<('' | number)[]>([]);
  const inputHandler = (idx: number, num: number) => {
    if (positions.includes(num) || (num < 0 && num > 7)) {
      const newPositions = positions;
      newPositions[idx] = '';
      setPositions(newPositions);
    } else {
      const newPositions = positions;
      newPositions[idx] = num;
      setPositions(newPositions);
    }
  };

  const clickHandler = async () => {
    const { contract } = await getContract();
    const poseidon = await buildPoseidon();
    const F = poseidon.F;

    let binary = '';
    const ghostTypeIndices = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => {
      if (positions.includes(v + 1)) {
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

    const v = parseInt(binary, 2);

    const res = poseidon([v, 111]);
    const inputs = {
      pubHash: F.toObject(res),
      ghosts: ghostTypeIndices.reverse(),
      privSalt: 111,
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

      console.log(txn);
      const tx = await txn.wait();
      console.log(tx);
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
        <div style={{ marginTop: '20px' }}>
          <input
            className={'good_input'}
            value={positions[0]}
            onChange={(e) => inputHandler(0, parseInt(e.target.value))}
          />
          <input
            className={'good_input'}
            value={positions[1]}
            onChange={(e) => inputHandler(1, parseInt(e.target.value))}
          />
          <input
            className={'good_input'}
            value={positions[2]}
            onChange={(e) => inputHandler(2, parseInt(e.target.value))}
          />
          <input
            className={'good_input'}
            value={positions[3]}
            onChange={(e) => inputHandler(3, parseInt(e.target.value))}
          />
          <button onClick={clickHandler}>Start Game</button>
        </div>
      </div>
    </>
  );
};
