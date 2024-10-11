import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import './index.css';

// Setting up list of evmNetworks
const evmNetworks = [
  {
    blockExplorerUrls: ['https://testnet.explorer.sapphire.oasis.dev'],
    chainId: 23295, // 23295 in decimal, 0x5B4F in hex
    chainName: 'Oasis Sapphire Testnet',
    iconUrls: ["../oasis_logo.png"],
    name: 'Oasis Sapphire Testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'ROSE',
      symbol: 'TEST',
    },
    networkId: 23295,
    rpcUrls: ['https://testnet.sapphire.oasis.dev'],
    vanityName: 'Oasis Sapphire Testnet',
  }
];

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: "d26a13e5-58d2-44a0-9820-f774949d6059",
        walletConnectors: [ EthereumWalletConnectors ],
        overrides: { evmNetworks },
      }}
    >
      <App />
    </DynamicContextProvider>
  </StrictMode>,
);
