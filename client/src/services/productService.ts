// ============================================================
// PRODUCT SERVICE — API calls for product endpoints
// ============================================================

import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { ApiResponse } from '../types/api.types';

export interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'DISCONTINUED';
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const productService = {
  // ---- Public ----

  getAllProducts: async (): Promise<Product[]> => {
    const { data } = await axiosInstance.get<ApiResponse<{ products: Product[] }>>(
      API_ENDPOINTS.PRODUCTS.LIST
    );
    return data.data.products;
  },

  getProductById: async (id: string): Promise<Product> => {
    const { data } = await axiosInstance.get<ApiResponse<{ product: Product }>>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id)
    );
    return data.data.product;
  },

  // ---- Admin ----

  getAllProductsAdmin: async (): Promise<Product[]> => {
    const { data } = await axiosInstance.get<ApiResponse<{ products: Product[] }>>(
      API_ENDPOINTS.PRODUCTS.ADMIN_LIST
    );
    return data.data.products;
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const { data } = await axiosInstance.post<ApiResponse<{ product: Product }>>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      productData
    );
    return data.data.product;
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const { data } = await axiosInstance.put<ApiResponse<{ product: Product }>>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      productData
    );
    return data.data.product;
  },

  updateStock: async (id: string, stock: number): Promise<Product> => {
    const { data } = await axiosInstance.patch<ApiResponse<{ product: Product }>>(
      API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id),
      { stock }
    );
    return data.data.product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },
};
