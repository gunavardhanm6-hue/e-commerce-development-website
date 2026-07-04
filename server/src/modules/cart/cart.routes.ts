// ============================================================
// CART ROUTES — Route definitions for cart endpoints
// All routes require authentication (authMiddleware)
// ============================================================

import { Router } from 'express';
import {
  getCartController,
  addToCartController,
  updateQuantityController,
  removeItemController,
  saveForLaterController,
  moveToCartController,
} from './cart.controller';
import { authMiddleware } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateRequest';
import { addToCartSchema, updateQuantitySchema } from './cart.validation';

const router = Router();

// All cart routes require the user to be authenticated
router.use(authMiddleware);

/** GET /api/cart — Get the current user's cart */
router.get('/', getCartController);

/** POST /api/cart/add — Add a product to cart */
router.post('/add', validateRequest(addToCartSchema), addToCartController);

/** PUT /api/cart/update — Update item quantity (requires version for optimistic locking) */
router.put('/update', validateRequest(updateQuantitySchema), updateQuantityController);

/** DELETE /api/cart/remove/:itemId — Remove an item from cart */
router.delete('/remove/:itemId', removeItemController);

/** PATCH /api/cart/save-for-later/:itemId — Move item to saved list */
router.patch('/save-for-later/:itemId', saveForLaterController);

/** PATCH /api/cart/move-to-cart/:itemId — Move saved item back to active cart */
router.patch('/move-to-cart/:itemId', moveToCartController);

export default router;
