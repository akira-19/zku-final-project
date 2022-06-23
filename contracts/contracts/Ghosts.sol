// SPDX-License-Identifier: GPL-3.0
import "hardhat/console.sol";

pragma solidity >=0.8.0 <0.9.0;

contract Ghosts {
    bytes32 public waitingGame;
    mapping(bytes32 => address[2]) public players;
    mapping(bytes32 => mapping(address => uint8[2][8])) public pieces;
    mapping(bytes32 => address) public turnPlayer;
    mapping(bytes32 => uint256) public timeLimit;
    mapping(address => bytes32) public playingGame;
    mapping(bytes32 => address) public winner;

    // 0: evil, 1: good, 5: hidden, 10: need reveal
    mapping(bytes32 => mapping(address => uint8[8])) public pieceStatuses;

    modifier isMyTurn() {
        bytes32 game = playingGame[msg.sender];
        require(game != "", "must be playing the game.");
        require(turnPlayer[game] == msg.sender, "must be your turn.");
        _;
    }

    modifier canMove(
        uint8 idx,
        uint8 toX,
        uint8 toY
    ) {
        {
            bytes32 game = playingGame[msg.sender];
            uint8 x = pieces[game][msg.sender][idx][0];
            uint8 y = pieces[game][msg.sender][idx][1];

            int8 dx = int8(toX) - int8(x);
            int8 dy = int8(toY) - int8(y);

            bool isPossibleMove = (abs(dx) == 1 && abs(dy) == 0) ||
                (abs(dx) == 0 && abs(dy) == 1);
            bool isNoPieceExist = true;

            for (uint8 i = 0; i < 8; i++) {
                uint8[2] memory piece = pieces[game][msg.sender][i];
                if (toX == piece[0] && toY == piece[1]) {
                    isNoPieceExist = false;
                    break;
                }
            }

            require(isPossibleMove && isNoPieceExist, "must be movable.");
        }
        _;
    }

    modifier needReveal() {
        {
            bytes32 game = playingGame[msg.sender];
            bool noNeedToReveal = true;
            for (uint8 i = 0; i < 8; i++) {
                if (pieceStatuses[game][msg.sender][i] == 10) {
                    noNeedToReveal = false;
                    break;
                }
            }
            require(noNeedToReveal, "need to reveal your piece.");
        }
        _;
    }

    function startGame() public {
        require(playingGame[msg.sender] == "", "playing another game.");
        if (waitingGame == "") {
            waitingGame = keccak256(
                abi.encodePacked(msg.sender, block.timestamp)
            );
            players[waitingGame][0] = msg.sender;
            playingGame[msg.sender] = waitingGame;
            pieces[waitingGame][msg.sender] = [
                [1, 4],
                [2, 4],
                [3, 4],
                [4, 4],
                [1, 5],
                [2, 5],
                [3, 5],
                [4, 5]
            ];
            turnPlayer[waitingGame] = msg.sender;
        } else {
            require(
                players[waitingGame][0] != msg.sender,
                "players must not be the same"
            );
            playingGame[msg.sender] = waitingGame;
            players[waitingGame][1] = msg.sender;
            pieces[waitingGame][msg.sender] = [
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
                [1, 1],
                [2, 1],
                [3, 1],
                [4, 1]
            ];
            waitingGame = "";
        }
        for (uint8 i = 0; i < 8; i++) {
            pieceStatuses[playingGame[msg.sender]][msg.sender][i] = 5;
        }
    }

    function move(
        uint8 idx,
        uint8 toX,
        uint8 toY
    ) public isMyTurn canMove(idx, toX, toY) needReveal {
        pieces[playingGame[msg.sender]][msg.sender][idx] = [toX, toY];

        // check if get the opponent's piece
        {
            address opponent;
            if (players[playingGame[msg.sender]][0] == msg.sender) {
                opponent = players[playingGame[msg.sender]][1];
            } else {
                opponent = players[playingGame[msg.sender]][0];
            }
            for (uint8 i = 0; i < 8; i++) {
                uint8[2] memory piece = pieces[playingGame[msg.sender]][
                    opponent
                ][i];
                if (toX == piece[0] && toY == piece[1]) {
                    pieces[playingGame[msg.sender]][opponent][i] = [10, 10];
                    pieceStatuses[playingGame[msg.sender]][opponent][i] = 10;
                    break;
                }
            }
            turnPlayer[playingGame[msg.sender]] = opponent;
        }
    }

    function revealPiece(uint8 idx, uint8 status) public isMyTurn {
        require(
            pieceStatuses[playingGame[msg.sender]][msg.sender][idx] == 10,
            "must be need reveal status."
        );
        require(status == 0 || status == 1, "must be zero or one.");
        pieceStatuses[playingGame[msg.sender]][msg.sender][idx] = status;
        checkWinnerAfterReveal();
    }

    function checkWinnerAfterReveal() private {
        uint8 good = 0;
        uint8 evil = 0;
        for (uint8 i = 0; i < 8; i++) {
            if (pieceStatuses[playingGame[msg.sender]][msg.sender][i] == 0) {
                evil += 1;
            } else if (
                pieceStatuses[playingGame[msg.sender]][msg.sender][i] == 1
            ) {
                good += 1;
            }
        }

        if (good >= 4) {
            address opponent;
            if (players[playingGame[msg.sender]][0] == msg.sender) {
                opponent = players[playingGame[msg.sender]][1];
            } else {
                opponent = players[playingGame[msg.sender]][0];
            }
            winner[playingGame[msg.sender]] = opponent;
        } else if (evil >= 4) {
            winner[playingGame[msg.sender]] = msg.sender;
        }
    }

    function abs(int8 x) private pure returns (int8) {
        return x >= 0 ? x : -x;
    }
}
