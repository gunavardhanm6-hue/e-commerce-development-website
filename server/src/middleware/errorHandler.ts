// ============================================================
// ERROR HANDLER — Global Express error handling middleware
// Catches all errors and returns consistent JSON responses
// ============================================================

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { envConfig } from "../config/env.config";

/**
 * errorHandler — Global error handler middleware.
 * Must be registered LAST in the middleware chain.
 *
 * Handles:
 *   - ApiError instances (custom errors with statusCode)
 *   - Mongoose ValidationError
 *   - Mongoose CastError (invalid ObjectId)
 *   - Mongoose duplicate key error (code 11000)
 *   - Generic/unknown errors (500)
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";

  // --- Handle custom ApiError ---
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // --- Handle Mongoose validation errors ---
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }

  // --- Handle Mongoose CastError (invalid ObjectId) ---
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // --- Handle Mongoose duplicate key error ---
  if ((err as any).code === 11000) {
    statusCode = 409;
    message = "Duplicate field value — this resource already exists";
  }

  // --- Log error in development ---
  if (envConfig.NODE_ENV === "development") {
    console.error("🔴 Error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  // --- Send error response ---
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(envConfig.NODE_ENV === "development" && { stack: err.stack }),
  });
};
