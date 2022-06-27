import { Square } from './Square';

type Props = {
  x: number;
  y: number;
  isSelected: boolean;
  children: React.ReactElement;
};
export const BoardSquare: React.FC<Props> = ({
  x,
  y,
  isSelected,
  children,
}) => {
  const black = (x + y) % 2 === 1;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <Square black={black} isSelected={isSelected}>
        {children}
      </Square>
    </div>
  );
};
