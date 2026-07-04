// ============================================================
// CART ITEM CARD — Displays a single cart item
// Handles: quantity stepper, save/move, remove, price mismatch badge
// ============================================================

import React, { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import type { CartItem } from '../../types/cart.types';
import './CartItemCard.css';

interface CartItemCardProps {
  item: CartItem;
  mode: 'active' | 'saved';
}

export const CartItemCard: React.FC<CartItemCardProps> = ({ item, mode }) => {
  const { updateQuantity, removeItem, saveForLater, moveToCart } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const product = item.product_id;
  const isDiscontinued = product.status === 'DISCONTINUED';
  const hasPriceMismatch = product.price !== item.price_when_added;
  const priceDiff = product.price - item.price_when_added;
  const lineTotal = product.price * item.quantity;

  // ---- Quantity stepper handlers ----

  const handleDecrement = async () => {
    if (item.quantity <= 1 || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateQuantity(item._id, item.quantity - 1, item.__v);
    } catch {
      // Error handled in store — store refetches cart automatically on 409
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrement = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateQuantity(item._id, item.quantity + 1, item.__v);
    } catch {
      // Silent — error shown via store.error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem(item._id);
    } catch {
      // Silent
    }
  };

  const handleSaveForLater = async () => {
    try {
      await saveForLater(item._id);
    } catch {
      // Silent
    }
  };

  const handleMoveToCart = async () => {
    try {
      await moveToCart(item._id);
    } catch {
      // Silent
    }
  };

  return (
    <div className={`cart-item-card ${mode === 'saved' ? 'cart-item-card--saved' : ''}`}>
      {/* ---- Product Image ---- */}
      <div className="cart-item__image-wrapper">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="cart-item__image"
          />
        ) : (
          <div className="cart-item__image-placeholder">🛍️</div>
        )}
      </div>

      {/* ---- Product Info ---- */}
      <div className="cart-item__info">
        <h3 className="cart-item__name">{product.name}</h3>

        {isDiscontinued && (
          <span className="cart-item__status-badge cart-item__status-badge--discontinued">
            ⚠ Discontinued
          </span>
        )}
        {mode === 'saved' && !isDiscontinued && (
          <span className="cart-item__status-badge cart-item__status-badge--saved">
            🔖 Saved for later
          </span>
        )}

        {/* ---- Price Row ---- */}
        <div className="cart-item__pricing">
          <span className="cart-item__price-current">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {hasPriceMismatch && (
            <>
              <span className="cart-item__price-added">
                ₹{item.price_when_added.toLocaleString('en-IN')}
              </span>
              <span className="cart-item__price-mismatch">
                {priceDiff > 0 ? `+₹${priceDiff.toLocaleString('en-IN')}` : `-₹${Math.abs(priceDiff).toLocaleString('en-IN')}`} price changed
              </span>
            </>
          )}
        </div>

        {/* ---- Quantity Stepper (active items only) ---- */}
        {mode === 'active' && (
          <div className="cart-item__quantity">
            <span className="cart-item__qty-label">Qty:</span>
            <button
              className="cart-item__qty-btn"
              onClick={handleDecrement}
              disabled={item.quantity <= 1 || isUpdating}
              aria-label="Decrease quantity"
              id={`qty-dec-${item._id}`}
            >
              −
            </button>
            <span className="cart-item__qty-value">{item.quantity}</span>
            <button
              className="cart-item__qty-btn"
              onClick={handleIncrement}
              disabled={item.quantity >= product.stock || isUpdating}
              aria-label="Increase quantity"
              id={`qty-inc-${item._id}`}
            >
              +
            </button>
            {isUpdating && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>updating…</span>}
          </div>
        )}

        {/* ---- Line Total ---- */}
        {mode === 'active' && (
          <p className="cart-item__line-total">
            Total: <strong>₹{lineTotal.toLocaleString('en-IN')}</strong>
          </p>
        )}
      </div>

      {/* ---- Actions ---- */}
      <div className="cart-item__actions">
        {mode === 'active' && (
          <button
            className="cart-item__action-btn cart-item__action-btn--save"
            onClick={handleSaveForLater}
            id={`save-later-${item._id}`}
          >
            🔖 Save for later
          </button>
        )}

        {mode === 'saved' && (
          <button
            className="cart-item__action-btn cart-item__action-btn--move"
            onClick={handleMoveToCart}
            id={`move-to-cart-${item._id}`}
            disabled={isDiscontinued || product.stock === 0}
          >
            🛒 Move to cart
          </button>
        )}

        <button
          className="cart-item__action-btn cart-item__action-btn--remove"
          onClick={handleRemove}
          id={`remove-item-${item._id}`}
        >
          🗑 Remove
        </button>
      </div>
    </div>
  );
};
