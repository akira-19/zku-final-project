import { Board } from '../components/Board';

const containerStyle = {
  width: 500,
  height: 500,
  border: '1px solid gray',
};

const Ghosts = () => {
  return (
    <div style={containerStyle}>
      <Board />
    </div>
  );
};

export default Ghosts;
