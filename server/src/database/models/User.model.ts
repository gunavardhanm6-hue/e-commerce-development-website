// ============================================================
// USER MODEL — Mongoose schema and model for User collection
// Handles password hashing, virtual fields, and instance methods
// ============================================================

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { IUserDocument } from "../../interfaces/IUser.interface";
import { BCRYPT_SALT_ROUNDS } from "../../common/constants";

/**
 * userSchema — Defines the shape and behavior of User documents
 *
 * Fields:
 *   - firstName, lastName: User's name
 *   - email: Unique identifier for login (indexed, lowercase)
 *   - password: Hashed via bcrypt pre-save hook
 *   - role: "customer" (default) or "admin"
 *   - isActive: Soft-delete flag
 *   - refreshToken: Stored server-side for token rotation
 */
const userSchema = new Schema<IUserDocument>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false, // Don't include refresh token in queries by default
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ---- VIRTUAL: fullName ----
userSchema.virtual("fullName").get(function (this: IUserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// ---- PRE-SAVE HOOK: Hash password before saving ----
userSchema.pre("save", async function () {
  // Only hash if password was modified (not on every save)
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

// ---- INSTANCE METHOD: Compare password ----
/**
 * comparePassword — Compares a plain-text password with the stored hash
 * @param candidatePassword - The plain-text password to check
 * @returns true if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ---- TRANSFORM: Remove password from JSON output ----
userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  },
});

/**
 * User — Mongoose model for the "users" collection
 */
export const User = mongoose.model<IUserDocument>("User", userSchema);
