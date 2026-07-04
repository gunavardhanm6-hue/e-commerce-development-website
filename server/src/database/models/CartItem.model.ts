import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem extends Document {
  cart_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  quantity: number;
  status: 'ACTIVE' | 'SAVED';
  price_when_added: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    cart_id: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['ACTIVE', 'SAVED'], default: 'ACTIVE' },
    price_when_added: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

// Ensure a cart doesn't have duplicate products
CartItemSchema.index({ cart_id: 1, product_id: 1 }, { unique: true });

export const CartItem = mongoose.model<ICartItem>('CartItem', CartItemSchema);
