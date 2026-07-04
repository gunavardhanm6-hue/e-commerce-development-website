// ============================================================
// DB CONFIG — MongoDB connection configuration
// Provides the connection URI and Mongoose options
// ============================================================

import { envConfig } from "./env.config";

/**
 * dbConfig — Database connection settings
 */
export const dbConfig = {
  uri: envConfig.MONGO_URI,
  options: {
    // Mongoose 7+ uses these by default, but explicit for clarity
    autoIndex: true,
  },
} as const;
