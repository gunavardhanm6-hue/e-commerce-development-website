// ============================================================
// REGISTER PAGE — User registration form
// Collects name, email, password with validation
// ============================================================

import React, { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { validateRegisterForm } from "../validators/authValidator";
import { ROUTES } from "../constants/appConstants";
import "./AuthPages.css";

/**
 * RegisterPage — Renders the registration form inside the AuthLayout.
 *
 * Features:
 *   - First name, last name, email, password fields
 *   - Client-side validation with password strength requirements
 *   - Shows API error messages (e.g., "Email already registered")
 *   - Auto-login after successful registration
 *   - Link to login page
 */
export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  /**
   * handleSubmit — Validates the form and calls the register function.
   * On success, the user is auto-logged in and redirected to home.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    // Client-side validation
    const validation = validateRegisterForm(firstName, lastName, email, password);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});

    try {
      await register({ firstName, lastName, email, password });
      navigate(ROUTES.HOME, { replace: true });
    } catch {
      // Error is handled by AuthContext and displayed via `error` state
    }
  };

  return (
    <div className="auth-page">
      <h1 className="auth-page__title">Create Account</h1>
      <p className="auth-page__subtitle">
        Join us and start shopping today
      </p>

      {/* API Error Message */}
      {error && (
        <div className="auth-page__alert auth-page__alert--error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
        <div className="auth-page__row">
          <Input
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={fieldErrors.firstName}
            placeholder="John"
            autoComplete="given-name"
            id="register-first-name"
          />

          <Input
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={fieldErrors.lastName}
            placeholder="Doe"
            autoComplete="family-name"
            id="register-last-name"
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          placeholder="you@example.com"
          autoComplete="email"
          id="register-email"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          placeholder="Min 8 chars, uppercase, lowercase, number"
          helperText="Must be 8+ characters with uppercase, lowercase, and a number"
          autoComplete="new-password"
          id="register-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          id="register-submit"
        >
          Create Account
        </Button>
      </form>

      <p className="auth-page__footer-text">
        Already have an account?{" "}
        <Link to={ROUTES.LOGIN} className="auth-page__link">
          Sign in
        </Link>
      </p>
    </div>
  );
};
