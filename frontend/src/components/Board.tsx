import { useCallback, useEffect, useState } from 'react';
import { BoardSquare } from './BoardSquare';
import { Piece } from './Piece';
import { checkMovable } from '../utils/checkMovable';
import { moveGhost } from '../utils/moveGhost';
import { getContract } from '../utils/getContract';
import { checkOngoingGame } from '../utils/checkOngoingGame';
import { ethers } from 'ethers';

export const Board = () => {
  const initialGhostTypeIndices = localStorage.getItem('GHOST_TYPE_INDICES');
  const salt = localStorage.getItem('SALT');
  const [positions, setPositions] = useState([]);
  const [opponentPositions, setOpponentPositions] = useState([]);
  const [goodAndEvil, setGoodAndEvil] = useState([0, 0]);
  const [needRevealIdx, setNeedRevealIdx] = useState(10);
  const [selected, setSelected] = useState<number | null>(null);
  const [isWinningPositionIdx, setIsWinningPositionIdx] = useState(-1);
  const ghostTypeIndices = initialGhostTypeIndices
    ? JSON.parse(initialGhostTypeIndices)
    : [1, 1, 1, 1, 0, 0, 0, 0];

  useEffect(() => {
    const f = async () => {
      const { contract, account } = await getContract();
      const game = await checkOngoingGame(contract, account);

      if (game !== ethers.constants.HashZero) {
        const pieces = await contract.currentPositions();
        const pieceStatuses = await contract.currentPieceStatuses();
        if (pieceStatuses[0].includes(10)) {
          const index = pieceStatuses[0].findIndex((v: number) => v === 10);
          setNeedRevealIdx(index);
        }

        // const turnFilter = contract.filters.TurnStart(game, null);
        // contract.on(turnFilter, (_, turnUserAddress) => {
        //   if (turnUserAddress.toLowerCase() === account.toLowerCase()) {
        //     setPositions(pieces[0]);
        //   } else {
        //     setPositions(pieces[0]);
        //   }
        // });

        setPositions(pieces[0]);
        setOpponentPositions(pieces[1]);
        const good = pieceStatuses[1].filter((v: number) => v === 1).length;
        const evil = pieceStatuses[1].filter((v: number) => v === 0).length;
        const evilCount = evil > 4 ? 0 : evil;
        setGoodAndEvil([good, evilCount]);
        const player1 = await contract.players(game, 0);
        if (player1.toLowerCase() === account.toLowerCase()) {
          const passIndex = pieces[0].findIndex(function (
            v: number[],
            idx: number,
          ) {
            return (
              (v[0] === 0 && v[1] === 0 && ghostTypeIndices[idx] === 1) ||
              (v[0] === 5 && v[1] === 0 && ghostTypeIndices[idx] === 1)
            );
          });
          setIsWinningPositionIdx(passIndex);
        } else {
          const passIndex = pieces[0].findIndex(function (
            v: number[],
            idx: number,
          ) {
            return (
              (v[0] === 0 && v[1] === 5 && ghostTypeIndices[idx] === 1) ||
              (v[0] === 5 && v[1] === 5 && ghostTypeIndices[idx] === 1)
            );
          });
          setIsWinningPositionIdx(passIndex);
        }
      }
    };
    f();
  }, []);

  const reveal = async () => {
    const { contract } = await getContract();

    await contract.revealPiece(needRevealIdx, ghostTypeIndices[needRevealIdx]);
  };

  const ghostClickHandler = async (
    currentIdx: number | null,
    toIdx: number,
  ) => {
    if (currentIdx) {
      if (checkMovable(positions, toIdx, currentIdx)) {
        const newPositions = await moveGhost(positions, currentIdx, toIdx);
        setPositions(newPositions);
      } else {
        setSelected(null);
      }
    } else {
      setSelected(toIdx);
    }
  };

  const callWin = async () => {
    const { contract } = await getContract();
    await contract.winMove(isWinningPositionIdx, ghostTypeIndices, salt);
  };

  const renderSquare = useCallback(
    (i: number, ps: any, ghostTypeIndices: number[], opponents: any) => {
      const x = i % 6;
      const y = Math.floor(i / 6);

      let isGoodGhost = false;
      const isGhost = ps.some((v: any, j: number) => {
        if (JSON.stringify(v) === JSON.stringify([x, y])) {
          isGoodGhost = ghostTypeIndices[j] === 1 ? true : false;
          return true;
        }
        return false;
      });

      const isOpponent = opponents.some((v: any) => {
        if (JSON.stringify(v) === JSON.stringify([x, y])) {
          return true;
        }
        return false;
      });

      const isGoal =
        (x === 0 && y === 0) ||
        (x === 5 && y === 0) ||
        (x === 0 && y === 5) ||
        (x === 5 && y === 5);

      return (
        <div
          key={i}
          style={{ width: '16.66%', height: '16.66%' }}
          onClick={() => {
            ghostClickHandler(selected, i);
          }}
        >
          <BoardSquare
            x={x}
            y={y}
            isSelected={isGhost && i === selected}
            isGoal={isGoal}
            isSelectable={false}
          >
            <Piece
              isGhost={isGhost}
              isGoodGhost={isGoodGhost}
              isOpponent={isOpponent}
            />
          </BoardSquare>
        </div>
      );
    },
    [selected, positions],
  );
  const squares = Array.from(new Array(36), (_, i) => {
    return renderSquare(i, positions, ghostTypeIndices, opponentPositions);
  });
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
      }}
    >
      {squares}
      <div
        style={{
          marginTop: '15px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <p>
          What you got: Good: {goodAndEvil[0]}, Evil: {goodAndEvil[1]}
        </p>
        {needRevealIdx === 10 ? null : (
          <div onClick={reveal} className="button02">
            <a href="#">Reveal</a>
          </div>
        )}
        {isWinningPositionIdx >= 0 ? (
          <div onClick={callWin} className="button02">
            <a href="#">Declare Win</a>
          </div>
        ) : null}
      </div>
    </div>
  );
};
