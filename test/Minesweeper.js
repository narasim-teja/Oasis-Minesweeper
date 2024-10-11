const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MinesweeperGame", function () {
  let gameContract;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    const MinesweeperGame = await ethers.getContractFactory("Minesweeper", owner);
    gameContract = await MinesweeperGame.deploy();

    await gameContract.waitForDeployment();
  });

  it("Should update isActive to true after starting a game", async function () {
    const { parseEther } = ethers;
    const depositAmount = parseEther("0.1");

    // Call startGame()
    await gameContract.connect(owner).startGame({ value: depositAmount });

    // Call getGameState()
    const gameState = await gameContract.connect(owner).getGameState();

    expect(gameState.isActive).to.equal(true);
    expect(gameState.winnings).to.equal(0);  // winnings should start at 0
    expect(gameState.safeMoves).to.equal(0);
  });

  it("Should make moves and update winnings accordingly", async function () {
    const { parseEther } = ethers;
    const depositAmount = parseEther("0.1");
  
    // Start the game
    await gameContract.connect(owner).startGame({ value: depositAmount });
  
    // Make moves
    await gameContract.connect(owner).makeMoves([0, 1, 2]);
  
    // Call getGameState()
    const gameState = await gameContract.connect(owner).getGameState();
  
    expect(gameState.safeMoves).to.equal(3); 
    expect(gameState.isActive).to.equal(true);
    expect(gameState.winnings).to.be.above(depositAmount);
  });
  
  

  it("Should allow player to cash out winnings", async function () {
    const { parseEther } = ethers;
    const depositAmount = parseEther("0.1");
  
    // Start the game
    await gameContract.connect(owner).startGame({ value: depositAmount });
  
    // Make moves
    await gameContract.connect(owner).makeMoves([0, 1, 2]);
  
    // Call cashOut
    await gameContract.connect(owner).cashOut();
  
    // Check the player's balance in the contract
    const balance = await gameContract.balances(owner.address); // Correct way to access balance
    expect(balance).to.be.above(0); // Winnings should be cashed out to the player's balance
  
    // Check the game state is no longer active
    const gameState = await gameContract.connect(owner).getGameState();
    expect(gameState.isActive).to.equal(false);
  });
  

  it("Should withdraw winnings", async function () {
    const { parseEther } = ethers;
    const depositAmount = parseEther("0.1");

    // Start the game
    await gameContract.connect(owner).startGame({ value: depositAmount });
    await owner.sendTransaction({to:gameContract, value: depositAmount})

    // Make moves
    await gameContract.connect(owner).makeMoves([0, 1, 2]);

    // Call cashOut
    await gameContract.connect(owner).cashOut();

    // Withdraw winnings
    const initialBalance = await ethers.provider.getBalance(owner.address);
    await gameContract.connect(owner).withdraw();

    const finalBalance = await ethers.provider.getBalance(owner.address);
    expect(finalBalance).to.be.above(initialBalance); // Ensure the withdrawal was successful

  });
  
  

  it("Should end the game if a bomb is hit", async function () {
    const { parseEther } = ethers;
    const depositAmount = parseEther("0.1");

    // Start the game
    await gameContract.connect(owner).startGame({ value: depositAmount });

    // Call getGameState() before making moves
    let gameState = await gameContract.connect(owner).getGameState();
    expect(gameState.isActive).to.equal(true);

    // Simulate hitting a bomb. The exact position may vary, so retry until we hit a bomb
    let bombHit = false;
    for (let pos = 0; pos < 25; pos++) {
      try {
        await gameContract.connect(owner).makeMoves([pos]);
      } catch (e) {
        bombHit = true;
        break;
      }
    }

    expect(bombHit).to.equal(true);

    // After hitting the bomb, game should no longer be active
    gameState = await gameContract.connect(owner).getGameState();
    expect(gameState.isActive).to.equal(false);
    expect(gameState.winnings).to.equal(0);
    expect(gameState.safeMoves).to.equal(0);
  });
});
