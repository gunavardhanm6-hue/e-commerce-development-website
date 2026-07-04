// ============================================================
// API TYPES — Generic API response types
// Used to type the responses from all API endpoints
// ============================================================

/**
 * ApiResponse — Standard wrapper for all successful API responses
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

/**
 * ApiErrorResponse — Standard wrapper for error responses
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  stack?: string;
}

/**
 * PaginatedResponse — Wrapper for paginated list endpoints
 * (will be used by product listing, orders, etc.)
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
