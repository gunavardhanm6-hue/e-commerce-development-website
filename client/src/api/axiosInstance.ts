// ============================================================
// AXIOS INSTANCE — Configured HTTP client for API communication
// Includes interceptors for auth token injection and refresh
// ============================================================

import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../utils/storage";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { ApiResponse } from "../types/api.types";
import type { TokenPair } from "../types/auth.types";

/**
 * axiosInstance — Pre-configured Axios instance.
 *
 * Features:
 *   - Base URL points to the API server (proxied via Vite in dev)
 *   - Request interceptor: Attaches Bearer token to every request
 *   - Response interceptor: Auto-refreshes expired access tokens
 */
const axiosInstance = axios.create({
  baseURL: "",  // Uses Vite proxy in development
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// REQUEST INTERCEPTOR — Attach access token to outgoing requests
// ============================================================
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR — Handle 401 errors with token refresh
// ============================================================

/** Flag to prevent multiple simultaneous refresh requests */
let isRefreshing = false;

/** Queue of requests waiting for the token refresh to complete */
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

/**
 * processQueue — Resolves or rejects all queued requests
 * after a token refresh attempt completes.
 */
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401 errors (not on login/register/refresh endpoints)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the access token
        const { data } = await axios.post<ApiResponse<{ tokens: TokenPair }>>(
          API_ENDPOINTS.AUTH.REFRESH,
          { refreshToken }
        );

        const newTokens = data.data.tokens;
        setTokens(newTokens.accessToken, newTokens.refreshToken);

        // Update the failed request with the new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        }

        processQueue(null, newTokens.accessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
