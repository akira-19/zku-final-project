import Image from 'next/image';

const style = {
  width: 60,
  height: 60,
  cursor: 'move',
};

type Props = {
  isGoodGhost: boolean;
  isOpponent: boolean;
};

export const Ghost: React.FC<Props> = ({ isGoodGhost, isOpponent }) => {
  let imgSrc = isGoodGhost ? '/images/good.png' : '/images/evil.png';
  imgSrc = isOpponent ? '/images/opponent.png' : imgSrc;

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image width={60} height={60} src={imgSrc} alt="Logo" />
      </div>
    </>
  );
};
