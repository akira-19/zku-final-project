import { useCallback, useEffect, useState } from 'react';
import { BoardSquare } from './BoardSquare';
import { Piece } from './Piece';

const boardStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexWrap: 'wrap',
};
const squareStyle = { width: '16.66%', height: '16.66%' };
export const Board = ({ game }) => {
  const [position, setPosition] = useState(game.position);
  const [positions, setPositions] = useState(game.positions);
  const ghostTypeIndices = game.ghostTypeIndices;
  // useEffect(() => game.observe(setPosition), [game]);
  const renderSquare = useCallback(
    (i, ps, ghostTypeIndices) => {
      const x = i % 6;
      const y = Math.floor(i / 6);

      let isGoodGhost = false;
      const isGhost = ps.some((v, i) => {
        if (JSON.stringify(v) === JSON.stringify([x, y])) {
          isGoodGhost = ghostTypeIndices[i] === 1 ? true : false;
          return true;
        }
        return false;
      });

      return (
        <div key={i} style={squareStyle}>
          <BoardSquare x={x} y={y} game={game}>
            <Piece isGhost={isGhost} isGoodGhost={isGoodGhost} />
          </BoardSquare>
        </div>
      );
    },
    [game],
  );
  const squares = Array.from(new Array(36), (_, i) => {
    return renderSquare(i, positions, ghostTypeIndices);
  });
  return <div style={boardStyle}>{squares}</div>;
};
