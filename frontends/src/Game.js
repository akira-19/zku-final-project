export class Game {
  constructor(ghostTypeIndices) {
    this.position = [1, 5];
    this.ghostTypeIndices = ghostTypeIndices;
    this.positions = [
      [1, 4],
      [2, 4],
      [3, 4],
      [4, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
    ];

    this.enemyPositions = [
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ];
    this.observers = [];
  }
  emitChange() {
    const pos = this.position;
    this.observers.forEach((o) => o && o(pos));
  }
  observe(o) {
    this.observers = [...this.observers, o];
    this.emitChange();
    return () => {
      this.observers = this.observers.filter((t) => t !== o);
    };
  }
  move(toX, toY) {
    this.position = [toX, toY];
    this.emitChange();
  }
  canMove(toX, toY) {
    const [x, y] = this.position;
    const dx = toX - x;
    const dy = toY - y;
    return (
      (Math.abs(dx) === 1 && Math.abs(dy) === 0) ||
      (Math.abs(dx) === 0 && Math.abs(dy) === 1)
    );
  }
  movePiece(idx, toX, toY) {
    this.positions[idx] = [toX, toY];
    this.emitChange();
  }
  canMovePiece(idx, toX, toY) {
    const [x, y] = this.positions[idx];
    const dx = toX - x;
    const dy = toY - y;
    const isPossibleMove =
      (Math.abs(dx) === 1 && Math.abs(dy) === 0) ||
      (Math.abs(dx) === 0 && Math.abs(dy) === 1);
    var isNoPieceExist = this.positions.some(function (p) {
      return p === [toX, toY];
    });
    return isPossibleMove && isNoPieceExist;
  }
}
