// ============================================================
// API RESPONSE — Standardized API response wrapper
// Ensures all successful responses have the same shape
// ============================================================

/**
 * ApiResponse — Wraps successful API responses in a consistent format.
 *
 * @example
 *   res.status(200).json(new ApiResponse(200, userData, "Login successful"));
 *   res.status(201).json(new ApiResponse(201, newProduct, "Product created"));
 */
export class ApiResponse<T = unknown> {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data: T;

  constructor(statusCode: number, data: T, message = "Success") {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
