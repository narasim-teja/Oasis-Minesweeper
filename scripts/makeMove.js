const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [player] = await hre.ethers.getSigners();
  const gameAddress = process.env.CONTRACT_ADDR;
  const game = await hre.ethers.getContractAt("Minesweeper", gameAddress, player);

  const positions = [3]; // Replace with your positions
  tx = await game.makeMoves(positions);
  await tx.wait();
  console.log("Moves made");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
