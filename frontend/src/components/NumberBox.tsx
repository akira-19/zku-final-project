import { useState } from 'react';

type Props = {
  selected: number[];
  clickHandler: (i: number) => void;
};

const boxStyle = {
  width: '20px',
  height: '20px',
};

export const NumberBox: React.FC<Props> = ({ selected, clickHandler }) => {
  const elements = [1, 2, 3, 4, 5, 6, 7, 8].map((v: number) => {
    return (
      <div
        key={v}
        className="number-box"
        onClick={() => clickHandler(v)}
        style={{ background: selected.includes(v) ? 'yellow' : 'white' }}
      >
        {v}
      </div>
    );
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {elements}
    </div>
  );
};
