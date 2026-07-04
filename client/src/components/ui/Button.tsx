// ============================================================
// BUTTON — Reusable button component
// Supports variants, sizes, loading states, and icons
// ============================================================

import React from "react";
import "./Button.css";

/**
 * ButtonProps — Configuration options for the Button component
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Button — A styled, reusable button component.
 *
 * @example
 *   <Button variant="primary" size="lg" onClick={handleClick}>
 *     Click Me
 *   </Button>
 *
 *   <Button variant="outline" isLoading={true}>
 *     Submitting...
 *   </Button>
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${fullWidth ? "btn--full" : ""} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="btn__loader">
          <span className="btn__spinner" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
