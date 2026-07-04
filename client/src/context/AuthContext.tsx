// ============================================================
// AUTH CONTEXT — React Context for authentication state
// Provides login, register, logout functions and user state
// to all child components via useAuth hook
// ============================================================

import React, { createContext, useReducer, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import {
  setTokens,
  clearTokens,
  getAccessToken,
  setStoredUser,
} from "../utils/storage";
import type {
  User,
  AuthState,
  AuthAction,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.types";
import type { ApiErrorResponse } from "../types/api.types";
import { AxiosError } from "axios";

// ============================================================
// AUTH CONTEXT VALUE — Shape of what the context provides
// ============================================================
interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// ============================================================
// INITIAL STATE
// ============================================================
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true initially to check for existing token
  error: null,
};

// ============================================================
// REDUCER — Pure function that handles all auth state transitions
// ============================================================
/**
 * authReducer — Handles state transitions for auth actions.
 *
 * Actions:
 *   - AUTH_START: Set loading, clear errors
 *   - AUTH_SUCCESS: Set user, mark authenticated
 *   - AUTH_FAILURE: Set error message
 *   - AUTH_LOGOUT: Clear user and tokens
 *   - CLEAR_ERROR: Clear error message
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
};

// ============================================================
// CREATE CONTEXT
// ============================================================
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

// ============================================================
// AUTH PROVIDER — Wraps the app and provides auth state + actions
// ============================================================
/**
 * AuthProvider — Context provider component.
 *
 * On mount:
 *   - Checks if an access token exists in localStorage
 *   - If yes, fetches the user profile from /api/auth/me
 *   - If no or fetch fails, sets isLoading to false
 *
 * Provides:
 *   - user, isAuthenticated, isLoading, error (state)
 *   - login, register, logout, clearError (actions)
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ---- On mount: Check for existing auth token ----
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        dispatch({ type: "AUTH_LOGOUT" });
        return;
      }

      try {
        const user = await authService.getMe();
        setStoredUser(user);
        dispatch({ type: "AUTH_SUCCESS", payload: user });
      } catch {
        clearTokens();
        dispatch({ type: "AUTH_LOGOUT" });
      }
    };

    initializeAuth();
  }, []);

  // ---- Helper: Extract error message from API errors ----
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiErrorResponse | undefined;
      return data?.message || "An unexpected error occurred";
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred";
  };

  // ============================================================
  // LOGIN — Authenticate user with email + password
  // ============================================================
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: "AUTH_START" });
    try {
      const { user, tokens } = await authService.login(credentials);
      setTokens(tokens.accessToken, tokens.refreshToken);
      setStoredUser(user);
      dispatch({ type: "AUTH_SUCCESS", payload: user });
    } catch (error: unknown) {
      dispatch({ type: "AUTH_FAILURE", payload: getErrorMessage(error) });
      throw error; // Re-throw so the component can handle it too
    }
  }, []);

  // ============================================================
  // REGISTER — Create a new user account
  // ============================================================
  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      dispatch({ type: "AUTH_START" });
      try {
        const { user, tokens } = await authService.register(credentials);
        setTokens(tokens.accessToken, tokens.refreshToken);
        setStoredUser(user);
        dispatch({ type: "AUTH_SUCCESS", payload: user });
      } catch (error: unknown) {
        dispatch({ type: "AUTH_FAILURE", payload: getErrorMessage(error) });
        throw error;
      }
    },
    []
  );

  // ============================================================
  // LOGOUT — Sign out and clear all auth data
  // ============================================================
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Logout even if the API call fails (token might already be expired)
    } finally {
      clearTokens();
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, []);

  // ============================================================
  // CLEAR ERROR — Dismiss the current error message
  // ============================================================
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // ---- Context value ----
  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
