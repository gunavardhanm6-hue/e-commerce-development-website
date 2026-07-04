// ============================================================
// MAIN LAYOUT — Primary layout with Navbar + Footer
// Wraps all main pages (home, products, cart, etc.)
// ============================================================

import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/navbar/Navbar";
import { Footer } from "../components/footer/Footer";
import "./MainLayout.css";

/**
 * MainLayout — Wraps pages with the shared Navbar and Footer.
 * Uses React Router's <Outlet /> to render child routes.
 *
 * Structure:
 *   Navbar
 *   ├── <main> → Page content (via Outlet)
 *   Footer
 */
export const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-layout__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
