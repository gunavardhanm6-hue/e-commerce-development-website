// ============================================================
// CART SERVICE — Core cart engine with all business rules
// Implements optimistic locking via mongoose-update-if-current
// ============================================================

import mongoose from 'mongoose';
import { Cart, ICart } from '../../database/models/Cart.model';
import { CartItem, ICartItem } from '../../database/models/CartItem.model';
import { Product } from '../../database/models/Product.model';
import { ApiError } from '../../utils/ApiError';
import { HTTP_STATUS } from '../../common/constants';

// ---- Types ----

export interface CartItemPopulated extends Omit<ICartItem, 'product_id'> {
  product_id: {
    _id: mongoose.Types.ObjectId;
    name: string;
    price: number;
    stock: number;
    status: 'ACTIVE' | 'DISCONTINUED';
    imageUrl?: string;
    description?: string;
  };
}

export interface CartWithItems {
  cart: ICart;
  activeItems: CartItemPopulated[];
  savedItems: CartItemPopulated[];
  subtotal: number;
  itemCount: number;
}

// ============================================================
// HELPER — Get or create cart for user
// ============================================================
/**
 * getOrCreateCart — Finds the user's cart or creates one if it doesn't exist yet.
 * Every user has exactly one cart (unique index on user_id).
 */
async function getOrCreateCart(userId: string): Promise<ICart> {
  let cart = await Cart.findOne({ user_id: new mongoose.Types.ObjectId(userId) });
  if (!cart) {
    cart = await Cart.create({ user_id: new mongoose.Types.ObjectId(userId) });
  }
  return cart;
}

// ============================================================
// HELPER — Compute cart total from ACTIVE items only
// ============================================================
function computeSubtotal(activeItems: CartItemPopulated[]): number {
  return activeItems.reduce((sum, item) => {
    const price = item.product_id?.price ?? item.price_when_added;
    return sum + price * item.quantity;
  }, 0);
}

export class CartService {
  // ============================================================
  // GET CART — Fetch cart with populated product data
  // ============================================================
  /**
   * getCart — Returns the user's full cart with populated product info.
   * Items split into activeItems and savedItems.
   * Total is computed from ACTIVE items only.
   */
  async getCart(userId: string): Promise<CartWithItems> {
    const cart = await getOrCreateCart(userId);

    const items = (await CartItem.find({ cart_id: cart._id }).populate(
      'product_id',
      'name price stock status imageUrl description'
    )) as unknown as CartItemPopulated[];

    const activeItems = items.filter((i) => i.status === 'ACTIVE');
    const savedItems = items.filter((i) => i.status === 'SAVED');
    const subtotal = computeSubtotal(activeItems);
    const itemCount = activeItems.reduce((sum, i) => sum + i.quantity, 0);

    return { cart, activeItems, savedItems, subtotal, itemCount };
  }

