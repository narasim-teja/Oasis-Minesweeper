/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
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
        // Initialize ethers provider and signer from MetaMask
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // Get account address
        const accountAddress = await signer.getAddress();
        setAccount(accountAddress);

        // Fetch balance using the provider
        const balanceBigNumber = await provider.getBalance(accountAddress);
        const balance = ethers.utils.formatEther(balanceBigNumber);
        setBalance(balance);

        // Initialize read-only provider (directly to Sapphire node)
        const readProvider = new ethers.providers.JsonRpcProvider(
          "https://testnet.sapphire.oasis.dev"
        );
        console.log(readProvider)
        const wrappedSigner = sapphire.wrap(signer);

        // Set up read-only contract instance
        const readContractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          wrappedSigner
        );
        setReadContract(readContractInstance);

        // Wrap signer with Sapphire for write operations
        

        // Set up write contract instance
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
