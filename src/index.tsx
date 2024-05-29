import React from 'react';
import './assets/index.css';
import '@reef-chain/react-lib/dist/index.css';
import {
  BrowserRouter as Router,
} from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import App from './App';
import { version } from '../package.json';
import { ConnectedWalletProvider } from './context/ConnectedWalletContext';
import { WcPreloaderProvider } from './context/WcPreloaderContext';

console.log(`Reef-app version: ${version}`);

createRoot(document.getElementById('root')!).render(<React.StrictMode><Router>
  <ConnectedWalletProvider>
  <WcPreloaderProvider>
  <App />
  </WcPreloaderProvider>
  </ConnectedWalletProvider>
  </Router></React.StrictMode>);

reportWebVitals();
