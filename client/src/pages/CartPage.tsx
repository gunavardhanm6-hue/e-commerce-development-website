// ============================================================
// CART PAGE — Full cart view with active items, saved items, and summary
// Fetches cart on mount, shows conflict alerts, handles empty state
// ============================================================

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { CartItemCard } from '../components/cart/CartItemCard';
import { CartSummary } from '../components/cart/CartSummary';
import { ROUTES } from '../constants/appConstants';
import './CartPage.css';

export const CartPage: React.FC = () => {
  const {
    cartData,
    loading,
    error,
    conflictError,
    fetchCart,
    clearConflictError,
    clearError,
  } = useCartStore();

  // Fetch cart whenever the page mounts (server is source of truth)
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ---- Loading skeleton ----
  if (loading && !cartData) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="cart-page__header">
            <h1 className="cart-page__title">Your Cart</h1>
          </div>
          <div className="cart-page__layout">
            <div className="cart-page__items-column">
              {[1, 2, 3].map((i) => (
                <div key={i} className="cart-page__skeleton-item" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeItems = cartData?.activeItems ?? [];
  const savedItems = cartData?.savedItems ?? [];
  const isEmpty = activeItems.length === 0;

  return (
    <div className="cart-page">
      <div className="container">
        {/* ---- Page Header ---- */}
        <div className="cart-page__header">
          <h1 className="cart-page__title">Your Cart</h1>
          {!isEmpty && (
            <span className="cart-page__count-badge">{cartData?.itemCount}</span>
          )}
        </div>

        {/* ---- Conflict Alert (409 optimistic lock) ---- */}
        {conflictError && (
          <div className="cart-page__conflict-alert" role="alert">
            ⚠️ {conflictError}
            <button
              className="cart-page__conflict-close"
              onClick={clearConflictError}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* ---- General Error ---- */}
        {error && (
          <div className="cart-page__error-alert" role="alert">
            ❌ {error}
            <button
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
              onClick={clearError}
            >
              ×
            </button>
          </div>
        )}

        {/* ---- Empty Cart ---- */}
        {isEmpty && !loading && (
          <div className="cart-page__empty" id="empty-cart-state">
            <div className="cart-page__empty-icon">🛒</div>
            <h2 className="cart-page__empty-title">Your cart is empty</h2>
            <p className="cart-page__empty-text">
              Discover our collection and add items you love!
            </p>
            <Link to={ROUTES.PRODUCTS} className="cart-page__empty-btn">
              🛍 Start Shopping
            </Link>
          </div>
        )}

        {/* ---- Main Layout (items + summary) ---- */}
        {(!isEmpty || savedItems.length > 0) && (
          <div className="cart-page__layout">
            {/* Left column: items */}
            <div className="cart-page__items-column">
              {/* Active items */}
              {activeItems.length > 0 && (
                <>
                  <h2 className="cart-page__section-header">
                    Active Items <span>({activeItems.length})</span>
                  </h2>
                  {activeItems.map((item) => (
                    <CartItemCard key={item._id} item={item} mode="active" />
                  ))}
                </>
              )}

              {/* Saved for later */}
              {savedItems.length > 0 && (
                <>
                  <h2 className="cart-page__section-header">
                    Saved for Later <span>({savedItems.length})</span>
                  </h2>
                  {savedItems.map((item) => (
                    <CartItemCard key={item._id} item={item} mode="saved" />
                  ))}
                </>
              )}
            </div>

            {/* Right column: order summary (only if active items exist) */}
            {!isEmpty && (
              <div className="cart-page__summary-column">
                <CartSummary />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
