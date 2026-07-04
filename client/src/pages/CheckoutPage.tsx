// ============================================================
// CHECKOUT PAGE — Full checkout flow with validation + order placement
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { checkoutService } from '../services/checkoutService';
import type { CheckoutValidationResult } from '../types/cart.types';
import { ROUTES } from '../constants/appConstants';
import './CheckoutPage.css';

const GST_RATE = 0.18;
const SHIPPING_THRESHOLD = 500;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartData, fetchCart, resetCart } = useCartStore();

  const [validation, setValidation] = useState<CheckoutValidationResult | null>(null);
  const [validating, setValidating] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [blockingError, setBlockingError] = useState<string | null>(null);

  // Fetch fresh cart and validate on page mount
  useEffect(() => {
    const init = async () => {
      await fetchCart();
      try {
        const result = await checkoutService.validate();
        setValidation(result);
        if (!result.valid) {
          setBlockingError('Some items in your cart have issues. Please review before proceeding.');
        }
      } catch (err: any) {
        setBlockingError(err?.response?.data?.message ?? 'Failed to validate checkout');
      } finally {
        setValidating(false);
      }
    };
    init();
  }, [fetchCart]);

  const handlePlaceOrder = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      const result = await checkoutService.process();
      // Reset local cart state (cart was cleared on server)
      resetCart();
      // Navigate to confirmation with order details
      navigate(ROUTES.ORDERS, {
        state: { orderResult: result, fromCheckout: true },
      });
    } catch (err: any) {
      setBlockingError(err?.response?.data?.message ?? 'Checkout failed. Please try again.');
      setPlacing(false);
    }
  };

  if (validating) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1 className="checkout-page__title">Checkout</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Validating your cart…</p>
        </div>
      </div>
    );
  }

  const activeItems = cartData?.activeItems ?? [];
  const subtotal = cartData?.subtotal ?? 0;
  const shipping = subtotal > SHIPPING_THRESHOLD ? 0 : 49;
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + shipping + gst;

  const hasBlockingIssues =
    (validation?.outOfStockItems.length ?? 0) > 0 ||
    (validation?.discontinuedItems.length ?? 0) > 0;

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-page__title">Checkout</h1>

        <div className="checkout-page__layout">
          {/* ---- Left: Order Review + Warnings ---- */}
          <div>
            {/* Warnings */}
            {blockingError && (
              <div className="checkout-warnings">
                <div className="checkout-warning checkout-warning--stock">
                  ❌ {blockingError}
                </div>
              </div>
            )}

            {/* Discontinued products */}
            {(validation?.discontinuedItems.length ?? 0) > 0 && (
              <div className="checkout-warnings">
                <div className="checkout-warning checkout-warning--stock">
                  ❌ <strong>Discontinued products in cart:</strong>{' '}
                  {validation!.discontinuedItems.join(', ')} — Please remove them to continue.
                </div>
              </div>
            )}

            {/* Out-of-stock */}
            {(validation?.outOfStockItems.length ?? 0) > 0 && (
              <div className="checkout-warnings">
                {validation!.outOfStockItems.map((item, i) => (
                  <div key={i} className="checkout-warning checkout-warning--stock">
                    ❌ {item}
                  </div>
                ))}
              </div>
            )}

            {/* Price mismatches (non-blocking — just informational) */}
            {(validation?.priceMismatches.length ?? 0) > 0 && (
              <div className="checkout-warnings">
                <div className="checkout-warning checkout-warning--info">
                  ℹ️ <strong>Price updated since you added these items:</strong>
                </div>
                {validation!.priceMismatches.map((m) => (
                  <div key={m.productId} className="checkout-warning checkout-warning--price">
                    ⚠️ <strong>{m.productName}</strong>: was ₹{m.priceWhenAdded.toLocaleString('en-IN')}, now ₹{m.currentPrice.toLocaleString('en-IN')}{' '}
                    ({m.difference > 0 ? '+' : ''}₹{m.difference.toLocaleString('en-IN')})
                  </div>
                ))}
              </div>
            )}

            {/* Order Review */}
            <div className="checkout-panel">
              <h2 className="checkout-panel__title">
                Order Review ({activeItems.length} item{activeItems.length !== 1 ? 's' : ''})
              </h2>
              {activeItems.map((item) => {
                const product = item.product_id;
                return (
                  <div key={item._id} className="checkout-order-item">
                    <div className="checkout-order-item__image">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        '🛍️'
                      )}
                    </div>
                    <div className="checkout-order-item__info">
                      <p className="checkout-order-item__name">{product.name}</p>
                      <p className="checkout-order-item__qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="checkout-order-item__price">
                      ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- Right: Totals + Place Order ---- */}
          <div className="checkout-totals">
            <h2 className="checkout-totals__title">Payment Summary</h2>

            <div className="checkout-totals__row">
              <span className="checkout-totals__label">Subtotal</span>
              <span className="checkout-totals__value">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="checkout-totals__row">
              <span className="checkout-totals__label">Shipping</span>
              <span className="checkout-totals__value">
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div className="checkout-totals__row">
              <span className="checkout-totals__label">GST (18%)</span>
              <span className="checkout-totals__value">₹{gst.toLocaleString('en-IN')}</span>
            </div>

            <div className="checkout-totals__divider" />

            <div className="checkout-totals__total-row">
              <span className="checkout-totals__total-label">Total</span>
              <span className="checkout-totals__total-value">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              className="checkout-totals__place-btn"
              onClick={handlePlaceOrder}
              disabled={placing || hasBlockingIssues || activeItems.length === 0}
              id="place-order-btn"
            >
              {placing ? '⏳ Placing Order…' : '✅ Place Order'}
            </button>

            <p className="checkout-totals__security">
              🔒 Secure checkout — your data is encrypted
            </p>

            {hasBlockingIssues && (
              <p style={{ marginTop: 'var(--space-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', textAlign: 'center' }}>
                Please fix the issues above before placing your order.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
