// ============================================================
// AUTH VALIDATION — Zod schemas for auth request bodies
// Validates register and login payloads on the server side
// ============================================================

import { z } from "zod";

/**
 * registerSchema — Validates the register request body
 *
 * Rules:
 *   - firstName: 2–50 chars, required
 *   - lastName: 2–50 chars, required
 *   - email: Must be a valid email format
 *   - password: 8+ chars, must contain uppercase, lowercase, and number
 */
export const registerSchema = z.object({
  firstName: z
    .string({ error: "First name is required" })
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .trim(),
  lastName: z
    .string({ error: "Last name is required" })
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .trim(),
  email: z
    .string({ error: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

/**
 * loginSchema — Validates the login request body
 *
 * Rules:
 *   - email: Required, valid email
 *   - password: Required, 1+ chars
 */
export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

/**
 * refreshSchema — Validates the refresh token request body
 */
export const refreshSchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required" })
    .min(1, "Refresh token is required"),
});
