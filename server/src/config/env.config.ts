// ============================================================
// ENV CONFIG — Validates and exports environment variables
// Uses dotenv to load .env file and provides typed access
// ============================================================

import dotenv from "dotenv";

dotenv.config();

/**
 * envConfig — Centralized environment variable access
 * All env vars should be accessed through this object
 * to ensure they exist and have sensible defaults.
 */
export const envConfig = {
  // --- Server ---
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",

  // --- Database ---
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce",

  // --- JWT ---
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "access-secret-dev-key",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh-secret-dev-key",
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "15m",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",

  // --- CORS ---
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
} as const;
