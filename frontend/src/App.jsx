/* eslint-disable no-unused-vars */
import { getSigner, getWeb3Provider } from "@dynamic-labs/ethers-v6";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Contract, parseEther, formatEther } from "ethers";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Header from "./components/Header";
import StartGame from "./components/StartGame";
import GameBoard from "./components/GameBoard";
import CountdownTimer from "./components/CountdownTimer";
import { Contract_ABI, Contract_address } from "./constants";
import * as sapphire from "@oasisprotocol/sapphire-paratime";
import { useRef } from 'react';

function App() {
  const [balance, setBalance] = useState("");
  const [contract, setContract] = useState(null);
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

  const {
    primaryWallet,
    setShowAuthFlow,
  } = useDynamicContext();

  const walletConnected = !!primaryWallet;
  const account = primaryWallet?.address || "";

  // Event handler functions
  const handleGameStarted = (player, betAmount) => {
    toast.success(`Game started with bet: ${formatEther(betAmount)} ETH`);
  };

  const handlePlayerHitMine = (player, lostAmount) => {
    toast.error(`Hit a mine! Lost: ${formatEther(lostAmount)} ETH`);
  };

  const handleGameCashOut = (player, winnings) => {
    toast.success(`Cashed out: ${formatEther(winnings)} ETH`);
  };

  const handleWinningsWithdrawn = (player, amount) => {
    toast.success(`Withdrawn: ${formatEther(amount)} ETH`);
  };

  useEffect(() => {
    const init = async () => {
      if (primaryWallet) {
        try {
          const dynamicProvider = await getWeb3Provider(primaryWallet);
          const dynamicSigner = await getSigner(primaryWallet);
          const wrappedSigner = sapphire.wrap(dynamicSigner);

          // Initialize contract
          const contractInstance = new Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            wrappedSigner
          );
          setContract(contractInstance);

          // Fetch balance
          const balanceBigInt = await wrappedSigner.provider.getBalance(account);
          const balance = formatEther(balanceBigInt);
          setBalance(balance);

          // Fetch initial game state
          fetchGameState();
        } catch (error) {
          console.error("Error initializing provider and signer", error);
        }
      }
    };

    init();
  }, [primaryWallet]);

  useEffect(() => {
    if (contract) {
      // Attach event listeners
      contract.on("GameStarted", handleGameStarted);
      contract.on("PlayerHitMine", handlePlayerHitMine);
      contract.on("GameCashOut", handleGameCashOut);
      contract.on("WinningsWithdrawn", handleWinningsWithdrawn);

      // Cleanup function to remove listeners
      return () => {
        contract.off("GameStarted", handleGameStarted);
        contract.off("PlayerHitMine", handlePlayerHitMine);
        contract.off("GameCashOut", handleGameCashOut);
        contract.off("WinningsWithdrawn", handleWinningsWithdrawn);
      };
    }
  }, [contract]);

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
    if (contract) {
      try {
        const gameState = await contract.getGameState();
        console.log("GameState:", gameState);

        // Access return values using indices
        const isActive = gameState[0];
        const winnings = gameState[1];
        const safeMoves = gameState[2];
        const remainingTime = gameState[3];
        const selectedMoves = gameState[4];

        console.log("isActive:", isActive);
        console.log("winnings:", winnings);
        console.log("safeMoves:", safeMoves);
        console.log("remainingTime:", remainingTime);
        console.log("selectedMoves:", selectedMoves);

        // Handle BigInt conversion if necessary
        const selectedMovesArray = selectedMoves.map((move) => Number(move.toString()));

        // Update state
        setSessionGameActive(isActive);
        setSessionWinnings(formatEther(winnings));
        setSessionSafeMoves(safeMoves.toString());
        setSessionRemainingTime(Number(remainingTime.toString()));
        setSessionSelectedMoves(selectedMovesArray);
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
    if (walletConnected && contract) {
      fetchGameState();
      setAllSelectedCells([]); // Reset all selected cells when starting a new game
    }
  }, [walletConnected, contract]);

  const handleStartGame = async () => {
    try {
      if (contract) {
        try {
          // Perform a static call to simulate the transaction
          await contract.startGame.staticCall({ value: parseEther("0.1") });

          // Proceed with sending the transaction
          await promiseToast(
            contract.startGame({ value: parseEther("0.1") }).then(tx => tx.wait()),
            'Starting game...',
            'Game started successfully!',
            'Failed to start game. Please try again.'
          );
          fetchGameState();
        } catch (error) {
          console.error("Error starting game:", error);
          handleError(error);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const newSelectedCells = selectedCells.filter(cell => !allSelectedCells.includes(cell));
      const sortedCells = newSelectedCells.sort((a, b) => a - b);
      setSelectedCellsDisplay(sortedCells.map(cell => cell + 1).join(", "));

      if (contract && newSelectedCells.length > 0) {
        try {
          // Perform a static call to simulate the transaction
          await contract.makeMoves.staticCall(sortedCells);

          // Proceed with sending the transaction
          await promiseToast(
            contract.makeMoves(sortedCells).then(tx => tx.wait()),
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
          handleError(error);
        }
      } else if (newSelectedCells.length === 0) {
        toast.error('No new cells selected', { duration: 3000 });
      }
    } catch (error) {
      handleError(error);
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
    setAllSelectedCells([]);
    toast.success('Game restarted. Start a new game session!');
  };

  const handleCashout = async () => {
    try {
      if (contract) {
        try {
          // Perform a static call to simulate the transaction
          await contract.cashOut.staticCall();

          // Proceed with sending the transaction
          await promiseToast(
            contract.cashOut().then(tx => tx.wait()),
            'Cashing out...',
            'Cashed out successfully!',
            'Failed to cash out. Please try again.'
          );
          fetchGameState();
        } catch (error) {
          console.error("Error cashing out:", error);
          handleError(error);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleWithdraw = async () => {
    try {
      if (contract) {
        try {
          // Perform a static call to simulate the transaction
          await contract.withdraw.staticCall();

          // Proceed with sending the transaction
          await promiseToast(
            contract.withdraw().then(tx => tx.wait()),
            'Withdrawing...',
            'Withdrawn successfully!',
            'Failed to withdraw. Please try again.'
          );
          fetchGameState();
        } catch (error) {
          console.error("Error withdrawing:", error);
          handleError(error);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleError = (error) => {
    console.error("Error:", error);
    if (error.data) {
      toast.error(`Transaction failed: ${error.data.message}`);
    } else if (error.message) {
      toast.error(`Error: ${error.message}`);
    } else {
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
      <Header balance={balance} account={account} />
      <div className="container mx-auto px-4 py-8">
        {!walletConnected ? (
          <div className="flex justify-center">
            {/* Show the DynamicWidget for wallet connection */}
            <button
              onClick={() => setShowAuthFlow(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          </div>
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
                <StartGame onStart={handleStartGame} />
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
