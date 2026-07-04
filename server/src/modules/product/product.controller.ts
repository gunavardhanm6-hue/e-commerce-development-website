import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { z } from 'zod';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { HTTP_STATUS } from '../../common/constants';

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be non-negative"),
  stock: z.number().min(0, "Stock must be non-negative"),
  status: z.enum(['ACTIVE', 'DISCONTINUED']).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export class ProductController {
  /**
   * GET /api/products — Get all active products (public)
   */
  getAllProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const products = await productService.getAllProducts();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { products }, 'Products retrieved successfully')
    );
  });

  /**
   * GET /api/products/admin — Get ALL products including discontinued (Admin)
   */
  getAllProductsAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const products = await productService.getAllProductsAdmin();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { products }, 'All products retrieved')
    );
  });

  /**
   * GET /api/products/:id — Get a single product by ID (public)
   */
  getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const product = await productService.getProductById(id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { product }, 'Product retrieved successfully')
    );
  });

  /**
   * POST /api/products — Create a new product (Admin only)
   */
  createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validatedData = productSchema.parse(req.body);
    const product = await productService.createProduct(validatedData);
    res.status(HTTP_STATUS.CREATED).json(
      new ApiResponse(HTTP_STATUS.CREATED, { product }, 'Product created successfully')
    );
  });

  /**
   * PUT /api/products/:id — Update a product (Admin only)
   */
  updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const validatedData = productSchema.partial().parse(req.body);
    const product = await productService.updateProduct(id, validatedData);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { product }, 'Product updated successfully')
    );
  });

  /**
   * PATCH /api/products/:id/stock — Update product stock (Admin only)
   */
  updateStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { stock } = z.object({ stock: z.number().min(0) }).parse(req.body);
    const product = await productService.updateStock(id, stock);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, { product }, 'Stock updated successfully')
    );
  });

  /**
   * DELETE /api/products/:id — Soft-delete product (Admin only) — sets status to DISCONTINUED
   */
  deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await productService.deleteProduct(id);
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, null, 'Product discontinued successfully')
    );
  });
}

export const productController = new ProductController();
