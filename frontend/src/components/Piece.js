// import { Knight } from './Knight';
import { Ghost } from './Ghost';

export const Piece = ({ isGhost }) => (isGhost ? <Ghost /> : null);
