/* eslint-disable no-unused-vars */
import { Contract_ABI, Contract_address } from "./constants";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Header from "./components/Header";
import WalletConnect from "./components/WalletConnect";
import StartGame from "./components/StartGame";
import GameBoard from "./components/GameBoard";
import CountdownTimer from "./components/CountdownTimer";

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [provider, setProvider] = useState(null);
  const [readContract, setReadContract] = useState(null);
  const [writeContract, setWriteContract] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedCellsDisplay, setSelectedCellsDisplay] = useState("");
  const [sessionGameActive, setSessionGameActive] = useState(false);
  const [sessionWinnings, setSessionWinnings] = useState("");
  const [sessionSafeMoves, setSessionSafeMoves] = useState("");
  const [sessionSelectedMoves, setSessionSelectedMoves] = useState([]);
  const [sessionRemainingTime, setSessionRemainingTime] = useState(0);
  const [allSelectedCells, setAllSelectedCells] = useState([]);

  const CONTRACT_ADDRESS = Contract_address;
  const CONTRACT_ABI = Contract_ABI;

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const minesweeperContract = new ethers.Contract(Contract_address, Contract_ABI, signer);
    setReadContract(minesweeperContract);
    setWriteContract(minesweeperContract);

    // Listen for events
    minesweeperContract.on("GameStarted", (player, betAmount) => {
      toast.success(`Game started with bet: ${ethers.utils.formatEther(betAmount)} ETH`);
    });

    minesweeperContract.on("PlayerHitMine", (player, lostAmount) => {
      toast.error(`Hit a mine! Lost: ${ethers.utils.formatEther(lostAmount)} ETH`);
    });

    minesweeperContract.on("GameCashOut", (player, winnings) => {
      toast.success(`Cashed out: ${ethers.utils.formatEther(winnings)} ETH`);
    });

    minesweeperContract.on("WinningsWithdrawn", (player, amount) => {
      toast.success(`Withdrawn: ${ethers.utils.formatEther(amount)} ETH`);
    });

    // Clean up event listeners
    return () => {
      minesweeperContract.removeAllListeners();
    };
  }, []);

  const promiseToast = (promise, loadingMessage, successMessage, errorMessage) => {
    const toastId = toast.loading(loadingMessage, { duration: Infinity });
    
    promise
      .then(() => {
        toast.success(successMessage, { id: toastId, duration: 3000 });
      })
      .catch((error) => {
        toast.error(errorMessage, { id: toastId, duration: 3000 });
        console.error(error);
      });

    return promise;
  };

  const fetchGameState = async () => {
    if (readContract) {
      try {
        const gameState = await readContract.getGameState();
        const [isActive, winnings, safeMoves, remainingTime, selectedMoves] = gameState;
        
        setSessionGameActive(isActive);
        setSessionWinnings(ethers.utils.formatEther(winnings));
        setSessionSafeMoves(safeMoves.toString());
        setSessionRemainingTime(Number(remainingTime));
        setSessionSelectedMoves(selectedMoves);
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    }
  };

  const handleTimeUp = () => {
    toast.error("Time's up! The game session has ended.");
    fetchGameState();
  };

  useEffect(() => {
    if (walletConnected && readContract) {
      fetchGameState();
      setAllSelectedCells([]); // Reset all selected cells when starting a new game
    }
  }, [walletConnected, readContract]);

  const handleWalletConnect = () => {
    fetchGameState();
  };

  const handleStartGame = async () => {
    try {
      if (writeContract) {
        try {
          await promiseToast(
            writeContract.startGame({ value: ethers.utils.parseEther("0.1") }).then(tx => tx.wait()),
            'Starting game...',
            'Game started successfully!',
            'Failed to start game. Please try again.'
          );
          setGameStarted(true);
          fetchGameState();
        } catch (error) {
          console.error("Error starting game:", error);
        }
      }
    } catch (error) {
      handleError(error)
    }
    
  };

  const handleSubmit = async () => {
    try {
      const newSelectedCells = selectedCells.filter(cell => !allSelectedCells.includes(cell));
      const sortedCells = newSelectedCells.sort((a, b) => a - b);
      setSelectedCellsDisplay(sortedCells.map(cell => cell + 1).join(", "));

      if (writeContract && newSelectedCells.length > 0) {
        try {
          await promiseToast(
            writeContract.makeMoves(sortedCells).then(tx => tx.wait()),
            'Submitting moves...',
            'Moves submitted successfully!',
            'Failed to submit moves. Please try again.'
          );
          setAllSelectedCells(prev => [...prev, ...newSelectedCells]);
          setSessionSelectedMoves(prev => [...prev, newSelectedCells]);
          setSelectedCells([]);
          console.log("Moves submitted:", sortedCells);
          fetchGameState();
        } catch (error) {
          console.error("Error submitting moves:", error);
        }
      } else if (newSelectedCells.length === 0) {
        toast.error('No new cells selected', { duration: 3000 });
      }
    } catch (error) {
      handleError(error)
    }
  };

  const handleCellClick = (cellNumber) => {
    if (!allSelectedCells.includes(cellNumber)) {
      setSelectedCells((prevSelected) => {
        if (prevSelected.includes(cellNumber)) {
          return prevSelected.filter((cell) => cell !== cellNumber);
        } else {
          return [...prevSelected, cellNumber];
        }
      });
    }
  };

  const handleRestartGame = async () => {
    setSelectedCells([]);
    setSelectedCellsDisplay("");
    setSessionGameActive(false);
    setSessionWinnings("");
    setSessionSafeMoves("");
    setSessionSelectedMoves([]);
    setSessionRemainingTime(0);
    setGameStarted(false);
    setAllSelectedCells([]);
    toast.success('Game restarted. Start a new game session!');
  };

  const handleCashout = async () => {
    try {
      if (writeContract) {
        try {
          await promiseToast(
            writeContract.cashOut().then(tx => tx.wait()),
            'Cashing out...',
            'Cashed out successfully!',
            'Failed to cash out. Please try again.'
          );
          fetchGameState();
        } catch (error) {
          console.error("Error cashing out:", error);
        }
      }
    } catch (error) {
      handleError(error)
    }
  };

  const handleWithdraw = async () => {
    try {
      if (writeContract) {
        try {
          await promiseToast(
            writeContract.withdraw().then(tx => tx.wait()),
            'Withdrawing...',
            'Withdrawn successfully!',
            'Failed to withdraw. Please try again.'
          );
          fetchGameState();
        } catch (error) {
          console.error("Error withdrawing:", error);
        }
      }
    } catch (error) {
      handleError(error)
    }
    
  };

  const handleError = (error) => {
    console.error("Error:", error);
    if (error.data) {
      // This is likely a revert error from the contract
      toast.error(`Transaction failed: ${error.data.message}`);
    } else if (error.message) {
      // This could be a network error or other JavaScript error
      toast.error(`Error: ${error.message}`);
    } else {
      // Fallback error message
      toast.error("An unknown error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          style: {
            background: '#333',
            color: '#fff',
          },
        }} 
      />
      <Header walletConnected={walletConnected} account={account} balance={balance} />
      <div className="container mx-auto px-4 py-8">
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
            onConnect={handleWalletConnect}
          />
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Minesweeper Game</h1>
              <button
                onClick={handleWithdraw}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Withdraw to Account
              </button>
            </div>

            {!sessionGameActive ? (
              <div className="text-center">
                <p className="mb-4">Start a new game session to play!</p>
                <StartGame writeContract={writeContract} setGameStarted={setGameStarted} onStart={handleStartGame} />
              </div>
            ) : (
              <>
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h2 className="text-2xl font-semibold mb-4">Game Stats</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Winnings</p>
                      <p className="text-xl font-bold">{sessionWinnings} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Safe Moves</p>
                      <p className="text-xl font-bold">{sessionSafeMoves}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Remaining Time</p>
                      <p className="text-xl font-bold">
                        <CountdownTimer 
                          initialTime={sessionRemainingTime} 
                          onTimeUp={handleTimeUp}
                        />
                      </p>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleRestartGame}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        Restart Game
                      </button>
                    </div>
                  </div>
                </div>
                <GameBoard 
                  onCellClick={handleCellClick} 
                  selectedCells={selectedCells} 
                  sessionSelectedMoves={sessionSelectedMoves}
                />
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Submit Moves
                  </button>
                  <button
                    onClick={handleCashout}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    Cashout Session
                  </button>
                </div>
                {selectedCellsDisplay && (
                  <div className="text-center mt-4">
                    <h3 className="text-xl font-semibold">Selected Cells</h3>
                    <p className="text-lg">{selectedCellsDisplay}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;