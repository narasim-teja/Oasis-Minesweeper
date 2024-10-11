# Minesweeper Game on Oasis Sapphire Network

## Introduction

This project is a Minesweeper-style game built on the Oasis Sapphire network. The game features a 5x5 grid with 3 randomly placed mines. Players can bet between 0.1 and 0.5 TEST tokens, and the goal is to avoid the mines and win by making safe moves. The game is powered by smart contracts, using the Oasis Sapphire RNG for secure and private mine placement.

## Features

- Secure RNG for random mine placement using Oasis Sapphire.
- Players can bet, make moves, cash out, and withdraw their winnings.
- Fully functional smart contract running on the Oasis Sapphire testnet.
- No frontend—interaction is done via scripts (Hardhat).

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/narasim-teja/Oasis-Minesweeper.git
cd Oasis-Minesweeper
```

### 2. Install Dependencies

Make sure you have all the required dependencies by running:

```bash
npm install
```

This will install **Hardhat**, **ethers.js**, and the **Oasis Sapphire** dependencies.

### 3. Configure Environment Variables

Create a `.env` file in the project root directory. Add your private key and the contract address (if available):

```bash
PRIVATE_KEY="your-private-key-here"
CONTRACT_ADDR="" # This will be populated after deployment
```

Your `PRIVATE_KEY` should be the private key associated with your Oasis Sapphire testnet account.

### 4. Compile the Smart Contract

To compile the Minesweeper smart contract, run:

```bash
npx hardhat compile
```

This will compile the Solidity contract and generate the necessary ABI files.

### 5. Deploy the Smart Contract

To deploy the contract to the Oasis Sapphire testnet, use the following command:

```bash
npx hardhat run scripts/deploy.js --network sapphire
```

After successful deployment, the console will output the contract address. Copy this address and update your `.env` file:

```bash
CONTRACT_ADDR="your-deployed-contract-address-here"
```

### 6. Interacting with the Contract

Now that your contract is deployed, you can start interacting with it using various scripts.

#### 6.1 Start a Game

To start a new game, run the `startGame.js` script:

```bash
npx hardhat run scripts/startGame.js --network sapphire
```

This will start a game with a bet of 0.1 TEST tokens.

#### 6.2 Make Moves

To make moves in the game, run the `makeMove.js` script. You can specify your moves (grid positions) in the script:

```bash
npx hardhat run scripts/makeMove.js --network sapphire
```

#### 6.3 Check Game State

To check your current game state (active status, winnings, and safe moves), use the `getGameState.js` script:

```bash
npx hardhat run scripts/getGameState.js --network sapphire
```

#### 6.4 Cash Out Winnings

If you want to cash out your winnings and end the game, run the `cashOut.js` script:

```bash
npx hardhat run scripts/cashOut.js --network sapphire
```

#### 6.5 Withdraw Winnings

Once you have cashed out your winnings, you can withdraw them to your wallet using the `withdraw.js` script:

```bash
npx hardhat run scripts/withdraw.js --network sapphire
```

### 7. Running Tests

To test the smart contract and ensure everything is functioning as expected, you can run the test cases provided in the `test` directory:

```bash
npx hardhat test
```

This will run all the tests and give you a detailed report of the contract’s behavior.
