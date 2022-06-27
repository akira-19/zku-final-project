const squareStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

type Props = {
  black: boolean;
  isSelected: boolean;
  children: React.ReactElement;
};
export const Square: React.FC<Props> = ({ black, isSelected, children }) => {
  let fill = black ? 'grey' : 'white';
  fill = isSelected ? 'yellow' : fill;
  return (
    <div
      style={{
        ...squareStyle,
        backgroundColor: fill,
      }}
    >
      {children}
    </div>
  );
};
