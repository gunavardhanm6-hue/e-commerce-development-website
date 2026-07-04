// ============================================================
// ORDER MODEL — Mongoose schema for orders
// Stores items with price_at_purchase (live price snapshot)
// ============================================================

import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product_id: mongoose.Types.ObjectId;
  quantity: number;
  price_at_purchase: number; // live price at the moment of checkout
}

export interface IOrder extends Document {
  user_id: mongoose.Types.ObjectId;
  items: IOrderItem[];
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price_at_purchase: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], required: true },
    total_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
