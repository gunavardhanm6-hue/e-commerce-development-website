// ============================================================
// AUTH MIDDLEWARE — JWT authentication middleware
// Verifies the access token from the Authorization header
// and attaches the decoded user to req.user
// ============================================================

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/tokenUtils";
import { ApiError } from "../utils/ApiError";
import { HTTP_STATUS } from "../common/constants";

/**
 * authMiddleware — Protects routes that require authentication.
 *
 * Expects the header: `Authorization: Bearer <accessToken>`
 * If valid, sets `req.user` with the token payload.
 * If invalid or missing, throws 401 Unauthorized.
 *
 * @example
 *   router.get("/profile", authMiddleware, getProfile);
 */
export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // --- Extract token from Authorization header ---
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Access token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Access token is required");
    }

    // --- Verify and decode the token ---
    const decoded = verifyAccessToken(token);

    // --- Attach user to request object ---
    req.user = decoded;

    next();
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "Invalid or expired access token"
        )
      );
    }
  }
};
