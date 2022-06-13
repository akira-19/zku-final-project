// import { Knight } from './Knight';
import { Ghost } from './Ghost';

export const Piece = ({ isKnight }) => (isKnight ? <Ghost /> : null);
