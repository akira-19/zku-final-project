const squareStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

type Props = {
  color: string;
  border: string;
  children: React.ReactElement;
};
export const Square: React.FC<Props> = ({ color, border, children }) => {
  return (
    <div
      style={{
        ...squareStyle,
        backgroundColor: color,
        border: border,
      }}
    >
      {children}
    </div>
  );
};
