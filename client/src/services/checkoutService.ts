// ============================================================
// CHECKOUT SERVICE — API calls for checkout operations
// ============================================================

import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { ApiResponse } from "../types/api.types";
import type { CheckoutValidationResult, CheckoutResult } from "../types/cart.types";

export const checkoutService = {
  // ============================================================
  // VALIDATE — GET /api/checkout/validate
  // Pre-flight check: price mismatches, stock, discontinued
  // ============================================================
  validate: async (): Promise<CheckoutValidationResult> => {
    const { data } = await axiosInstance.get<ApiResponse<CheckoutValidationResult>>(
      API_ENDPOINTS.CHECKOUT.VALIDATE
    );
    return data.data;
  },

  // ============================================================
  // PROCESS — POST /api/checkout
  // Atomic transaction: reduce stock + create order + clear cart
  // ============================================================
  process: async (): Promise<CheckoutResult> => {
    const { data } = await axiosInstance.post<ApiResponse<CheckoutResult>>(
      API_ENDPOINTS.CHECKOUT.PROCESS
    );
    return data.data;
  },
};
