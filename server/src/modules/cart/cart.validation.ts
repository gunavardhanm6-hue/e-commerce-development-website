// ============================================================
// CART VALIDATION — Zod schemas for cart request bodies
// Validates input before it reaches the service layer
// ============================================================

import { z } from 'zod';

/**
 * addToCartSchema — Validates POST /api/cart/add
 * Requires productId and a positive quantity
 */
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number({ error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
});

/**
 * updateQuantitySchema — Validates PUT /api/cart/update
 * Must include the item ID, new quantity, and current version for optimistic locking
 */
export const updateQuantitySchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z
    .number({ error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
  version: z
    .number({ error: 'Version is required for optimistic locking' })
    .int()
    .min(0),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
