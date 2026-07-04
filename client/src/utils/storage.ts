// ============================================================
// STORAGE UTILS — LocalStorage helper functions
// Type-safe wrappers for get/set/remove operations
// ============================================================

import { STORAGE_KEYS } from "../constants/appConstants";

/**
 * getAccessToken — Retrieves the access token from localStorage
 * @returns The access token string, or null if not found
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * getRefreshToken — Retrieves the refresh token from localStorage
 * @returns The refresh token string, or null if not found
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * setTokens — Stores both access and refresh tokens in localStorage
 * @param accessToken - The JWT access token
 * @param refreshToken - The JWT refresh token
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
};

/**
 * clearTokens — Removes all auth-related data from localStorage
 * Called on logout or when tokens are invalid.
 */
export const clearTokens = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * setStoredUser — Saves user data to localStorage for quick access
 * @param user - The user object to store
 */
export const setStoredUser = <T>(user: T): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

/**
 * getStoredUser — Retrieves user data from localStorage
 * @returns Parsed user object, or null if not found
 */
export const getStoredUser = <T>(): T | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
};
