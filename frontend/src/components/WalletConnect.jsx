import React from "react";
import { ethers } from "ethers";
import * as sapphire from '@oasisprotocol/sapphire-paratime';

function WalletConnect({
  setProvider,
  setAccount,
  setBalance,
  setReadContract,
  setWriteContract,
  setWalletConnected,
  contractAddress,
  contractABI,
}) {
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Wrap MetaMask's provider with Sapphire for transaction encryption
        const provider = sapphire.wrap(new ethers.BrowserProvider(window.ethereum));
        setProvider(provider);

        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const signer = await provider.getSigner();
        const accountAddress = accounts[0];
        setAccount(accountAddress);

        // Fetch balance
        const balance = await provider.getBalance(accountAddress);
        setBalance(ethers.formatEther(balance));

        // Set up read-only contract instance (for view functions)
        const readContractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );
        setReadContract(readContractInstance);

        // Set up write contract instance (for transactions)
        const writeContractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setWriteContract(writeContractInstance);

        setWalletConnected(true);
      } catch (error) {
        console.error("Error connecting to MetaMask or Sapphire:", error);
      }
    } else {
      alert("MetaMask is not installed! Please install MetaMask to continue.");
    }
  };

  return (
    <button
      onClick={connectWallet}
      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  );
}

export default WalletConnect;
