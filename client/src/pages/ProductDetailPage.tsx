// ============================================================
// PRODUCT DETAIL PAGE — Full product view with Add to Cart
// ============================================================

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../services/productService';
import { useCartStore } from '../store/cartStore';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/appConstants';
import './ProductDetailPage.css';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!product || adding) return;

    setAdding(true);
    setAddError(null);
    setAddSuccess(false);

    try {
      await addToCart(product._id, quantity);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err: any) {
      setAddError(err?.response?.data?.message ?? 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading product…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <p style={{ color: 'var(--color-error)' }}>{error ?? 'Product not found'}</p>
          <Link to={ROUTES.PRODUCTS} className="product-detail-page__back">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isDiscontinued = product.status === 'DISCONTINUED';
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-detail-page">
      <div className="container">
        <Link to={ROUTES.PRODUCTS} className="product-detail-page__back">
          ← Back to Products
        </Link>

        <div className="product-detail__layout">
          {/* ---- Product Image ---- */}
          <div className="product-detail__image-wrapper">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-detail__image"
              />
            ) : (
              '🛍️'
            )}
          </div>

          {/* ---- Product Info ---- */}
          <div className="product-detail__info">
            {/* Status badge */}
            <span
              className={`product-detail__status-badge ${
                isDiscontinued
                  ? 'product-detail__status-badge--discontinued'
                  : 'product-detail__status-badge--active'
              }`}
            >
              {isDiscontinued ? '⚠ Discontinued' : '✓ In Catalogue'}
            </span>

            <h1 className="product-detail__name">{product.name}</h1>

            <p className="product-detail__price">
              ₹{product.price.toLocaleString('en-IN')}
            </p>

            {/* Stock indicator */}
            {!isDiscontinued && (
              <p
                className={`product-detail__stock ${
                  isOutOfStock
                    ? 'product-detail__stock--out'
                    : isLowStock
                    ? 'product-detail__stock--low'
                    : 'product-detail__stock--available'
                }`}
              >
                {isOutOfStock
                  ? '✗ Out of Stock'
                  : isLowStock
                  ? `⚠ Only ${product.stock} left in stock`
                  : `✓ ${product.stock} in stock`}
              </p>
            )}

            {/* Description */}
            {product.description && (
              <p className="product-detail__description">{product.description}</p>
            )}

            {/* Add to Cart Controls */}
            {!isDiscontinued && !isOutOfStock && (
              <div className="product-detail__add-to-cart">
                <div className="product-detail__qty-control">
                  <button
                    className="product-detail__qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    id="product-qty-dec"
                  >
                    −
                  </button>
                  <span className="product-detail__qty-value">{quantity}</span>
                  <button
                    className="product-detail__qty-btn"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                    id="product-qty-inc"
                  >
                    +
                  </button>
                </div>

                <button
                  className="product-detail__add-btn"
                  onClick={handleAddToCart}
                  disabled={adding}
                  id="add-to-cart-btn"
                >
                  {adding ? '⏳ Adding…' : '🛒 Add to Cart'}
                </button>
              </div>
            )}

            {/* Feedback messages */}
            {addSuccess && (
              <div className="product-detail__toast" role="status">
                ✅ Added to cart!{' '}
                <Link to={ROUTES.CART} style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                  View Cart →
                </Link>
              </div>
            )}
            {addError && (
              <div className="product-detail__error" role="alert">
                ❌ {addError}
              </div>
            )}

            {isDiscontinued && (
              <div className="product-detail__error" role="alert">
                This product has been discontinued and is no longer available for purchase.
              </div>
            )}

            {isOutOfStock && !isDiscontinued && (
              <div className="product-detail__error" role="alert">
                This product is currently out of stock.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
