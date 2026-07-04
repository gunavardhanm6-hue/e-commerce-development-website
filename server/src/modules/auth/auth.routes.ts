// ============================================================
// AUTH ROUTES — Route definitions for authentication endpoints
// Maps HTTP methods + paths to controllers with middleware
// ============================================================

import { Router } from "express";
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  getMeController,
} from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { authMiddleware } from "../../middleware/authMiddleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "./auth.validation";

const router = Router();

// ---- Public Routes (no authentication required) ----

/** POST /api/auth/register — Create a new user account */
router.post("/register", validateRequest(registerSchema), registerController);

/** POST /api/auth/login — Authenticate with email + password */
router.post("/login", validateRequest(loginSchema), loginController);

/** POST /api/auth/refresh — Get a new access token using refresh token */
router.post("/refresh", validateRequest(refreshSchema), refreshTokenController);

// ---- Protected Routes (authentication required) ----

/** POST /api/auth/logout — Invalidate the refresh token */
router.post("/logout", authMiddleware, logoutController);

/** GET /api/auth/me — Get the current user's profile */
router.get("/me", authMiddleware, getMeController);

export default router;
