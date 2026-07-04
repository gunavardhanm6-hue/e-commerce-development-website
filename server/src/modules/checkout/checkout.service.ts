// ============================================================
// CHECKOUT SERVICE — Full checkout pipeline inside a transaction
// Validates stock, detects price mismatches, creates order
// Uses MongoDB sessions for ACID guarantees (rollback on failure)
// ============================================================

import mongoose from 'mongoose';
import { Cart } from '../../database/models/Cart.model';
import { CartItem } from '../../database/models/CartItem.model';
import { Product } from '../../database/models/Product.model';
import { Order } from '../../database/models/Order.model';
import { Payment } from '../../database/models/Payment.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../common/constants';
import { cartService } from '../cart/cart.service';

// ---- Types ----

export interface PriceMismatch {
  productId: string;
  productName: string;
  priceWhenAdded: number;
  currentPrice: number;
  difference: number;
}

export interface CheckoutValidationResult {
  valid: boolean;
  priceMismatches: PriceMismatch[];
  outOfStockItems: string[];
  discontinuedItems: string[];
}

export interface CheckoutResult {
  orderId: string;
  orderStatus: string;
  totalAmount: number;
  itemCount: number;
  priceMismatches: PriceMismatch[];
  createdAt: Date;
}

export class CheckoutService {
  // ============================================================
  // VALIDATE CHECKOUT — Pre-flight check without committing
  // ============================================================
  /**
   * validateCheckout — Runs all checkout validations without creating an order.
   * Returns a summary of mismatches and errors the frontend can display.
   *
   * Checks:
   *   1. Cart has at least one ACTIVE item
   *   2. Each product exists
   *   3. Each product is not DISCONTINUED
   *   4. Each product has sufficient stock
   *   5. Price-when-added matches current live price
   */
  async validateCheckout(userId: string): Promise<CheckoutValidationResult> {
    const cart = await Cart.findOne({ user_id: new mongoose.Types.ObjectId(userId) });
    if (!cart) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cart not found');
    }

    const activeItems = await CartItem.find({
      cart_id: cart._id,
      status: 'ACTIVE',
    });

    if (activeItems.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cart is empty. Add items before checking out.');
    }

    const priceMismatches: PriceMismatch[] = [];
    const outOfStockItems: string[] = [];
    const discontinuedItems: string[] = [];

    for (const item of activeItems) {
      const product = await Product.findById(item.product_id);

      if (!product) {
        outOfStockItems.push(item.product_id.toString());
        continue;
      }

      if (product.status === 'DISCONTINUED') {
        discontinuedItems.push(product.name);
        continue;
      }

      if (product.stock < item.quantity) {
        outOfStockItems.push(
          `${product.name} (requested: ${item.quantity}, available: ${product.stock})`
        );
        continue;
      }

      // Price mismatch detection
      if (product.price !== item.price_when_added) {
        priceMismatches.push({
          productId: product._id.toString(),
          productName: product.name,
          priceWhenAdded: item.price_when_added,
          currentPrice: product.price,
          difference: product.price - item.price_when_added,
        });
      }
    }