  // ============================================================
  // ADD TO CART — Upsert logic (bump qty if exists, insert if not)
  // ============================================================
  /**
   * addToCart — Adds a product to the user's cart.
   *
   * Business rules:
   *   1. Product must exist and be ACTIVE
   *   2. Stock must be available
   *   3. If same product already ACTIVE in cart → increment quantity
   *   4. If same product was SAVED → move it back ACTIVE + update quantity
   *   5. Otherwise → create new CartItem
   *   6. Version is automatically incremented by mongoose-update-if-current
   */
  async addToCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartWithItems> {
    // --- Validate product ---
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product not found');
    }
    if (product.status === 'DISCONTINUED') {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Product is discontinued and cannot be added to cart');
    }
    if (product.stock < quantity) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Only ${product.stock} unit(s) available in stock`
      );
    }

    const cart = await getOrCreateCart(userId);
    const productObjId = new mongoose.Types.ObjectId(productId);

    // --- Check if this product already exists in the cart ---
    const existingItem = await CartItem.findOne({
      cart_id: cart._id,
      product_id: productObjId,
    });

    if (existingItem) {
      if (existingItem.status === 'ACTIVE') {
        // Increment quantity on existing active row
        const newQty = existingItem.quantity + quantity;
        if (product.stock < newQty) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            `Only ${product.stock} unit(s) in stock. You already have ${existingItem.quantity} in your cart.`
          );
        }
        existingItem.quantity = newQty;
        existingItem.price_when_added = product.price; // refresh price
        await existingItem.save();
      } else {
        // Was SAVED — move back to ACTIVE
        const newQty = quantity;
        if (product.stock < newQty) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            `Only ${product.stock} unit(s) available in stock`
          );
        }
        existingItem.status = 'ACTIVE';
        existingItem.quantity = newQty;
        existingItem.price_when_added = product.price;
        await existingItem.save();
      }
    } else {
      // --- Insert new CartItem ---
      await CartItem.create({
        cart_id: cart._id,
        product_id: productObjId,
        quantity,
        status: 'ACTIVE',
        price_when_added: product.price,
      });
    }

    return this.getCart(userId);
  }

  // ============================================================
  // UPDATE QUANTITY — Optimistic locking via version check
  // ============================================================
  /**
   * updateQuantity — Changes the quantity of a cart item.
   *
   * Optimistic locking:
   *   - Client sends the current version of the item
   *   - mongoose-update-if-current rejects if version is stale
   *   - Stale → 409 Conflict so client can re-fetch and retry
   */
  async updateQuantity(
    userId: string,
    itemId: string,
    quantity: number,
    version: number
  ): Promise<CartWithItems> {
    const cart = await getOrCreateCart(userId);

    // Find the item and verify it belongs to this user's cart
    const item = await CartItem.findOne({
      _id: itemId,
      cart_id: cart._id,
      status: 'ACTIVE',
    });

    if (!item) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Cart item not found');
    }

    // --- Optimistic lock check ---
    // mongoose-update-if-current uses the `__v` field as version
    // We compare client-sent version with the actual document version
    if ((item as any).__v !== version) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'Cart item was modified by another request. Please refresh and try again.'
      );
    }

    // --- Validate stock ---
    const product = await Product.findById(item.product_id);
    if (!product) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product no longer exists');
    }
    if (product.stock < quantity) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Only ${product.stock} unit(s) available in stock`
      );
    }

    // Update quantity — save() triggers the update-if-current plugin
    item.quantity = quantity;
    await item.save();

    return this.getCart(userId);
  }

  // ============================================================
  // REMOVE ITEM — Delete item from cart entirely
  // ============================================================
  /**
   * removeItem — Permanently removes a cart item.
   * Works for both ACTIVE and SAVED items.
   */
  async removeItem(userId: string, itemId: string): Promise<CartWithItems> {
    const cart = await getOrCreateCart(userId);

    const item = await CartItem.findOne({ _id: itemId, cart_id: cart._id });
    if (!item) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Cart item not found');
    }

    await CartItem.deleteOne({ _id: itemId });

    return this.getCart(userId);
  }

  // ============================================================
  // SAVE FOR LATER — Flip status ACTIVE → SAVED
  // ============================================================
  /**
   * saveForLater — Moves an item from the cart to the saved list.
   * This is a STATUS FLIP on the same row — no deletion, no new row.
   */
  async saveForLater(userId: string, itemId: string): Promise<CartWithItems> {
    const cart = await getOrCreateCart(userId);

    const item = await CartItem.findOne({
      _id: itemId,
      cart_id: cart._id,
      status: 'ACTIVE',
    });

    if (!item) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Active cart item not found');
    }

    item.status = 'SAVED';
    await item.save();

    return this.getCart(userId);
  }

  // ============================================================
  // MOVE TO CART — Flip status SAVED → ACTIVE
  // ============================================================
  /**
   * moveToCart — Moves a saved item back to the active cart.
   * Re-validates stock before making it active again.
   */
  async moveToCart(userId: string, itemId: string): Promise<CartWithItems> {
    const cart = await getOrCreateCart(userId);

    const item = await CartItem.findOne({
      _id: itemId,
      cart_id: cart._id,
      status: 'SAVED',
    });

    if (!item) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Saved item not found');
    }

    // Re-check product availability
    const product = await Product.findById(item.product_id);
    if (!product) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product no longer exists');
    }
    if (product.status === 'DISCONTINUED') {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Product has been discontinued');
    }
    if (product.stock < item.quantity) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Only ${product.stock} unit(s) in stock. Adjust quantity before moving to cart.`
      );
    }

    item.status = 'ACTIVE';
    item.price_when_added = product.price; // refresh price snapshot
    await item.save();

    return this.getCart(userId);
  }

  // ============================================================
  // CLEAR ACTIVE ITEMS — Used after successful checkout
  // ============================================================
  /**
   * clearActiveItems — Deletes all ACTIVE cart items.
   * SAVED items are intentionally left untouched per business rules.
   */
  async clearActiveItems(cartId: mongoose.Types.ObjectId): Promise<void> {
    await CartItem.deleteMany({ cart_id: cartId, status: 'ACTIVE' });
  }
}

export const cartService = new CartService();
