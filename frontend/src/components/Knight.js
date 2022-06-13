import { DragPreviewImage, useDrag } from 'react-dnd';
import { knightImage } from './knightImage';
import { ItemTypes } from '../ItemTypes';

const knightStyle = {
  fontSize: 60,
  fontWeight: 'bold',
  textAlign: 'center',
  lineHeight: '4rem',
  cursor: 'move',
};
export const Knight = () => {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.KNIGHT,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  return (
    <>
      <DragPreviewImage connect={preview} src={knightImage} />
      <div
        ref={drag}
        style={{
          ...knightStyle,
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        ♘
      </div>
    </>
  );
};
