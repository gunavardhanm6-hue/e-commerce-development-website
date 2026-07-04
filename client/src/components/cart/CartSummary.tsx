// ============================================================
// CART SUMMARY — Order summary panel with totals + checkout CTA
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { ROUTES } from '../../constants/appConstants';
import './CartSummary.css';

const SHIPPING_THRESHOLD = 500; // Free shipping above ₹500
const GST_RATE = 0.18; // 18% GST

export const CartSummary: React.FC = () => {
  const { cartData } = useCartStore();
  const navigate = useNavigate();

  if (!cartData) return null;

  const subtotal = cartData.subtotal;
  const shipping = subtotal > SHIPPING_THRESHOLD ? 0 : 49;
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + shipping + gst;
  const itemCount = cartData.itemCount;
  const savedCount = cartData.savedItems.length;

  const isEmpty = cartData.activeItems.length === 0;

  return (
    <div className="cart-summary" id="cart-summary-panel">
      <h2 className="cart-summary__title">Order Summary</h2>

      {/* Subtotal */}
      <div className="cart-summary__row">
        <span className="cart-summary__label">
          Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
        </span>
        <span className="cart-summary__value">₹{subtotal.toLocaleString('en-IN')}</span>
      </div>

      {/* Shipping */}
      <div className="cart-summary__row">
        <span className="cart-summary__label">Shipping</span>
        <span className={`cart-summary__value ${shipping === 0 ? 'cart-summary__value--free' : ''}`}>
          {shipping === 0 ? 'FREE' : `₹${shipping}`}
        </span>
      </div>

      {/* GST */}
      <div className="cart-summary__row">
        <span className="cart-summary__label">GST (18%)</span>
        <span className="cart-summary__value">₹{gst.toLocaleString('en-IN')}</span>
      </div>

      <div className="cart-summary__divider" />

      {/* Total */}
      <div className="cart-summary__total-row">
        <span className="cart-summary__total-label">Total</span>
        <span className="cart-summary__total-value">
          ₹{total.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Checkout CTA */}
      <button
        className="cart-summary__checkout-btn"
        onClick={() => navigate(ROUTES.CHECKOUT)}
        disabled={isEmpty}
        id="proceed-to-checkout-btn"
      >
        🛡 Proceed to Checkout →
      </button>

      {shipping > 0 && (
        <p className="cart-summary__note">
          Add ₹{(SHIPPING_THRESHOLD - subtotal).toLocaleString('en-IN')} more for free shipping!
        </p>
      )}

      {savedCount > 0 && (
        <p className="cart-summary__saved-note">
          You have {savedCount} item{savedCount !== 1 ? 's' : ''} saved for later
        </p>
      )}
    </div>
  );
};
