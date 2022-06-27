// import { Knight } from './Knight';
import { Ghost } from './Ghost';

export const Piece = ({ isGhost, isGoodGhost }) =>
  isGhost ? <Ghost isGoodGhost={isGoodGhost} /> : null;
