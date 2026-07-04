// ============================================================
// AUTH VALIDATOR — Client-side form validation for auth forms
// Validates email, password, and name fields before API calls
// ============================================================

/**
 * ValidationResult — Result of a validation check
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * validateEmail — Checks if an email address is valid
 * @param email - The email to validate
 * @returns Error message or empty string if valid
 */
export const validateEmail = (email: string): string => {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

/**
 * validatePassword — Checks if a password meets strength requirements
 * @param password - The password to validate
 * @returns Error message or empty string if valid
 */
export const validatePassword = (password: string): string => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  return "";
};

/**
 * validateName — Checks if a name field is valid
 * @param name - The name to validate
 * @param fieldName - Display name for error messages ("First name", etc.)
 * @returns Error message or empty string if valid
 */
export const validateName = (name: string, fieldName: string): string => {
  if (!name.trim()) return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.trim().length > 50) return `${fieldName} cannot exceed 50 characters`;
  return "";
};

/**
 * validateLoginForm — Validates the entire login form
 * @param email - Email field value
 * @param password - Password field value
 * @returns ValidationResult with isValid flag and error map
 */
export const validateLoginForm = (
  email: string,
  password: string
): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  if (!password) errors.password = "Password is required";

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * validateRegisterForm — Validates the entire registration form
 * @param firstName - First name field value
 * @param lastName - Last name field value
 * @param email - Email field value
 * @param password - Password field value
 * @returns ValidationResult with isValid flag and error map
 */
export const validateRegisterForm = (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): ValidationResult => {
  const errors: Record<string, string> = {};

  const firstNameError = validateName(firstName, "First name");
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateName(lastName, "Last name");
  if (lastNameError) errors.lastName = lastNameError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
