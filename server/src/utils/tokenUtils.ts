// ============================================================
// TOKEN UTILS — JWT sign and verify helper functions
// Centralizes all JWT operations for access & refresh tokens
// ============================================================

import jwt, { SignOptions } from "jsonwebtoken";
import { envConfig } from "../config/env.config";
import { TokenPayload, TokenPair } from "../types/auth.types";

/**
 * generateAccessToken — Creates a short-lived access token (default: 15m)
 * @param payload - User data to encode (userId, email, role)
 * @returns Signed JWT access token string
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: 900, // 15 minutes in seconds
  };
  return jwt.sign(payload, envConfig.JWT_ACCESS_SECRET, options);
};

/**
 * generateRefreshToken — Creates a long-lived refresh token (default: 7d)
 * @param payload - User data to encode (userId, email, role)
 * @returns Signed JWT refresh token string
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: 604800, // 7 days in seconds
  };
  return jwt.sign(payload, envConfig.JWT_REFRESH_SECRET, options);
};

/**
 * generateTokenPair — Creates both access and refresh tokens at once
 * @param payload - User data to encode
 * @returns Object with both accessToken and refreshToken
 */
export const generateTokenPair = (payload: TokenPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * verifyAccessToken — Decodes and verifies an access token
 * @param token - The JWT access token string
 * @returns The decoded payload
 * @throws JsonWebTokenError if token is invalid or expired
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, envConfig.JWT_ACCESS_SECRET) as TokenPayload;
};

/**
 * verifyRefreshToken — Decodes and verifies a refresh token
 * @param token - The JWT refresh token string
 * @returns The decoded payload
 * @throws JsonWebTokenError if token is invalid or expired
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, envConfig.JWT_REFRESH_SECRET) as TokenPayload;
};
