// ============================================================
// CORS CONFIG — Cross-Origin Resource Sharing settings
// Controls which origins can access the API
// ============================================================

import { CorsOptions } from "cors";
import { envConfig } from "./env.config";

/**
 * corsConfig — CORS options for Express
 * Allows the client app origin and credentials (cookies)
 */
export const corsConfig: CorsOptions = {
  origin: envConfig.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
