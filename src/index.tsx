import React from 'react';
import ReactDOM from 'react-dom';
import './assets/index.css';
import '@reef-chain/react-lib/dist/index.css';
import {
  BrowserRouter as Router,
} from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import App from './App';
import { version } from '../package.json';
import { createRoot } from 'react-dom/client';

console.log(`Reef-app version: ${version}`);

createRoot(document.getElementById('root')!).render(<React.StrictMode><Router><App /></Router></React.StrictMode>);

reportWebVitals();