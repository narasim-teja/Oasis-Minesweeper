import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { Analytics } from '@vercel/analytics/react';
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
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [ EthereumWalletConnectors ],
        overrides: { evmNetworks },
        events: {
          onLogout: (args) => {
            localStorage.removeItem("auth");
            window.location.reload();
            console.log("onLogout was called", args);
          },
        },
      }}
    >
      <App />
      <Analytics />
    </DynamicContextProvider>
  </StrictMode>,
);
