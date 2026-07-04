// ============================================================
// APP CONSTANTS — Application-wide constant values
// Centralized place for config values used across the app
// ============================================================

/**
 * APP_NAME — Displayed in the navbar, page titles, etc.
 */
export const APP_NAME = "ShopVerse";

/**
 * STORAGE_KEYS — LocalStorage key names
 * Used by the storage utility functions
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "sv_access_token",
  REFRESH_TOKEN: "sv_refresh_token",
  USER: "sv_user",
} as const;

/**
 * ROUTES — Client-side route paths
 * Centralized to avoid magic strings in navigation
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  PROFILE: "/profile",
  ADMIN: "/admin",
} as const;

/**
 * TOAST_DURATION — Default duration for toast notifications (ms)
 */
export const TOAST_DURATION = 4000;

/**
 * PAGINATION — Default pagination values
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
} as const;
