// ============================================================
// IUser INTERFACE — TypeScript interface for the User entity
// Defines the shape of a user document in the database
// ============================================================

import { Document } from "mongoose";

/**
 * IUser — Core user properties (without Mongoose Document methods)
 */
export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * IUserDocument — Mongoose Document version of IUser
 * Extends Document so it has .save(), ._id, etc.
 */
export interface IUserDocument extends IUser, Document {
  /** comparePassword — Compares a plain text password with the hashed password */
  comparePassword(candidatePassword: string): Promise<boolean>;

  /** fullName — Virtual getter combining firstName + lastName */
  fullName: string;
}
