# Ghosts

Ghosts is a zk-table-game for anyone. It is a simple fun game.

Ghosts Link:

https://zku-final-project.vercel.app/

## Project Structure

The project has three main folders:

- contracts
- frontend

### contracts

The [contracts folder](/contracts/) contains all the smart contracts and circuits.

#### circuits

Each player commits their proofs that prove they chose four good ghosts and four evil ghosts.
In the circuit, good or evil is represented by binaries. Good is 1 and evil is 0.

#### contracts

The main contract is Ghosts.sol. In the contract, the whole game system is implemented such as game start, move pieces and check winning conditions.
In the contract, each player has to submit their proof when they start a game.

### frontend

Frontend UI is implemented by next.js and hosted in Vercel.
