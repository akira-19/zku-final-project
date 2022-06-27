const squareStyle = {
  width: '100%',
  height: '100%',
};
export const Square = ({ black, children }) => {
  const fill = black ? 'grey' : 'white';
  const stroke = black ? 'white' : 'red';
  return (
    <div
      style={{
        ...squareStyle,
        backgroundColor: fill,
        color: stroke,
      }}
    >
      {children}
    </div>
  );
};
