// ============================================================
// MAIN ENTRY POINT — Application bootstrap
// Imports global styles and mounts the React app
// ============================================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/reset.css";
import "./styles/globals.css";

/**
 * Entry point — Mounts the React app to the #root DOM element.
 * StrictMode enables development-only checks for common bugs.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
