// import { Knight } from './Knight';
import { Ghost } from './Ghost';

type Props = {
  isGhost: boolean;
  isGoodGhost: boolean;
  isOpponent: boolean;
};
export const Piece: React.FC<Props> = ({
  isGhost,
  isGoodGhost,
  isOpponent,
}) => {
  if (isGhost) {
    return <Ghost isGoodGhost={isGoodGhost} isOpponent={isOpponent} />;
  } else if (isOpponent) {
    return <Ghost isGoodGhost={isGoodGhost} isOpponent={isOpponent} />;
  }
};
