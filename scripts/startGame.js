const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [player] = await hre.ethers.getSigners();
  const gameAddress = process.env.CONTRACT_ADDR;
  const game = await hre.ethers.getContractAt("Minesweeper", gameAddress, player);

  const depositAmount = hre.ethers.parseEther("0.1");
  const tx = await game.startGame({ value: depositAmount });
  await tx.wait();

  console.log("Game started!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
