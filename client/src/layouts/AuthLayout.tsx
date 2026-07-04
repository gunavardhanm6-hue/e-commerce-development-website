// ============================================================
// AUTH LAYOUT — Layout for login/register pages
// Centered card with no navbar/footer for a clean auth experience
// ============================================================

import React from "react";
import { Outlet, Link } from "react-router-dom";
import { APP_NAME, ROUTES } from "../constants/appConstants";
import "./AuthLayout.css";

/**
 * AuthLayout — Wraps authentication pages (login, register).
 * Shows a centered card with the logo. No navbar or footer.
 *
 * Structure:
 *   Background gradient
 *   ├── Logo (links back to home)
 *   ├── <Outlet /> → Auth form (login/register page)
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout">
      {/* Decorative background orbs */}
      <div className="auth-layout__orb auth-layout__orb--1" />
      <div className="auth-layout__orb auth-layout__orb--2" />
      <div className="auth-layout__orb auth-layout__orb--3" />

      <div className="auth-layout__content">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="auth-layout__logo">
          <span className="auth-layout__logo-icon">◆</span>
          <span className="auth-layout__logo-text">{APP_NAME}</span>
        </Link>

        {/* Auth Form Content */}
        <div className="auth-layout__card">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
