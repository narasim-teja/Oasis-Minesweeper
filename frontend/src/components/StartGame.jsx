/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { ethers } from "ethers";

function StartGame({ writeContract, setGameStarted, onStart }) {
  const startGame = async () => {
    if (writeContract) {
      await onStart(); // Call the passed function to start the game
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
