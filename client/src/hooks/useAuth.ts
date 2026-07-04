// ============================================================
// useAuth HOOK — Custom hook to consume the AuthContext
// Provides type-safe access to auth state and actions
// ============================================================

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * useAuth — Hook to access authentication state and actions.
 *
 * Must be used within an AuthProvider. Throws an error if used
 * outside the provider to catch bugs early.
 *
 * @returns { user, isAuthenticated, isLoading, error, login, register, logout, clearError }
 *
 * @example
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
