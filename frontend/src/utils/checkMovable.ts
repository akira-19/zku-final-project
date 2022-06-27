export const checkMovable = (
  positions: any,
  selectedIdx: number,
  currentIdx: number,
) => {
  const toX = selectedIdx % 6;
  const toY = Math.floor(selectedIdx / 6);
  const x = currentIdx % 6;
  const y = Math.floor(currentIdx / 6);
  const dx = toX - x;
  const dy = toY - y;
  const isPossibleMove =
    (Math.abs(dx) === 1 && Math.abs(dy) === 0) ||
    (Math.abs(dx) === 0 && Math.abs(dy) === 1);
  const isPieceExist = positions.some(function (p: number[]) {
    return p[0] === toX && p[1] === toY;
  });
  return isPossibleMove && !isPieceExist;
};
