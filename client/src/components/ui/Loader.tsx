// ============================================================
// LOADER — Loading spinner component
// Used for page loading states and async operations
// ============================================================

import React from "react";
import "./Loader.css";

/**
 * LoaderProps — Configuration for the Loader component
 */
interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

/**
 * Loader — A spinning loading indicator.
 *
 * @example
 *   <Loader />                           // Default medium spinner
 *   <Loader size="lg" fullScreen />       // Full-screen overlay spinner
 *   <Loader size="sm" text="Loading..." /> // Small spinner with text
 */
export const Loader: React.FC<LoaderProps> = ({
  size = "md",
  fullScreen = false,
  text,
}) => {
  const spinner = (
    <div className={`loader loader--${size}`}>
      <div className="loader__ring">
        <div className="loader__ring-segment" />
        <div className="loader__ring-segment" />
        <div className="loader__ring-segment" />
      </div>
      {text && <p className="loader__text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loader__overlay">{spinner}</div>;
  }

  return spinner;
};
