// ============================================================
// PRODUCT LIST PAGE — Browsable product grid
// ============================================================

import React, { useEffect, useState } from 'react';
import type { Product } from '../services/productService';
import { productService } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import './ProductListPage.css';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="product-list-page">
      <div className="container">
        <div className="product-list-page__header">
          <h1 className="product-list-page__title">All Products</h1>
          {!loading && !error && (
            <p className="product-list-page__subtitle">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>

        {/* ---- Loading Skeletons ---- */}
        {loading && (
          <div className="product-list-page__loading">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="product-list-page__skeleton" />
            ))}
          </div>
        )}

        {/* ---- Error ---- */}
        {error && (
          <div className="product-list-page__error" role="alert">
            ❌ {error}
          </div>
        )}

        {/* ---- Empty ---- */}
        {!loading && !error && products.length === 0 && (
          <div className="product-list-page__empty">
            <div className="product-list-page__empty-icon">📦</div>
            <h2 className="product-list-page__empty-title">No products yet</h2>
            <p className="product-list-page__empty-text">
              Check back soon — new products are being added!
            </p>
          </div>
        )}

        {/* ---- Product Grid ---- */}
        {!loading && !error && products.length > 0 && (
          <div className="product-grid" id="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
