import { useCallback, useEffect, useState } from 'react';
import { BoardSquare } from './BoardSquare';
import { Piece } from './Piece';
import { checkMovable } from '../utils/checkMovable';
import { moveGhost } from '../utils/moveGhost';

const initialPositions = [
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
];

const initialOpponentPositions = [
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [1, 1],
  [2, 1],
  [3, 1],
  [4, 1],
];

const initialGhostTypeIndices = [1, 1, 1, 1, 0, 0, 0, 0];

export const Board = () => {
  const [positions, setPositions] = useState(initialPositions);
  const [opponentPositions, setOpponentPositions] = useState(
    initialOpponentPositions,
  );
  const [selected, setSelected] = useState<number | null>(null);
  const ghostTypeIndices = initialGhostTypeIndices;

  const ghostClickHandler = (currentIdx: number | null, toIdx: number) => {
    if (currentIdx) {
      if (checkMovable(positions, toIdx, currentIdx)) {
        const newPositions = moveGhost(positions, currentIdx, toIdx);
        setPositions(newPositions);
      } else {
        setSelected(null);
      }
    } else {
      setSelected(toIdx);
    }
  };

  const renderSquare = useCallback(
    (i: number, ps: any, ghostTypeIndices: number[], opponents: any) => {
      const x = i % 6;
      const y = Math.floor(i / 6);

      let isGoodGhost = false;
      const isGhost = ps.some((v: any, j: number) => {
        if (JSON.stringify(v) === JSON.stringify([x, y])) {
          isGoodGhost = ghostTypeIndices[j] === 1 ? true : false;
          return true;
        }
        return false;
      });

      const isOpponent = opponents.some((v: any) => {
        if (JSON.stringify(v) === JSON.stringify([x, y])) {
          return true;
        }
        return false;
      });

      return (
        <div
          key={i}
          style={{ width: '16.66%', height: '16.66%' }}
          onClick={() => {
            ghostClickHandler(selected, i);
          }}
        >
          <BoardSquare x={x} y={y} isSelected={isGhost && i === selected}>
            <Piece
              isGhost={isGhost}
              isGoodGhost={isGoodGhost}
              isOpponent={isOpponent}
            />
          </BoardSquare>
        </div>
      );
    },
    [selected, positions],
  );
  const squares = Array.from(new Array(36), (_, i) => {
    return renderSquare(i, positions, ghostTypeIndices, opponentPositions);
  });
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
      }}
    >
      {squares}
    </div>
  );
};
