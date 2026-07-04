// ============================================================
// APP ROUTES — Centralized route definitions
// Maps URL paths to page components with layouts
// ============================================================

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ProductListPage } from "../pages/ProductListPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { OrdersPage } from "../pages/OrdersPage";
import { AdminPage } from "../pages/AdminPage";
import { useAuth } from "../hooks/useAuth";

/**
 * ProtectedRoute — Redirects to login if not authenticated
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/**
 * AppRoutes — Defines all client-side routes.
 *
 * Route Structure:
 *   / (MainLayout)
 *   ├── / → HomePage
 *   ├── /products → ProductListPage
 *   ├── /products/:id → ProductDetailPage
 *   ├── /cart → CartPage (protected)
 *   ├── /checkout → CheckoutPage (protected)
 *   ├── /orders → OrdersPage (protected)
 *   └── /admin → AdminPage (protected + admin)
 *
 *   /login, /register (AuthLayout)
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ---- Main Layout Routes (with Navbar + Footer) ---- */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Protected Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ---- Auth Layout Routes (centered card, no Navbar) ---- */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ---- Catch all ---- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
