export const moveGhost = (
  positions: any,
  currentIdx: number,
  toIdx: number,
) => {
  const toX = toIdx % 6;
  const toY = Math.floor(toIdx / 6);
  const x = currentIdx % 6;
  const y = Math.floor(currentIdx / 6);

  let newPositions = positions;

  positions.some((v: any, i: number) => {
    if (JSON.stringify(v) === JSON.stringify([x, y])) {
      newPositions[i] = [toX, toY];
      return true;
    }
    return false;
  });

  return newPositions;
};
