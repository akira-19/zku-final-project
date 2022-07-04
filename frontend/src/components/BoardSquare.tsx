import { Square } from './Square';
import { useState } from 'react';

type Props = {
  x: number;
  y: number;
  isSelected: boolean;
  isGoal: boolean;
  isSelectable: boolean;
  children: React.ReactElement;
};
export const BoardSquare: React.FC<Props> = ({
  x,
  y,
  isSelected,
  isGoal,
  isSelectable,
  children,
}) => {
  const black = (x + y) % 2 === 1;
  const clickedColor = 'yellow';
  const selectableColor = '#8ed0ff';

  let fill = black ? '#018080' : '#ddd';
  fill = isSelected ? 'yellow' : fill;
  fill = isGoal ? 'red' : fill;
  fill = isSelectable ? selectableColor : fill;
  const border = isSelectable ? '1px solid grey' : '';
  let number: number | null = null;
  if (isSelectable) {
    if (x === 1 && y === 4) {
      number = 1;
    } else if (x === 2 && y === 4) {
      number = 2;
    } else if (x === 3 && y === 4) {
      number = 3;
    } else if (x === 4 && y === 4) {
      number = 4;
    } else if (x === 1 && y === 5) {
      number = 5;
    } else if (x === 2 && y === 5) {
      number = 6;
    } else if (x === 3 && y === 5) {
      number = 7;
    } else if (x === 4 && y === 5) {
      number = 8;
    }
  }

  return (
    <>
      {isSelectable ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
        >
          <Square color={fill} border={border}>
            <>
              {number}
              {children}
            </>
          </Square>
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
          }}
        >
          <Square color={fill} border={border}>
            <>
              {number}
              {children}
            </>
          </Square>
        </div>
      )}
    </>
  );
};
