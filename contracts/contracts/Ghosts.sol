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

    modifier isMyTurn() {
        bytes32 game = playingGame[msg.sender];
        require(game != "", "must be playing the game");
        require(turnPlayer[game] == msg.sender, "must be your turn");
        _;
    }

    modifier canMove(
        uint8 idx,
        uint8 toX,
        uint8 toY
    ) {
        bytes32 game = playingGame[msg.sender];
        uint8 x = pieces[game][msg.sender][idx][0];
        uint8 y = pieces[game][msg.sender][idx][1];

        int8 dx = int8(toX - x);
        int8 dy = int8(toY - y);
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
        _;
    }

    function startGame() public {
        require(playingGame[msg.sender] == "", "playing another game");
        if (waitingGame == "") {
            waitingGame = keccak256(
                abi.encodePacked(msg.sender, block.timestamp)
            );
            players[waitingGame][0] = msg.sender;
            playingGame[msg.sender] = waitingGame;
            pieces[waitingGame][msg.sender] = [
                [1, 4],
                [2, 4],
                [1, 5],
                [2, 5],
                [3, 4],
                [4, 4],
                [3, 5],
                [3, 5]
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
    }

    function move(
        uint8 idx,
        uint8 toX,
        uint8 toY
    ) public isMyTurn canMove(idx, toX, toY) {
        pieces[playingGame[msg.sender]][msg.sender][idx] = [toX, toY];
    }

    function abs(int256 x) private pure returns (int256) {
        return x >= 0 ? x : -x;
    }
}
