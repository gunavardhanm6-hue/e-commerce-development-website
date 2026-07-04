// ============================================================
// ROOT ROUTER — Aggregates all module routes
// All API routes are prefixed and registered here
// ============================================================

import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import productRoutes from "../modules/product/product.routes";
import cartRoutes from "../modules/cart/cart.routes";
import checkoutRoutes, { orderRouter } from "../modules/checkout/checkout.routes";

const router = Router();

/**
 * API Route Map:
 *
 *   /api/auth/*       → Authentication (register, login, refresh, logout, me)
 *   /api/products/*   → Product module (list, detail, create, update, delete)
 *   /api/cart/*       → Cart module (get, add, update, remove, save-for-later, move-to-cart)
 *   /api/checkout/*   → Checkout module (validate, process)
 *   /api/orders/*     → Order history
 */

// ---- Auth Module ----
router.use("/auth", authRoutes);

// ---- Product Module ----
router.use("/products", productRoutes);

// ---- Cart Module ----
router.use("/cart", cartRoutes);

// ---- Checkout Module ----
router.use("/checkout", checkoutRoutes);

// ---- Orders Module ----
router.use("/orders", orderRouter);

export default router;
