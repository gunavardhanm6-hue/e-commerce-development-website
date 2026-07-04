// ============================================================
// LOGIN PAGE — User authentication form
// Email + password login with validation and error handling
// ============================================================

import React, { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { validateLoginForm } from "../validators/authValidator";
import { ROUTES } from "../constants/appConstants";
import "./AuthPages.css";

/**
 * LoginPage — Renders the login form inside the AuthLayout.
 *
 * Features:
 *   - Email + password fields with validation
 *   - Shows API error messages
 *   - Redirects to the page the user tried to access (if any)
 *   - Link to register page
 */
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page the user was trying to access before being redirected
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.HOME;

  /**
   * handleSubmit — Validates the form and calls the login function.
   * On success, navigates to the originally requested page.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    // Client-side validation
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch {
      // Error is handled by AuthContext and displayed via `error` state
    }
  };

  return (
    <div className="auth-page">
      <h1 className="auth-page__title">Welcome Back</h1>
      <p className="auth-page__subtitle">
        Sign in to your account to continue
      </p>

      {/* API Error Message */}
      {error && (
        <div className="auth-page__alert auth-page__alert--error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          placeholder="you@example.com"
          autoComplete="email"
          id="login-email"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
          id="login-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          id="login-submit"
        >
          Sign In
        </Button>
      </form>

      <p className="auth-page__footer-text">
        Don't have an account?{" "}
        <Link to={ROUTES.REGISTER} className="auth-page__link">
          Create one
        </Link>
      </p>
    </div>
  );
};
