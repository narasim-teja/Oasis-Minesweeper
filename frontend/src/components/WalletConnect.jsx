import React from "react";
import { ethers } from "ethers";
import * as sapphire from "@oasisprotocol/sapphire-paratime";

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
        // Initialize ethers provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // Wrap provider and signer with Sapphire for encryption
        const wrappedProvider = sapphire.wrap(provider);
        const wrappedSigner = sapphire.wrap(signer);

        // Set provider and signer in state
        setProvider(wrappedProvider);

        // Get account address
        const accountAddress = await signer.getAddress();
        setAccount(accountAddress);

        // Fetch balance using the wrapped provider
        const balanceBigNumber = await wrappedProvider.getBalance(accountAddress);
        const balance = ethers.utils.formatEther(balanceBigNumber);
        setBalance(balance);

        // Set up read-only contract instance (wrapped provider)
        const readContractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          wrappedProvider
        );
        setReadContract(readContractInstance);

        // Set up write contract instance (wrapped signer)
        const writeContractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          wrappedSigner
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
