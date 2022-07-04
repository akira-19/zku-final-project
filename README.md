# Ghosts

Ghosts is a zk-table-game for anyone. It is a simple fun game.

Ghosts Link:

https://zku-final-project.vercel.app/

Demo video:

## Project Structure

The project has three main folders:

- contracts
- frontend

### contracts

The [contracts folder](/contracts/) contains all the smart contracts and circuits.

#### circuits

Each player commits their proofs that prove they chose four good ghosts and four evil ghosts.
In the circuit, good or evil is represented by binaries. Good is 1 and evil is 0.
The binaries are 2\*\*8 = 256 patterns, and it is vulnerable by brute force attack. Therefore the circuit requires a private salt.

#### contracts

The main contract is Ghosts.sol. In the contract, the whole game system is implemented such as game start, move pieces and check winning conditions.
In the contract, each player has to submit their proof when they start a game.

### frontend

Frontend UI is implemented by next.js and hosted in Vercel.

## Run locally

### contracts

With running hardhat nodes(`npx hardhat node`), in contracts directory,

```
yarn install
sh ./scripts/compile-circuit.sh
npx hardhat run --network localhost scripts/deploy.js
```

copy the Ghosts address and paste it to the contractAddress variable in `/frontend/src/utils/getContract.ts`

### frontend

In frontend directory,

```
yarn install
yarn dev
```

## Test

### contracts

In contracts directory, you can test contracts and circuits.

```
yarn install
sh ./scripts/compile-circuit.sh
yarn test
```

In test directory,

- ghosts-test.js tests the smart contract in Ghosts.sol
- verifier-circuits-test.js tests the circuit in Ghosts.circom
- verifier-test.js test the smart contract in verifier.sol which is auto generated from Ghosts.circom

## How to play

1. Connect your metamask wallet, then you are in a game.
2. Select 4 indices that good ghosts are placed, and click Start Game
3. In your turn, pick one ghost and move it.
4. When your ghost is got, you have to reveal the ghost's type before you move your ghost.
5. Winning conditions are following,
   - You get all the opponent's good ghosts.
   - The opponents get all your evil ghosts.
   - Your good ghost gets the opponent side red square and declare win.
6. After you win, you can claim ERC20 coins.

## Future steps

- Players can buy NFT by the utility token
- Players use the NFT for ghosts images in games
