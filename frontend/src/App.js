import { useMemo } from 'react';
import { Game } from './Game';
import { Board } from './components/Board';

const containerStyle = {
  width: 500,
  height: 500,
  border: '1px solid gray',
};
const App = () => {
  const game = useMemo(() => new Game(), []);
  return (
    <div style={containerStyle}>
      <Board game={game} />
    </div>
  );
};

export default App;
