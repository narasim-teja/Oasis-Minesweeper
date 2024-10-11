const hre = require("hardhat");

async function main() {
  const MinesweeperGame = await hre.ethers.getContractFactory("Minesweeper");
  const game = await MinesweeperGame.deploy();

  await game.waitForDeployment();

  console.log("MinesweeperGame deployed to:", game.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
