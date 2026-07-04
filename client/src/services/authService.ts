// ============================================================
// AUTH SERVICE — API calls for authentication
// Wraps axios calls to auth endpoints with proper typing
// ============================================================

import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { ApiResponse } from "../types/api.types";
import type {
  User,
  TokenPair,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.types";

/**
 * AuthResponse — Shape of the login/register API response data
 */
interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

/**
 * authService — Object containing all auth-related API calls.
 * Each method returns the response data with proper typing.
 */
export const authService = {
  // ============================================================
  // REGISTER — POST /api/auth/register
  // ============================================================
  /**
   * register — Creates a new user account
   * @param credentials - { firstName, lastName, email, password }
   * @returns { user, tokens }
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      credentials
    );
    return data.data;
  },

  // ============================================================
  // LOGIN — POST /api/auth/login
  // ============================================================
  /**
   * login — Authenticates a user with email and password
   * @param credentials - { email, password }
   * @returns { user, tokens }
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return data.data;
  },

  // ============================================================
  // LOGOUT — POST /api/auth/logout
  // ============================================================
  /**
   * logout — Invalidates the refresh token on the server
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // ============================================================
  // GET ME — GET /api/auth/me
  // ============================================================
  /**
   * getMe — Fetches the currently authenticated user's profile
   * @returns The user object
   */
  getMe: async (): Promise<User> => {
    const { data } = await axiosInstance.get<ApiResponse<{ user: User }>>(
      API_ENDPOINTS.AUTH.ME
    );
    return data.data.user;
  },

  // ============================================================
  // REFRESH — POST /api/auth/refresh
  // ============================================================
  /**
   * refreshToken — Gets a new token pair using the refresh token
   * @param refreshToken - The current refresh token
   * @returns New token pair
   */
  refreshToken: async (refreshToken: string): Promise<TokenPair> => {
    const { data } = await axiosInstance.post<
      ApiResponse<{ tokens: TokenPair }>
    >(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    return data.data.tokens;
  },
};
