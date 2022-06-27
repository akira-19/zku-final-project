import { useDrop } from 'react-dnd';
import { ItemTypes } from '../ItemTypes';
import { Square } from './Square';
import { Overlay } from './Overlay';

const boardSquareStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
};
export const BoardSquare = ({ x, y, children, game }) => {
  const black = (x + y) % 2 === 1;
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemTypes.PIECE,
      drop: () => game.move(x, y),
      canDrop: () => game.canMove(x, y),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [x, y],
  );
  return (
    <div ref={drop} style={boardSquareStyle}>
      <Square black={black}>{children}</Square>
      {isOver && !canDrop && <Overlay color="red" />}
      {!isOver && canDrop && <Overlay color="yellow" />}
      {isOver && canDrop && <Overlay color="green" />}
    </div>
  );
};
