// ============================================================
// AUTH SERVICE — Business logic for authentication
// Handles user registration, login, token refresh, and logout
// Separated from controllers to keep logic testable
// ============================================================

import { User } from "../../database/models/User.model";
import { ApiError } from "../../utils/ApiError";
import {
  generateTokenPair,
  verifyRefreshToken,
} from "../../utils/tokenUtils";
import { HTTP_STATUS } from "../../common/constants";
import { TokenPair, TokenPayload } from "../../types/auth.types";
import { IUserDocument } from "../../interfaces/IUser.interface";

/**
 * AuthService — Contains all authentication business logic.
 * Each method handles one auth operation.
 */
export class AuthService {
  // ============================================================
  // REGISTER — Create a new user account
  // ============================================================
  /**
   * register — Creates a new user, hashes password (via model hook),
   * generates token pair, and stores the refresh token.
   *
   * @param firstName - User's first name
   * @param lastName - User's last name
   * @param email - User's email (must be unique)
   * @param password - Plain-text password (hashed by pre-save hook)
   * @returns Object with user data and token pair
   * @throws ApiError 409 if email already exists
   */
  static async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<{ user: IUserDocument; tokens: TokenPair }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Email is already registered");
    }

    // Create new user (password is hashed by the pre-save hook)
    const user = await User.create({ firstName, lastName, email, password });

    // Generate token pair
    const tokenPayload: TokenPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokenPair(tokenPayload);

    // Store refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, tokens };
  }

  // ============================================================
  // LOGIN — Authenticate a user with email + password
  // ============================================================
  /**
   * login — Verifies credentials, generates new token pair.
   *
   * @param email - User's email
   * @param password - Plain-text password to verify
   * @returns Object with user data and token pair
   * @throws ApiError 401 if credentials are invalid
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ user: IUserDocument; tokens: TokenPair }> {
    // Find user and explicitly include password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password");
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Account has been deactivated. Contact support."
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password");
    }

    // Generate token pair
    const tokenPayload: TokenPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokenPair(tokenPayload);

    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, tokens };
  }

  // ============================================================
  // REFRESH TOKEN — Issue new access token from refresh token
  // ============================================================
  /**
   * refreshToken — Verifies the refresh token, then issues
   * a new token pair. Implements token rotation (old refresh
   * token is invalidated, new one is stored).
   *
   * @param refreshToken - The current refresh token
   * @returns New token pair
   * @throws ApiError 401 if token is invalid or user not found
   */
  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    // Verify the refresh token
    let decoded: TokenPayload;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid or expired refresh token"
      );
    }

    // Find user and check that the stored refresh token matches
    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid refresh token — please login again"
      );
    }

    // Generate new token pair (token rotation)
    const tokenPayload: TokenPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokenPair(tokenPayload);

    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  // ============================================================
  // LOGOUT — Invalidate refresh token
  // ============================================================
  /**
   * logout — Removes the stored refresh token so it can no
   * longer be used to get new access tokens.
   *
   * @param userId - The ID of the user logging out
   */
  static async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  // ============================================================
  // GET CURRENT USER — Retrieve user profile by ID
  // ============================================================
  /**
   * getCurrentUser — Fetches the user document by ID.
   * Used by the "GET /me" endpoint.
   *
   * @param userId - The authenticated user's ID
   * @returns The user document (without password/refreshToken)
   * @throws ApiError 404 if user not found
   */
  static async getCurrentUser(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }
    return user;
  }
}
