// ============================================================
// USER TYPES — TypeScript types for user-related data
// Extends beyond auth for profile, addresses, etc.
// ============================================================

/**
 * UserProfile — Extended user profile (future: with addresses, preferences)
 */
export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "customer" | "admin";
  isActive: boolean;
  fullName: string;
  createdAt: string;
  updatedAt: string;
  // Future fields:
  // phone?: string;
  // avatar?: string;
  // addresses?: Address[];
}

/**
 * Address — User shipping/billing address (future use)
 */
export interface Address {
  _id?: string;
  label: string;         // "Home", "Work", etc.
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}
