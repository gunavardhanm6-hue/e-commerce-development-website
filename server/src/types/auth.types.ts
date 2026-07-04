// ============================================================
// AUTH TYPES — Type definitions for authentication
// Token payloads, request bodies, and response shapes
// ============================================================

/**
 * TokenPayload — Data stored inside the JWT token
 * Used when signing and verifying tokens
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: "customer" | "admin";
}

/**
 * TokenPair — Access + Refresh token pair
 * Returned to the client on login/register/refresh
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * RegisterRequestBody — Shape of the register endpoint body
 */
export interface RegisterRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * LoginRequestBody — Shape of the login endpoint body
 */
export interface LoginRequestBody {
  email: string;
  password: string;
}
