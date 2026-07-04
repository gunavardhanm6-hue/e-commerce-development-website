// ============================================================
// PAYMENT MODEL — Mongoose schema for payments
// Linked 1:1 to an order
// ============================================================

import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  order_id: mongoose.Types.ObjectId;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  method: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    method: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
