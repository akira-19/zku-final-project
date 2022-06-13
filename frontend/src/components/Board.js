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
  useEffect(() => game.observe(setPosition), [game]);
  const renderSquare = useCallback(
    (i, [knightX, knightY]) => {
      const x = i % 6;
      const y = Math.floor(i / 6);
      return (
        <div key={i} style={squareStyle}>
          <BoardSquare x={x} y={y} game={game}>
            <Piece isKnight={knightX === x && knightY === y} />
          </BoardSquare>
        </div>
      );
    },
    [game],
  );
  const squares = Array.from(new Array(36), (_, i) =>
    renderSquare(i, position),
  );
  return <div style={boardStyle}>{squares}</div>;
};
