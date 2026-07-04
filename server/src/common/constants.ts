// ============================================================
// COMMON CONSTANTS — Server-wide constant values
// Centralized place for magic strings/numbers
// ============================================================

/**
 * HTTP_STATUS — Standard HTTP status codes
 * Use these instead of raw numbers for readability
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * USER_ROLES — Available user roles in the system
 */
export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
} as const;

/**
 * COOKIE_NAMES — Names of cookies used in the application
 */
export const COOKIE_NAMES = {
  REFRESH_TOKEN: "refreshToken",
} as const;

/**
 * BCRYPT_SALT_ROUNDS — Number of salt rounds for password hashing
 * Higher = more secure but slower. 12 is a good balance.
 */
export const BCRYPT_SALT_ROUNDS = 12;
