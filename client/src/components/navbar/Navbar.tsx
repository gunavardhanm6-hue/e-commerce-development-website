// ============================================================
// NAVBAR — Top navigation bar component
// Displays logo, navigation links, cart badge, and auth actions
// Responsive with mobile hamburger menu
// ============================================================

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCartStore, selectCartItemCount } from "../../store/cartStore";
import { APP_NAME, ROUTES } from "../../constants/appConstants";
import { Button } from "../ui/Button";
import "./Navbar.css";

/**
 * Navbar — The main navigation bar displayed at the top of every page.
 *
 * Features:
 *   - Logo/brand name (links to home)
 *   - Navigation links (Products, Orders)
 *   - Cart icon with live item count badge
 *   - Admin link (admin users only)
 *   - Auth buttons (login/register) when logged out
 *   - User menu (profile, logout) when logged in
 *   - Responsive hamburger menu for mobile
 */
export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cart badge — fetch cart count when user logs in
  const cartItemCount = useCartStore(selectCartItemCount);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar__container container">
        {/* ---- Logo ---- */}
        <Link to={ROUTES.HOME} className="navbar__logo" onClick={closeMobileMenu}>
          <span className="navbar__logo-icon">◆</span>
          <span className="navbar__logo-text">{APP_NAME}</span>
        </Link>

        {/* ---- Desktop Navigation Links ---- */}
        <div className="navbar__nav">
          <Link to={ROUTES.HOME} className="navbar__link">
            Home
          </Link>
          <Link to={ROUTES.PRODUCTS} className="navbar__link">
            Products
          </Link>
          {isAuthenticated && (
            <Link to={ROUTES.ORDERS} className="navbar__link">
              Orders
            </Link>
          )}
          {isAuthenticated && user?.role === "admin" && (
            <Link to={ROUTES.ADMIN} className="navbar__link">
              Admin
            </Link>
          )}
        </div>

        {/* ---- Auth Actions ---- */}
        <div className="navbar__actions">
          {isAuthenticated ? (
            <div className="navbar__user">
              {/* Cart Icon with Badge */}
              <Link
                to={ROUTES.CART}
                className="navbar__cart-btn"
                aria-label="Shopping cart"
                id="navbar-cart-btn"
              >
                🛒
                {cartItemCount > 0 && (
                  <span className="navbar__cart-badge" id="cart-badge">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>

              <span className="navbar__user-greeting">
                Hi, <strong>{user?.firstName}</strong>
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* ---- Mobile Hamburger Button ---- */}
        <button
          className={`navbar__hamburger ${isMobileMenuOpen ? "navbar__hamburger--open" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          id="navbar-hamburger"
        >
          <span className="navbar__hamburger-line" />
          <span className="navbar__hamburger-line" />
          <span className="navbar__hamburger-line" />
        </button>
      </div>

      {/* ---- Mobile Menu Overlay ---- */}
      {isMobileMenuOpen && (
        <div className="navbar__mobile" id="mobile-menu">
          <Link to={ROUTES.HOME} className="navbar__mobile-link" onClick={closeMobileMenu}>
            Home
          </Link>
          <Link to={ROUTES.PRODUCTS} className="navbar__mobile-link" onClick={closeMobileMenu}>
            Products
          </Link>
          {isAuthenticated && (
            <>
              <Link to={ROUTES.CART} className="navbar__mobile-link" onClick={closeMobileMenu}>
                🛒 Cart {cartItemCount > 0 && `(${cartItemCount})`}
              </Link>
              <Link to={ROUTES.ORDERS} className="navbar__mobile-link" onClick={closeMobileMenu}>
                Orders
              </Link>
            </>
          )}
          {isAuthenticated && user?.role === "admin" && (
            <Link to={ROUTES.ADMIN} className="navbar__mobile-link" onClick={closeMobileMenu}>
              Admin
            </Link>
          )}
          <div className="navbar__mobile-divider" />
          {isAuthenticated ? (
            <>
              <span className="navbar__mobile-user">
                Signed in as <strong>{user?.email}</strong>
              </span>
              <Button variant="outline" fullWidth onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} onClick={closeMobileMenu}>
                <Button variant="outline" fullWidth>
                  Login
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER} onClick={closeMobileMenu}>
                <Button variant="primary" fullWidth>
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
