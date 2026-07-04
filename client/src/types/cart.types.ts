// ============================================================
// CART TYPES — TypeScript types for cart-related data
// Mirrors server-side models for type-safe API communication
// ============================================================

/**
 * ProductInCart — Populated product data inside a cart item
 */
export interface ProductInCart {
  _id: string;
  name: string;
  price: number;
  stock: number;
  status: 'ACTIVE' | 'DISCONTINUED';
  imageUrl?: string;
  description?: string;
}

/**
 * CartItem — A single item in the cart (active or saved)
 */
export interface CartItem {
  _id: string;
  cart_id: string;
  product_id: ProductInCart;
  quantity: number;
  status: 'ACTIVE' | 'SAVED';
  price_when_added: number;
  __v: number; // version for optimistic locking
  createdAt: string;
  updatedAt: string;
}

/**
 * Cart — The cart document
 */
export interface Cart {
  _id: string;
  user_id: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * CartData — Full cart response from the server
 */
export interface CartData {
  cart: Cart;
  activeItems: CartItem[];
  savedItems: CartItem[];
  subtotal: number;
  itemCount: number;
}

/**
 * CartState — Zustand store state shape
 */
export interface CartState {
  cartData: CartData | null;
  loading: boolean;
  error: string | null;
  conflictError: string | null; // 409 optimistic lock conflict
}

// ---- Checkout types ----

export interface PriceMismatch {
  productId: string;
  productName: string;
  priceWhenAdded: number;
  currentPrice: number;
  difference: number;
}

export interface CheckoutValidationResult {
  valid: boolean;
  priceMismatches: PriceMismatch[];
  outOfStockItems: string[];
  discontinuedItems: string[];
}

export interface CheckoutResult {
  orderId: string;
  orderStatus: string;
  totalAmount: number;
  itemCount: number;
  priceMismatches: PriceMismatch[];
  createdAt: string;
}

// ---- Order types ----

export interface OrderItem {
  product_id: {
    _id: string;
    name: string;
    imageUrl?: string;
    price: number;
  };
  quantity: number;
  price_at_purchase: number;
}

export interface Order {
  _id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}
