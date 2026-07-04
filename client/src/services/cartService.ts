// ============================================================
// CART SERVICE — API calls for cart operations
// Wraps axios calls to cart endpoints with proper typing
// ============================================================

import axiosInstance from "../api/axiosInstance";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { ApiResponse } from "../types/api.types";
import type { CartData } from "../types/cart.types";

/**
 * cartService — Object containing all cart-related API calls.
 */
export const cartService = {
  // ============================================================
  // GET CART — GET /api/cart
  // ============================================================
  getCart: async (): Promise<CartData> => {
    const { data } = await axiosInstance.get<ApiResponse<CartData>>(
      API_ENDPOINTS.CART.GET
    );
    return data.data;
  },

  // ============================================================
  // ADD TO CART — POST /api/cart/add
  // ============================================================
  addToCart: async (productId: string, quantity: number): Promise<CartData> => {
    const { data } = await axiosInstance.post<ApiResponse<CartData>>(
      API_ENDPOINTS.CART.ADD,
      { productId, quantity }
    );
    return data.data;
  },

  // ============================================================
  // UPDATE QUANTITY — PUT /api/cart/update
  // Sends version for optimistic locking
  // ============================================================
  updateQuantity: async (
    itemId: string,
    quantity: number,
    version: number
  ): Promise<CartData> => {
    const { data } = await axiosInstance.put<ApiResponse<CartData>>(
      API_ENDPOINTS.CART.UPDATE,
      { itemId, quantity, version }
    );
    return data.data;
  },

  // ============================================================
  // REMOVE ITEM — DELETE /api/cart/remove/:itemId
  // ============================================================
  removeItem: async (itemId: string): Promise<CartData> => {
    const { data } = await axiosInstance.delete<ApiResponse<CartData>>(
      API_ENDPOINTS.CART.REMOVE(itemId)
    );
    return data.data;
  },

  // ============================================================
  // SAVE FOR LATER — PATCH /api/cart/save-for-later/:itemId
  // ============================================================
  saveForLater: async (itemId: string): Promise<CartData> => {
    const { data } = await axiosInstance.patch<ApiResponse<CartData>>(
      API_ENDPOINTS.CART.SAVE_FOR_LATER(itemId)
    );
    return data.data;
  },

  // ============================================================
  // MOVE TO CART — PATCH /api/cart/move-to-cart/:itemId
  // ============================================================
  moveToCart: async (itemId: string): Promise<CartData> => {
    const { data } = await axiosInstance.patch<ApiResponse<CartData>>(
      API_ENDPOINTS.CART.MOVE_TO_CART(itemId)
    );
    return data.data;
  },
};
