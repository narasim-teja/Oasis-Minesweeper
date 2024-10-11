const hre = require("hardhat");
require("dotenv").config();


async function main() {
  const [player] = await hre.ethers.getSigners();
  const gameAddress = process.env.CONTRACT_ADDR; 
  const game = await hre.ethers.getContractAt("Minesweeper", gameAddress, player);

  const gameState = await game.getGameState();
  
  const isActive = gameState[0];
  const balances = gameState[1];
  const safeMoves = gameState[2];

  console.log(`Game is ${isActive ? "active" : "inactive"}`);
  console.log(`Session Winnings: ${balances} ROSE`);
  console.log(`Current Safe Moves: ${safeMoves}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
