require("@oasisprotocol/sapphire-hardhat");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();


module.exports = {
  solidity: "0.8.9",
  networks: {
    sapphire: {
      url: "https://testnet.sapphire.oasis.dev",
      chainId: 23295, // Testnet chain ID
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
