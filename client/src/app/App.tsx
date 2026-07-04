// ============================================================
// APP — Root application component
// Sets up providers and renders the route tree
// ============================================================

import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { AppRoutes } from "../routes/AppRoutes";

/**
 * App — The root component of the application.
 *
 * Provider hierarchy (outermost → innermost):
 *   1. BrowserRouter — Enables client-side routing
 *   2. AuthProvider — Provides auth state to all components
 *   3. AppRoutes — Renders the matched route
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
