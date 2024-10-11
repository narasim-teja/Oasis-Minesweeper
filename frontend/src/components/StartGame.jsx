import React from "react";
import { ethers } from "ethers";

function StartGame({ writeContract, setGameStarted }) {
  const startGame = async () => {
    if (writeContract) {
      try {
        // Specify the deposit amount (e.g., 0.1 ETH)
        const depositAmount = ethers.utils.parseEther("0.1");

        // Call the startGame function on the smart contract with the deposit amount
        const tx = await writeContract.startGame({ value: depositAmount });
        await tx.wait();

        setGameStarted(true);
        console.log("Game started with deposit:", depositAmount.toString());
      } catch (error) {
        console.error("Error starting game:", error);
      }
    } else {
      console.error("writeContract is not initialized.");
    }
  };

  return (
    <button
      onClick={startGame}
      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Start Game
    </button>
  );
}

export default StartGame;
