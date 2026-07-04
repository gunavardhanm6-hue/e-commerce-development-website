// ============================================================
// AUTH CONTROLLER — Route handlers for authentication endpoints
// Each function handles one HTTP request and delegates to AuthService
// ============================================================

import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { HTTP_STATUS } from "../../common/constants";

// ============================================================
// POST /api/auth/register — Register a new user
// ============================================================
/**
 * registerController — Creates a new user account.
 *
 * Request body: { firstName, lastName, email, password }
 * Response: { user, tokens } with 201 status
 */
export const registerController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, password } = req.body;

    const { user, tokens } = await AuthService.register(
      firstName,
      lastName,
      email,
      password
    );

    res
      .status(HTTP_STATUS.CREATED)
      .json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          { user, tokens },
          "Registration successful"
        )
      );
  }
);

// ============================================================
// POST /api/auth/login — Login with email + password
// ============================================================
/**
 * loginController — Authenticates a user and returns tokens.
 *
 * Request body: { email, password }
 * Response: { user, tokens } with 200 status
 */
export const loginController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const { user, tokens } = await AuthService.login(email, password);

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, { user, tokens }, "Login successful")
      );
  }
);

// ============================================================
// POST /api/auth/refresh — Refresh the access token
// ============================================================
/**
 * refreshTokenController — Issues a new token pair using a refresh token.
 *
 * Request body: { refreshToken }
 * Response: { accessToken, refreshToken } with 200 status
 */
export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    const tokens = await AuthService.refreshToken(refreshToken);

    res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, { tokens }, "Token refreshed successfully")
      );
  }
);

// ============================================================
// POST /api/auth/logout — Logout (invalidate refresh token)
// ============================================================
/**
 * logoutController — Clears the user's refresh token from the database.
 *
 * Requires: Authentication (authMiddleware)
 * Response: Empty data with 200 status
 */
export const logoutController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    await AuthService.logout(userId);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, null, "Logout successful"));
  }
);

// ============================================================
// GET /api/auth/me — Get current user profile
// ============================================================
/**
 * getMeController — Returns the authenticated user's profile.
 *
 * Requires: Authentication (authMiddleware)
 * Response: { user } with 200 status
 */
export const getMeController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const user = await AuthService.getCurrentUser(userId);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, { user }, "User profile retrieved"));
  }
);
