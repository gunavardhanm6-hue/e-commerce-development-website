// ============================================================
// INPUT — Reusable form input component
// Supports labels, error messages, icons, and different types
// ============================================================

import React, { useState } from "react";
import "./Input.css";

/**
 * InputProps — Configuration options for the Input component
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

/**
 * Input — A styled, reusable input component with label and error display.
 *
 * @example
 *   <Input
 *     label="Email Address"
 *     type="email"
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *     error={errors.email}
 *     placeholder="you@example.com"
 *   />
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  id,
  type = "text",
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const isPassword = type === "password";

  return (
    <div className={`input-group ${error ? "input-group--error" : ""} ${className}`}>
      {label && (
        <label className="input-group__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="input-group__wrapper">
        {icon && <span className="input-group__icon">{icon}</span>}
        <input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          className={`input-group__input ${icon ? "input-group__input--with-icon" : ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-group__toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {error && <span className="input-group__error">{error}</span>}
      {helperText && !error && (
        <span className="input-group__helper">{helperText}</span>
      )}
    </div>
  );
};
