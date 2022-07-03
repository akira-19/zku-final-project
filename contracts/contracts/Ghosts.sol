// SPDX-License-Identifier: GPL-3.0
import "hardhat/console.sol";
import {PoseidonT3} from "./Poseidon.sol";
import "./IGSTCoin.sol";

pragma solidity >=0.8.0 <0.9.0;

interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) external view returns (bool r);
}

contract Ghosts {
    IVerifier verifier;
    IGSTCoin gstCoin;

    bytes32 public waitingGame;
    mapping(bytes32 => address[2]) public players;
    mapping(bytes32 => mapping(address => uint8[2][8])) public pieces;
    mapping(bytes32 => address) public turnPlayer;
    mapping(bytes32 => uint256) public timeLimit;
    mapping(address => bytes32) public playingGame;
    mapping(bytes32 => address) public winner;
    mapping(bytes32 => mapping(address => uint256)) public pubHash;

    // 0: evil, 1: good, 5: hidden, 10: need reveal
    mapping(bytes32 => mapping(address => uint8[8])) public pieceStatuses;

    constructor(address verifierAddress, address igstCoinAddress) {
        verifier = IVerifier(verifierAddress);
        gstCoin = IGSTCoin(igstCoinAddress);
    }

    event TurnStart(bytes32 indexed _game, address indexed _turnPlayer);
    event MustReveal(bytes32 indexed _game, address indexed _turnPlayer);
    event Winner(bytes32 indexed _game, address _winner);

    modifier isMyTurn() {
        bytes32 game = playingGame[msg.sender];
        require(game != "", "MBP");
        require(turnPlayer[game] == msg.sender, "MBT");
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

            require(isPossibleMove && isNoPieceExist, "MBM");
        }
        _;
    }

    modifier needReveal() {
        {
            bool noNeedToReveal = true;
            for (uint8 i = 0; i < 8; i++) {
                if (
                    pieceStatuses[playingGame[msg.sender]][msg.sender][i] == 10
                ) {
                    noNeedToReveal = false;
                    break;
                }
            }
            require(noNeedToReveal, "MBR");
        }
        _;
    }

    function isValidProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public view returns (bool) {
        return verifier.verifyProof(a, b, c, input);
    }

    function startGame(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public returns (bytes32) {
        require(playingGame[msg.sender] == "", "PAG");
        require(verifier.verifyProof(a, b, c, input), "MBV");
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
            pubHash[waitingGame][msg.sender] = input[0];
            turnPlayer[waitingGame] = msg.sender;
        } else {
            require(players[waitingGame][0] != msg.sender, "MBD");
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
            timeLimit[waitingGame] = block.timestamp + 600;
            pubHash[waitingGame][msg.sender] = input[0];
            waitingGame = "";

            emit TurnStart(
                playingGame[msg.sender],
                turnPlayer[playingGame[msg.sender]]
            );
        }
        for (uint8 i = 0; i < 8; i++) {
            pieceStatuses[playingGame[msg.sender]][msg.sender][i] = 5;
        }

        return playingGame[msg.sender];
    }

    function move(
        uint8 idx,
        uint8 toX,
        uint8 toY
    ) public isMyTurn canMove(idx, toX, toY) needReveal {
        bytes32 game = playingGame[msg.sender];
        pieces[game][msg.sender][idx] = [toX, toY];

        // check if get the opponent's piece
        {
            address opponent;
            if (players[game][0] == msg.sender) {
                opponent = players[game][1];
            } else {
                opponent = players[game][0];
            }
            bool isPieceGot = false;
            for (uint8 i = 0; i < 8; i++) {
                uint8[2] memory piece = pieces[game][opponent][i];
                if (toX == piece[0] && toY == piece[1]) {
                    pieces[game][opponent][i] = [10, 10];
                    pieceStatuses[game][opponent][i] = 10;
                    isPieceGot = true;
                    break;
                }
            }
            timeLimit[game] = block.timestamp + 600;
            turnPlayer[game] = opponent;

            if (!isPieceGot) {
                emit TurnStart(game, opponent);
            } else {
                emit MustReveal(game, opponent);
            }
        }
    }

    function winMove(
        uint8 idx,
        uint8[] memory statuses,
        uint256 solt
    ) public isMyTurn {
        bytes32 game = playingGame[msg.sender];
        address player1 = players[game][0];
        bool isWin = false;
        uint256 decimal = 0;

        if (player1 == msg.sender) {
            if (
                pieces[game][msg.sender][idx][0] == 0 &&
                pieces[game][msg.sender][idx][1] == 0 &&
                statuses[idx] == 1
            ) {
                isWin = true;
            } else if (
                pieces[game][msg.sender][idx][0] == 5 &&
                pieces[game][msg.sender][idx][1] == 0 &&
                statuses[idx] == 1
            ) {
                isWin = true;
            }
        } else {
            if (
                pieces[game][msg.sender][idx][0] == 0 &&
                pieces[game][msg.sender][idx][1] == 5 &&
                statuses[idx] == 1
            ) {
                isWin = true;
            } else if (
                pieces[game][msg.sender][idx][0] == 5 &&
                pieces[game][msg.sender][idx][1] == 5 &&
                statuses[idx] == 1
            ) {
                isWin = true;
            }
        }
        for (uint8 i = 0; i < 8; i++) {
            uint8 j = 7 - i;
            decimal += statuses[j] * (2**i);
        }
        require(verifyPubHash(uint256(decimal), solt), "MBV");
        require(isWin, "MBW");
        winner[game] = msg.sender;
        emit Winner(game, msg.sender);
    }

    function revealPiece(uint8 idx, uint8 status) public isMyTurn {
        bytes32 game = playingGame[msg.sender];
        require(pieceStatuses[game][msg.sender][idx] == 10, "MBR");
        require(status == 0 || status == 1, "MB01");
        pieceStatuses[game][msg.sender][idx] = status;
        bool isWinnerExist = checkWinnerAfterReveal();
        if (!isWinnerExist) {
            emit TurnStart(game, msg.sender);
        }
    }

    function currentPositions()
        public
        view
        returns (uint8[2][8] memory, uint8[2][8] memory)
    {
        bytes32 game = playingGame[msg.sender];
        if (players[game][0] == msg.sender) {
            return (pieces[game][msg.sender], pieces[game][players[game][1]]);
        } else {
            return (pieces[game][msg.sender], pieces[game][players[game][0]]);
        }
    }

    function currentPieceStatuses()
        public
        view
        returns (uint8[8] memory, uint8[8] memory)
    {
        bytes32 game = playingGame[msg.sender];
        if (players[game][0] == msg.sender) {
            return (
                pieceStatuses[game][msg.sender],
                pieceStatuses[game][players[game][1]]
            );
        } else {
            return (
                pieceStatuses[game][msg.sender],
                pieceStatuses[game][players[game][0]]
            );
        }
    }

    function claimGstCoin(uint256 v, uint256 solt) external {
        bytes32 game = playingGame[msg.sender];
        if (
            turnPlayer[game] != msg.sender && block.timestamp > timeLimit[game]
        ) {
            winner[game] == msg.sender;
        }

        require(
            game == playingGame[msg.sender] && winner[game] == msg.sender,
            "MBW"
        );
        if (verifyPubHash(v, solt)) {
            gstCoin.mint(msg.sender, 20);
        }
        playingGame[players[game][0]] = "";
        playingGame[players[game][1]] = "";
    }

    function cancelGame() external {
        require(players[playingGame[msg.sender]][1] == address(0), "GS");
        playingGame[msg.sender] = "";
    }

    function verifyPubHash(uint256 v, uint256 solt)
        private
        view
        returns (bool)
    {
        require(v < 256, "MB256");
        uint256 hashedValue = PoseidonT3.poseidon([v, solt]);
        return hashedValue == pubHash[playingGame[msg.sender]][msg.sender];
    }

    function checkWinnerAfterReveal() private returns (bool) {
        uint8 good = 0;
        uint8 evil = 0;
        bytes32 game = playingGame[msg.sender];
        for (uint8 i = 0; i < 8; i++) {
            if (pieceStatuses[game][msg.sender][i] == 0) {
                evil += 1;
            } else if (pieceStatuses[game][msg.sender][i] == 1) {
                good += 1;
            }
        }

        if (good >= 4) {
            address opponent;
            if (players[game][0] == msg.sender) {
                opponent = players[game][1];
            } else {
                opponent = players[game][0];
            }
            winner[game] = opponent;
            gstCoin.mint(msg.sender, 5);
            emit Winner(game, opponent);
            return true;
        } else if (evil >= 4) {
            address opponent;
            if (players[game][0] == msg.sender) {
                opponent = players[game][1];
            } else {
                opponent = players[game][0];
            }
            winner[game] = msg.sender;
            emit Winner(game, msg.sender);
            return true;
        }
        return false;
    }

    function abs(int8 x) private pure returns (int8) {
        return x >= 0 ? x : -x;
    }
}
