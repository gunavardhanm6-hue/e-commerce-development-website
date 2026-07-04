// ============================================================
// PRODUCT ROUTES — Route definitions for product endpoints
// Public: GET list + detail
// Admin only: POST, PUT, PATCH stock, DELETE
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { productController } from './product.controller';
import { authMiddleware } from '../../middleware/authMiddleware';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS, USER_ROLES } from '../../common/constants';

const router = Router();

/**
 * adminGuard — Middleware that requires the user to have the 'admin' role.
 * Must be placed AFTER authMiddleware so req.user is already populated.
 */
const adminGuard = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== USER_ROLES.ADMIN) {
    return next(new ApiError(HTTP_STATUS.FORBIDDEN, 'Admin access required'));
  }
  next();
};

// ---- Public Routes ----

/** GET /api/products — List all active products */
router.get('/', productController.getAllProducts);

/** GET /api/products/:id — Get a single product */
router.get('/:id', productController.getProductById);

// ---- Admin Routes (require auth + admin role) ----

/** GET /api/products/admin/all — List all products including discontinued */
router.get('/admin/all', authMiddleware, adminGuard, productController.getAllProductsAdmin);

/** POST /api/products — Create a product */
router.post('/', authMiddleware, adminGuard, productController.createProduct);

/** PUT /api/products/:id — Update a product */
router.put('/:id', authMiddleware, adminGuard, productController.updateProduct);

/** PATCH /api/products/:id/stock — Update stock only */
router.patch('/:id/stock', authMiddleware, adminGuard, productController.updateStock);

/** DELETE /api/products/:id — Soft-delete (set to DISCONTINUED) */
router.delete('/:id', authMiddleware, adminGuard, productController.deleteProduct);

export default router;
