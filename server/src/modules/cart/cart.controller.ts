// ============================================================
// CART CONTROLLER — Route handlers for cart endpoints
// Delegates to CartService and formats API responses
// ============================================================

import { Request, Response } from 'express';
import { cartService } from './cart.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { HTTP_STATUS } from '../../common/constants';

// ============================================================
// GET /api/cart — Fetch current user's cart
// ============================================================
/**
 * getCartController — Returns the full cart (active + saved items, total)
 */
export const getCartController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const cartData = await cartService.getCart(userId);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, cartData, 'Cart retrieved successfully'));
  }
);

// ============================================================
// POST /api/cart/add — Add a product to the cart
// ============================================================
/**
 * addToCartController — Adds product to cart or bumps existing quantity.
 * Body: { productId, quantity }
 */
export const addToCartController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { productId, quantity } = req.body;

    const cartData = await cartService.addToCart(userId, productId, quantity);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, cartData, 'Item added to cart'));
  }
);

// ============================================================
// PUT /api/cart/update — Update item quantity (optimistic locking)
// ============================================================
/**
 * updateQuantityController — Updates an item's quantity.
 * Body: { itemId, quantity, version }
 * Returns 409 if the version is stale (concurrent edit detected).
 */
export const updateQuantityController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { itemId, quantity, version } = req.body;

    const cartData = await cartService.updateQuantity(userId, itemId, quantity, version);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, cartData, 'Quantity updated'));
  }
);

// ============================================================
// DELETE /api/cart/remove/:itemId — Remove an item from cart
// ============================================================
/**
 * removeItemController — Permanently removes a cart item.
 */
export const removeItemController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { itemId } = req.params;

    const cartData = await cartService.removeItem(userId, itemId as string);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, cartData, 'Item removed from cart'));
  }
);

// ============================================================
// PATCH /api/cart/save-for-later/:itemId — Move to saved
// ============================================================
/**
 * saveForLaterController — Flips item status ACTIVE → SAVED.
 */
export const saveForLaterController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { itemId } = req.params;

    const cartData = await cartService.saveForLater(userId, itemId as string);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, cartData, 'Item saved for later'));
  }
);

// ============================================================
// PATCH /api/cart/move-to-cart/:itemId — Move back to active
// ============================================================
/**
 * moveToCartController — Flips item status SAVED → ACTIVE.
 */
export const moveToCartController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { itemId } = req.params;

    const cartData = await cartService.moveToCart(userId, itemId as string);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, cartData, 'Item moved to cart'));
  }
);
