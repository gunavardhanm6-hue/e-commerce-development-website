// ============================================================
// API ERROR — Custom error class for API errors
// Extends Error with statusCode for HTTP error responses
// ============================================================

/**
 * ApiError — Thrown in services/controllers to trigger
 * the global error handler with the correct HTTP status.
 *
 * @example
 *   throw new ApiError(404, "Product not found");
 *   throw new ApiError(401, "Invalid credentials");
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace (only in V8 engines like Node.js)
    Error.captureStackTrace(this, this.constructor);
  }
}
