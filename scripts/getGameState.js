const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [player] = await hre.ethers.getSigners();
  const gameAddress = process.env.CONTRACT_ADDR; 
  const game = await hre.ethers.getContractAt("Minesweeper", gameAddress, player);

  const gameState = await game.getGameState();

  const isActive = gameState[0];
  const winnings = gameState[1];
  const safeMoves = gameState[2];
  const remainingTime = gameState[3]; // New variable for remaining time
  const selectedMoves = gameState[4]; // New variable for selected moves

  console.log(`Game is ${isActive ? "active" : "inactive"}`);
  console.log(`Session Winnings: ${winnings} ROSE`);
  console.log(`Current Safe Moves: ${safeMoves}`);
  
  if (isActive) {
    console.log(`Remaining Time: ${remainingTime} seconds`);
    console.log(`Selected Moves: ${selectedMoves.join(", ")}`);
  } else {
    console.log("The game session has expired or has been ended.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
