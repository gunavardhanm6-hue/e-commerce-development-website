// ============================================================
// CHECKOUT ROUTES — Route definitions for checkout and orders
// All routes require authentication
// ============================================================

import { Router } from 'express';
import {
  validateCheckoutController,
  processCheckoutController,
  getOrderHistoryController,
  getOrderByIdController,
} from './checkout.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

/** GET /api/checkout/validate — Pre-flight validation (price mismatches, stock) */
router.get('/validate', validateCheckoutController);

/** POST /api/checkout — Process checkout (atomic transaction) */
router.post('/', processCheckoutController);

export default router;

// ---- Order routes are exported separately ----
export const orderRouter = Router();

orderRouter.use(authMiddleware);

/** GET /api/orders — Get user's order history */
orderRouter.get('/', getOrderHistoryController);

/** GET /api/orders/:orderId — Get single order */
orderRouter.get('/:orderId', getOrderByIdController);
