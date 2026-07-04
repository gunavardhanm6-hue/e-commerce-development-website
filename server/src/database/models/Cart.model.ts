import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  user_id: mongoose.Types.ObjectId;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
