// ============================================================
// PROTECTED ROUTE — Route guard for authenticated pages
// Redirects to login if user is not authenticated
// ============================================================

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Loader } from "../ui/Loader";
import { ROUTES } from "../../constants/appConstants";

/**
 * ProtectedRoute — Wraps child components and only renders them
 * if the user is authenticated. Otherwise, redirects to login.
 *
 * During the initial auth check (isLoading), shows a full-screen loader.
 *
 * @example
 *   <Route element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loader while checking auth status
  if (isLoading) {
    return <Loader size="lg" fullScreen text="Authenticating..." />;
  }

  // Redirect to login if not authenticated
  // Save the attempted URL so we can redirect back after login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // User is authenticated — render the protected content
  return <>{children}</>;
};
