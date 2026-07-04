// ============================================================
// API ENDPOINTS — Centralized API URL constants
// All API paths are defined here to avoid magic strings
// ============================================================

/**
 * API_ENDPOINTS — Map of all server API endpoint paths.
 * Grouped by module for easy navigation.
 */
export const API_ENDPOINTS = {
  // ---- Authentication ----
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },

  // ---- Products ----
  PRODUCTS: {
    LIST: "/api/products",
    ADMIN_LIST: "/api/products/admin/all",
    DETAIL: (id: string) => `/api/products/${id}`,
    CREATE: "/api/products",
    UPDATE: (id: string) => `/api/products/${id}`,
    UPDATE_STOCK: (id: string) => `/api/products/${id}/stock`,
    DELETE: (id: string) => `/api/products/${id}`,
  },

  // ---- Cart ----
  CART: {
    GET: "/api/cart",
    ADD: "/api/cart/add",
    UPDATE: "/api/cart/update",
    REMOVE: (itemId: string) => `/api/cart/remove/${itemId}`,
    SAVE_FOR_LATER: (itemId: string) => `/api/cart/save-for-later/${itemId}`,
    MOVE_TO_CART: (itemId: string) => `/api/cart/move-to-cart/${itemId}`,
  },

  // ---- Checkout ----
  CHECKOUT: {
    VALIDATE: "/api/checkout/validate",
    PROCESS: "/api/checkout",
  },

  // ---- Orders ----
  ORDERS: {
    LIST: "/api/orders",
    DETAIL: (id: string) => `/api/orders/${id}`,
  },
} as const;
