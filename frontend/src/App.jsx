
import { Contract_ABI, Contract_address } from "./constants"; 

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import WalletConnect from "./components/WalletConnect";
import StartGame from "./components/StartGame";
import GameBoard from "./components/GameBoard";

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [provider, setProvider] = useState(null); // Ethereum provider
  const [readContract, setReadContract] = useState(null); // Read-only contract instance
  const [writeContract, setWriteContract] = useState(null); // Write contract instance
  const [walletConnected, setWalletConnected] = useState(false); // Is wallet connected?
  const [gameStarted, setGameStarted] = useState(false); // Is game started?
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedCellsDisplay, setSelectedCellsDisplay] = useState("");

  const CONTRACT_ADDRESS = Contract_address; // Your contract address
  const CONTRACT_ABI = Contract_ABI; // Your contract ABI

  // Fetch game state after wallet is connected
  const fetchGameState = async () => {
    if (readContract) {
      try {
        const gameState = await readContract.getGameState();
        console.log("Game State:", gameState);
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    }
  };

  useEffect(() => {
    if (walletConnected && readContract) {
      fetchGameState();
    }
  }, [walletConnected, readContract]);

  // Handle cell selection
  const handleCellClick = (cellNumber) => {
    setSelectedCells((prevSelected) => {
      if (prevSelected.includes(cellNumber)) {
        return prevSelected.filter((num) => num !== cellNumber);
      } else {
        return [...prevSelected, cellNumber];
      }
    });
  };

  // Handle game submission
  const handleSubmit = async () => {
    const sortedCells = selectedCells.sort((a, b) => a - b);
    setSelectedCellsDisplay(sortedCells.join(", "));

    if (writeContract && selectedCells.length > 0) {
      try {
        const tx = await writeContract.makeMoves(sortedCells);
        await tx.wait();
        console.log("Moves submitted:", sortedCells);
      } catch (error) {
        console.error("Error submitting moves:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <Header walletConnected={walletConnected} account={account} balance={balance} />
      <div className="mt-8">
        {!walletConnected ? (
          <WalletConnect
            setProvider={setProvider}
            setAccount={setAccount}
            setBalance={setBalance}
            setReadContract={setReadContract}
            setWriteContract={setWriteContract}
            setWalletConnected={setWalletConnected}
            contractAddress={CONTRACT_ADDRESS}
            contractABI={CONTRACT_ABI}
          />
        ) : !gameStarted ? (
          <StartGame writeContract={writeContract} setGameStarted={setGameStarted} />
        ) : (
          <>
            <GameBoard onCellClick={handleCellClick} selectedCells={selectedCells} />
            <button
              onClick={handleSubmit}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit Moves
            </button>
            {selectedCellsDisplay && (
              <h1 className="mt-4 text-xl font-bold text-gray-800">
                Selected Cells: {selectedCellsDisplay}
              </h1>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
