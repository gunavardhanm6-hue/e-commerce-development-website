// ============================================================
// HOME PAGE — Landing page for the e-commerce store
// Hero section + feature highlights (placeholder for products)
// ============================================================

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { ROUTES } from "../constants/appConstants";
import "./HomePage.css";

/**
 * HomePage — The main landing page of the store.
 *
 * Sections:
 *   - Hero: Headline, tagline, CTA button
 *   - Features: 3 feature cards highlighting the store's value
 *   - CTA: Call-to-action for non-authenticated users
 */
export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page">
      {/* ======== HERO SECTION ======== */}
      <section className="hero" id="hero-section">
        <div className="hero__container container">
          <div className="hero__content">
            <span className="hero__badge">🚀 New Arrivals</span>
            <h1 className="hero__title">
              Discover
              <span className="hero__title-accent"> Premium </span>
              Products
            </h1>
            <p className="hero__description">
              Explore our curated collection of premium products with
              unbeatable prices, seamless checkout, and lightning-fast delivery.
            </p>
            <div className="hero__actions">
              <Link to={ROUTES.PRODUCTS}>
                <Button variant="primary" size="lg">
                  Shop Now →
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to={ROUTES.REGISTER}>
                  <Button variant="outline" size="lg">
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
            {isAuthenticated && (
              <p className="hero__welcome">
                Welcome back, <strong>{user?.firstName}</strong>! 👋
              </p>
            )}
          </div>
          <div className="hero__visual">
            <div className="hero__shape hero__shape--1" />
            <div className="hero__shape hero__shape--2" />
            <div className="hero__shape hero__shape--3" />
            <div className="hero__product-mockup">
              <div className="hero__mockup-card">
                <div className="hero__mockup-image" />
                <div className="hero__mockup-info">
                  <div className="hero__mockup-title" />
                  <div className="hero__mockup-price" />
                </div>
              </div>
              <div className="hero__mockup-card hero__mockup-card--offset">
                <div className="hero__mockup-image" />
                <div className="hero__mockup-info">
                  <div className="hero__mockup-title" />
                  <div className="hero__mockup-price" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FEATURES SECTION ======== */}
      <section className="features" id="features-section">
        <div className="features__container container">
          <div className="features__card">
            <span className="features__icon">🚚</span>
            <h3 className="features__title">Free Shipping</h3>
            <p className="features__text">
              Free shipping on all orders over $50. Fast and reliable delivery.
            </p>
          </div>
          <div className="features__card">
            <span className="features__icon">🔒</span>
            <h3 className="features__title">Secure Payment</h3>
            <p className="features__text">
              Your payment information is encrypted and protected at all times.
            </p>
          </div>
          <div className="features__card">
            <span className="features__icon">↩️</span>
            <h3 className="features__title">Easy Returns</h3>
            <p className="features__text">
              Not satisfied? Return any item within 30 days for a full refund.
            </p>
          </div>
        </div>
      </section>

      {/* ======== CTA SECTION (Non-authenticated only) ======== */}
      {!isAuthenticated && (
        <section className="cta" id="cta-section">
          <div className="cta__container container">
            <h2 className="cta__title">Ready to Start Shopping?</h2>
            <p className="cta__text">
              Create your free account today and get access to exclusive deals.
            </p>
            <Link to={ROUTES.REGISTER}>
              <Button variant="secondary" size="lg">
                Get Started — It's Free
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};
