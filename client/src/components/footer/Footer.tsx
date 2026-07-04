// ============================================================
// FOOTER — Site footer component
// Displays brand info, quick links, and copyright
// ============================================================

import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME, ROUTES } from "../../constants/appConstants";
import "./Footer.css";

/**
 * Footer — The main footer displayed at the bottom of every page.
 *
 * Sections:
 *   - Brand column (logo + description)
 *   - Quick Links column
 *   - Support column
 *   - Copyright bar
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="main-footer">
      <div className="footer__container container">
        {/* ---- Brand Column ---- */}
        <div className="footer__brand">
          <Link to={ROUTES.HOME} className="footer__logo">
            <span className="footer__logo-icon">◆</span>
            <span className="footer__logo-text">{APP_NAME}</span>
          </Link>
          <p className="footer__description">
            Premium e-commerce experience with curated products,
            seamless checkout, and lightning-fast delivery.
          </p>
        </div>

        {/* ---- Quick Links ---- */}
        <div className="footer__links">
          <h4 className="footer__heading">Quick Links</h4>
          <Link to={ROUTES.HOME} className="footer__link">Home</Link>
          <Link to={ROUTES.PRODUCTS} className="footer__link">Products</Link>
          <Link to={ROUTES.CART} className="footer__link">Cart</Link>
          <Link to={ROUTES.ORDERS} className="footer__link">Orders</Link>
        </div>

        {/* ---- Support ---- */}
        <div className="footer__links">
          <h4 className="footer__heading">Support</h4>
          <a href="#" className="footer__link">Help Center</a>
          <a href="#" className="footer__link">Shipping Info</a>
          <a href="#" className="footer__link">Returns</a>
          <a href="#" className="footer__link">Contact Us</a>
        </div>

        {/* ---- Legal ---- */}
        <div className="footer__links">
          <h4 className="footer__heading">Legal</h4>
          <a href="#" className="footer__link">Privacy Policy</a>
          <a href="#" className="footer__link">Terms of Service</a>
          <a href="#" className="footer__link">Cookie Policy</a>
        </div>
      </div>

      {/* ---- Copyright Bar ---- */}
      <div className="footer__bottom">
        <div className="container">
          <p className="footer__copyright">
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
