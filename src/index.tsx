import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/index.css";
import "@reef-chain/react-lib/dist/index.css";
import { BrowserRouter as Router } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import { version } from "../package.json";

console.log(`Reef-app version: ${version}`);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
reportWebVitals();
