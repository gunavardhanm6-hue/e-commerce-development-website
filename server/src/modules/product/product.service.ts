import { Product, IProduct } from '../../database/models/Product.model';
import { ApiError } from '../../utils/ApiError';

export class ProductService {
  /**
   * Get all active products
   */
  async getAllProducts(): Promise<IProduct[]> {
    return Product.find({ status: 'ACTIVE' }).sort({ createdAt: -1 });
  }

  /**
   * Get all products including discontinued (Admin)
   */
  async getAllProductsAdmin(): Promise<IProduct[]> {
    return Product.find().sort({ createdAt: -1 });
  }

  /**
   * Get a single product by ID
   */
  async getProductById(productId: string): Promise<IProduct> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  }

  /**
   * Create a new product (Admin)
   */
  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(data);
    await product.save();
    return product;
  }

  /**
   * Update a product (Admin)
   */
  async updateProduct(productId: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(productId, data, { new: true });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  }

  /**
   * Update product stock (Admin)
   */
  async updateStock(productId: string, stock: number): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(
      productId,
      { stock },
      { new: true }
    );
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  }

  /**
   * Soft-delete a product by setting status to DISCONTINUED (Admin)
   */
  async deleteProduct(productId: string): Promise<void> {
    const product = await Product.findByIdAndUpdate(productId, {
      status: 'DISCONTINUED',
    });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
  }
}

export const productService = new ProductService();
