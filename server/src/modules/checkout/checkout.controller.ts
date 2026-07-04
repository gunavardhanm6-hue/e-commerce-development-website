// ============================================================
// CHECKOUT CONTROLLER — Route handlers for checkout and orders
// Delegates to CheckoutService and formats API responses
// ============================================================

import { Request, Response } from 'express';
import { checkoutService } from './checkout.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { HTTP_STATUS } from '../../common/constants';

// ============================================================
// GET /api/checkout/validate — Pre-flight validation
// ============================================================
/**
 * validateCheckoutController — Returns validation result (mismatches, stock issues)
 * without committing anything. Used by the frontend to show warnings before checkout.
 */
export const validateCheckoutController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await checkoutService.validateCheckout(userId);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, result, 'Checkout validation complete'));
  }
);

// ============================================================
// POST /api/checkout — Process the full checkout
// ============================================================
/**
 * processCheckoutController — Runs the full checkout pipeline:
 * validate → reduce stock → create order → create payment → clear cart.
 * All inside a MongoDB transaction.
 */
export const processCheckoutController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await checkoutService.processCheckout(userId);

    res
      .status(HTTP_STATUS.CREATED)
      .json(new ApiResponse(HTTP_STATUS.CREATED, result, 'Order placed successfully'));
  }
);

// ============================================================
// GET /api/orders — Get order history
// ============================================================
/**
 * getOrderHistoryController — Returns all orders for the authenticated user.
 */
export const getOrderHistoryController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const orders = await checkoutService.getOrderHistory(userId);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, { orders }, 'Orders retrieved successfully'));
  }
);

// ============================================================
// GET /api/orders/:orderId — Get single order
// ============================================================
/**
 * getOrderByIdController — Returns a specific order by ID.
 */
export const getOrderByIdController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { orderId } = req.params;

    const order = await checkoutService.getOrderById(userId, orderId as string);

    res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, { order }, 'Order retrieved successfully'));
  }
);
