// ============================================================
// PRODUCT CARD — Compact product card for the product grid
// Links to product detail, has Add to Cart with auth check
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/appConstants';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isDisabled = product.stock === 0 || product.status === 'DISCONTINUED';
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate to detail page
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (adding || isDisabled) return;

    setAdding(true);
    try {
      await addToCart(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // Error shown via store
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card" id={`product-card-${product._id}`}>
      {/* ---- Image ---- */}
      <Link to={ROUTES.PRODUCT_DETAIL(product._id)} className="product-card__image-wrapper">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="product-card__image" />
        ) : (
          <div className="product-card__image-placeholder">🛍️</div>
        )}
        {product.status === 'DISCONTINUED' && (
          <span className="product-card__status-overlay">Discontinued</span>
        )}
      </Link>

      {/* ---- Body ---- */}
      <div className="product-card__body">
        <Link
          to={ROUTES.PRODUCT_DETAIL(product._id)}
          className="product-card__name"
        >
          {product.name}
        </Link>

        <p className="product-card__price">
          ₹{product.price.toLocaleString('en-IN')}
        </p>

        <p
          className={`product-card__stock ${
            product.stock === 0
              ? 'product-card__stock--out'
              : isLowStock
              ? 'product-card__stock--low'
              : 'product-card__stock--in'
          }`}
        >
          {product.stock === 0
            ? '✗ Out of Stock'
            : isLowStock
            ? `⚠ Only ${product.stock} left`
            : `✓ In Stock`}
        </p>

        {/* ---- Add to Cart Button ---- */}
        <button
          className={`product-card__add-btn ${added ? 'product-card__add-btn--added' : ''}`}
          onClick={handleAddToCart}
          disabled={isDisabled || adding}
          id={`add-to-cart-${product._id}`}
        >
          {adding ? '⏳' : added ? '✅ Added!' : isDisabled ? '✗ Unavailable' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
};
