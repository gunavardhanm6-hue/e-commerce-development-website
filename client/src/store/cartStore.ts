// ============================================================
// CART STORE — Zustand state management for cart
// Handles all cart operations and state synchronization
// ============================================================

import { create } from 'zustand';
import { cartService } from '../services/cartService';
import type { CartData } from '../types/cart.types';

// ---- State Shape ----

interface CartStore {
  // State
  cartData: CartData | null;
  loading: boolean;
  error: string | null;
  conflictError: string | null; // 409 conflict — stale version

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number, version: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  clearConflictError: () => void;
  clearError: () => void;
  resetCart: () => void;
}

// ============================================================
// CART STORE IMPLEMENTATION
// ============================================================

export const useCartStore = create<CartStore>((set, get) => ({
  // ---- Initial State ----
  cartData: null,
  loading: false,
  error: null,
  conflictError: null,

  // ============================================================
  // FETCH CART
  // ============================================================
  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const cartData = await cartService.getCart();
      set({ cartData, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message ?? 'Failed to load cart',
      });
    }
  },

  // ============================================================
  // ADD TO CART
  // ============================================================
  addToCart: async (productId: string, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const cartData = await cartService.addToCart(productId, quantity);
      set({ cartData, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message ?? 'Failed to add item to cart',
      });
      throw err; // Re-throw so the UI can react (e.g. show toast)
    }
  },

  // ============================================================
  // UPDATE QUANTITY — Handles 409 conflict
  // ============================================================
  updateQuantity: async (itemId: string, quantity: number, version: number) => {
    set({ error: null, conflictError: null });
    try {
      const cartData = await cartService.updateQuantity(itemId, quantity, version);
      set({ cartData });
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // Optimistic lock conflict — re-fetch latest cart so UI reflects real state
        set({
          conflictError:
            'Your cart was updated from another device. The latest version has been loaded.',
        });
        try {
          const freshCart = await cartService.getCart();
          set({ cartData: freshCart });
        } catch {
          // Silent fail on re-fetch
        }
      } else {
        set({ error: err?.response?.data?.message ?? 'Failed to update quantity' });
      }
      throw err;
    }
  },

  // ============================================================
  // REMOVE ITEM
  // ============================================================
  removeItem: async (itemId: string) => {
    set({ error: null });
    try {
      const cartData = await cartService.removeItem(itemId);
      set({ cartData });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'Failed to remove item' });
      throw err;
    }
  },

  // ============================================================
  // SAVE FOR LATER
  // ============================================================
  saveForLater: async (itemId: string) => {
    set({ error: null });
    try {
      const cartData = await cartService.saveForLater(itemId);
      set({ cartData });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'Failed to save for later' });
      throw err;
    }
  },

  // ============================================================
  // MOVE TO CART
  // ============================================================
  moveToCart: async (itemId: string) => {
    set({ error: null });
    try {
      const cartData = await cartService.moveToCart(itemId);
      set({ cartData });
    } catch (err: any) {
      set({ error: err?.response?.data?.message ?? 'Failed to move to cart' });
      throw err;
    }
  },

  // ---- Utility Actions ----
  clearConflictError: () => set({ conflictError: null }),
  clearError: () => set({ error: null }),
  resetCart: () => set({ cartData: null, loading: false, error: null, conflictError: null }),
}));

// ============================================================
// COMPUTED SELECTORS (use these in components)
// ============================================================

/** Total number of unique active items in cart (for navbar badge) */
export const selectCartItemCount = (state: CartStore) =>
  state.cartData?.itemCount ?? 0;

/** Cart subtotal (active items only) */
export const selectCartSubtotal = (state: CartStore) =>
  state.cartData?.subtotal ?? 0;
