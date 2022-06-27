import { getContract } from './getContract';

export const moveGhost = async (
  positions: any,
  currentIdx: number,
  toIdx: number,
) => {
  const toX = toIdx % 6;
  const toY = Math.floor(toIdx / 6);
  const x = currentIdx % 6;
  const y = Math.floor(currentIdx / 6);

  const newPositions = positions;

  const { contract } = await getContract();

  positions.some((v: any, i: number) => {
    if (JSON.stringify(v) === JSON.stringify([x, y])) {
      // newPositions[i] = [toX, toY];
      contract.move(i, toX, toY);
      return true;
    }
    return false;
  });

  return newPositions;
};
