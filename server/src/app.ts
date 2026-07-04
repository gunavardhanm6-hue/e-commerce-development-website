// ============================================================
// EXPRESS APP — Application setup and middleware configuration
// Creates and configures the Express application instance
// ============================================================

import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsConfig } from "./config/cors.config";
import { errorHandler } from "./middleware/errorHandler";
import apiRouter from "./routes/index";

/**
 * createApp — Factory function that creates and configures the Express app.
 * Separated from server.ts so the app can be tested independently.
 *
 * Middleware order:
 *   1. CORS — Handles cross-origin requests
 *   2. Body Parser — Parses JSON request bodies
 *   3. URL Encoded — Parses URL-encoded form data
 *   4. Cookie Parser — Parses cookies from requests
 *   5. API Routes — All /api/* endpoints
 *   6. Health Check — GET / returns server status
 *   7. 404 Handler — Catches unmatched routes
 *   8. Error Handler — Global error handling (MUST be last)
 */
export const createApp = (): Application => {
  const app = express();

  // ---- Core Middleware ----
  app.use(cors(corsConfig));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ---- API Routes ----
  app.use("/api", apiRouter);

  // ---- Health Check Endpoint ----
  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "🚀 E-Commerce API is running",
      timestamp: new Date().toISOString(),
    });
  });

  // ---- 404 Handler for unknown routes ----
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });

  // ---- Global Error Handler (must be last middleware) ----
  app.use(errorHandler);

  return app;
};
