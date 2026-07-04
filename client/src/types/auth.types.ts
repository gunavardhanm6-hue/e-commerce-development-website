// ============================================================
// AUTH TYPES — Client-side TypeScript types for authentication
// Mirrors server-side types for type-safe API communication
// ============================================================

/**
 * User — The user object returned from the API
 */
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "customer" | "admin";
  isActive: boolean;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * TokenPair — Access + Refresh tokens from the server
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * LoginCredentials — Data sent to the login endpoint
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * RegisterCredentials — Data sent to the register endpoint
 */
export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * AuthState — Shape of the auth context state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * AuthAction — Discriminated union of all auth actions
 */
export type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: User }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" };
