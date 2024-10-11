const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [player] = await hre.ethers.getSigners();
  const gameAddress = process.env.CONTRACT_ADDR;
  const game = await hre.ethers.getContractAt("Minesweeper", gameAddress, player);

 // Cash out winnings
 tx = await game.cashOut();
 await tx.wait();
 console.log("Cashed out");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