    return {
      valid:
        outOfStockItems.length === 0 &&
        discontinuedItems.length === 0,
      priceMismatches,
      outOfStockItems,
      discontinuedItems,
    };
  }

  // ============================================================
  // PROCESS CHECKOUT — Atomic transaction
  // ============================================================
  /**
   * processCheckout — Runs the full checkout inside a MongoDB session.
   *
   * Flow:
   *   1. Validate (same as validateCheckout)
   *   2. BEGIN session / transaction
   *   3. For each ACTIVE item:
   *      - Lock and reduce product stock
   *   4. Create Order document with live prices
   *   5. Create Payment document (mock — status: COMPLETED)
   *   6. Delete all ACTIVE cart items
   *   7. COMMIT
   *   On any failure → ROLLBACK (session.abortTransaction)
   *
   * Accepts price mismatches — the caller (frontend) must warn the user
   * and confirm before calling this endpoint. The checkout always uses
   * the CURRENT live price, not the stale price_when_added.
   */
  async processCheckout(userId: string): Promise<CheckoutResult> {
    // --- Pre-flight validation ---
    const validation = await this.validateCheckout(userId);
    if (!validation.valid) {
      const errorParts: string[] = [];
      if (validation.discontinuedItems.length > 0) {
        errorParts.push(`Discontinued: ${validation.discontinuedItems.join(', ')}`);
      }
      if (validation.outOfStockItems.length > 0) {
        errorParts.push(`Out of stock: ${validation.outOfStockItems.join('; ')}`);
      }
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Checkout blocked: ${errorParts.join(' | ')}`
      );
    }

    const cart = await Cart.findOne({ user_id: new mongoose.Types.ObjectId(userId) });
    if (!cart) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cart not found');
    }

    const activeItems = await CartItem.find({
      cart_id: cart._id,
      status: 'ACTIVE',
    });

    // --- Start MongoDB session for atomic transaction ---
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Build order items using live prices
      let totalAmount = 0;
      const orderItems: Array<{
        product_id: mongoose.Types.ObjectId;
        quantity: number;
        price_at_purchase: number;
      }> = [];

      for (const item of activeItems) {
        const product = await Product.findById(item.product_id).session(session);
        if (!product) {
          throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product disappeared during checkout');
        }

        // Double-check stock inside transaction (race condition protection)
        if (product.stock < item.quantity) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            `Stock changed during checkout: ${product.name} only has ${product.stock} left`
          );
        }

        // Reduce stock atomically
        await Product.findByIdAndUpdate(
          product._id,
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );

        const lineTotal = product.price * item.quantity; // always use live price
        totalAmount += lineTotal;

        orderItems.push({
          product_id: product._id as mongoose.Types.ObjectId,
          quantity: item.quantity,
          price_at_purchase: product.price,
        });
      }

      // Create Order document
      const [order] = await Order.create(
        [
          {
            user_id: new mongoose.Types.ObjectId(userId),
            items: orderItems,
            total_amount: totalAmount,
            status: 'PENDING',
          },
        ],
        { session }
      );

      // Create Payment document (mock — mark COMPLETED immediately)
      await Payment.create(
        [
          {
            order_id: order._id,
            amount: totalAmount,
            status: 'COMPLETED',
            method: 'MOCK',
          },
        ],
        { session }
      );

      // Update order status to CONFIRMED after payment
      await Order.findByIdAndUpdate(order._id, { status: 'CONFIRMED' }, { session });

      // Clear ACTIVE cart items — SAVED items stay untouched
      await CartItem.deleteMany({ cart_id: cart._id, status: 'ACTIVE' }, { session });

      // COMMIT the transaction
      await session.commitTransaction();

      return {
        orderId: (order._id as any).toString(),
        orderStatus: 'CONFIRMED',
        totalAmount,
        itemCount: activeItems.reduce((sum, i) => sum + i.quantity, 0),
        priceMismatches: validation.priceMismatches,
        createdAt: (order as any).createdAt,
      };
    } catch (error) {
      // ROLLBACK — stock, cart, order all revert as if nothing happened
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ============================================================
  // GET ORDER HISTORY — Fetch user's orders
  // ============================================================
  async getOrderHistory(userId: string) {
    const orders = await Order.find({ user_id: new mongoose.Types.ObjectId(userId) })
      .populate('items.product_id', 'name imageUrl')
      .sort({ createdAt: -1 });
    return orders;
  }

  // ============================================================
  // GET ORDER BY ID — Fetch single order
  // ============================================================
  async getOrderById(userId: string, orderId: string) {
    const order = await Order.findOne({
      _id: orderId,
      user_id: new mongoose.Types.ObjectId(userId),
    }).populate('items.product_id', 'name imageUrl price');

    if (!order) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Order not found');
    }
    return order;
  }
}

export const checkoutService = new CheckoutService();
