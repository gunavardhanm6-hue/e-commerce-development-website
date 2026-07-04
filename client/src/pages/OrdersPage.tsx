// ============================================================
// ORDERS PAGE — Order history + post-checkout confirmation banner
// If navigated from checkout, shows a success confirmation at top
// ============================================================

import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { Order, CheckoutResult } from '../types/cart.types';
import { ROUTES } from '../constants/appConstants';
import './OrdersPage.css';

const STATUS_LABELS: Record<string, string> = {
  PENDING: '⏳ Pending',
  CONFIRMED: '✅ Confirmed',
  PAID: '💳 Paid',
  SHIPPED: '🚚 Shipped',
  DELIVERED: '📦 Delivered',
  CANCELLED: '❌ Cancelled',
};

const STATUS_CLASS: Record<string, string> = {
  CONFIRMED: 'order-card__status--confirmed',
  PAID: 'order-card__status--confirmed',
  DELIVERED: 'order-card__status--confirmed',
  PENDING: 'order-card__status--pending',
  SHIPPED: 'order-card__status--pending',
  CANCELLED: 'order-card__status--cancelled',
};

export const OrdersPage: React.FC = () => {
  const location = useLocation();
  const orderResult: CheckoutResult | null = location.state?.orderResult ?? null;
  const fromCheckout: boolean = location.state?.fromCheckout ?? false;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosInstance.get<{ data: { orders: Order[] } }>(
          API_ENDPOINTS.ORDERS.LIST
        );
        setOrders(data.data.orders);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-page__title">My Orders</h1>

        {/* ---- Order Confirmation Banner ---- */}
        {fromCheckout && orderResult && (
          <div className="order-confirmation-banner" id="order-confirmation">
            <div className="order-confirmation-banner__icon">🎉</div>
            <h2 className="order-confirmation-banner__title">Order Placed Successfully!</h2>
            <p className="order-confirmation-banner__subtitle">
              Your order for{' '}
              <strong>₹{orderResult.totalAmount.toLocaleString('en-IN')}</strong>{' '}
              has been confirmed. Thank you for shopping with us!
            </p>
            <span className="order-confirmation-banner__id">
              Order ID: {orderResult.orderId}
            </span>
          </div>
        )}

        {/* ---- Loading ---- */}
        {loading && (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading orders…</p>
        )}

        {/* ---- Error ---- */}
        {error && (
          <p style={{ color: 'var(--color-error)' }}>{error}</p>
        )}

        {/* ---- Order List ---- */}
        {!loading && orders.length === 0 && (
          <div className="orders-page__empty">
            <div className="orders-page__empty-icon">📋</div>
            <h2 className="orders-page__empty-title">No orders yet</h2>
            <p className="orders-page__empty-text">
              Start shopping and your orders will appear here.
            </p>
            <Link to={ROUTES.PRODUCTS} className="orders-page__empty-btn">
              🛍 Browse Products
            </Link>
          </div>
        )}

        {orders.map((order) => (
          <div key={order._id} className="order-card" id={`order-${order._id}`}>
            <div className="order-card__header">
              <div>
                <p className="order-card__id">Order ID: {order._id}</p>
                <p className="order-card__date">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <span className={`order-card__status ${STATUS_CLASS[order.status] ?? ''}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>

            {/* Items */}
            <div className="order-card__items">
              {order.items.map((item, i) => (
                <div key={i} className="order-card__item-chip">
                  <span>
                    {typeof item.product_id === 'object' && item.product_id !== null
                      ? (item.product_id as any).name
                      : 'Product'}{' '}
                    × {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-card__footer">
              <span className="order-card__total-label">Order Total</span>
              <span className="order-card__total-value">
                ₹{order.total_amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
