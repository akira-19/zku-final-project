import { useDrag } from 'react-dnd';
import { ItemTypes } from '../ItemTypes';
import Red from '../images/red.png';
import Blue from '../images/blue.png';

const style = {
  width: 60,
  cursor: 'move',
};

export const Ghost = ({ isGoodGhost }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PIECE,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  return (
    <>
      <div
        ref={drag}
        style={{
          // ...style,
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        <img style={{ ...style }} src={isGoodGhost ? Red : Blue} alt="Logo" />
      </div>
    </>
  );
};
