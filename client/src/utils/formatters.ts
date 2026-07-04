// ============================================================
// FORMATTERS — Utility functions for formatting data
// Prices, dates, strings, etc.
// ============================================================

/**
 * formatPrice — Formats a number as a currency string
 * @param price - The price value
 * @param currency - Currency code (default: "USD")
 * @returns Formatted price string (e.g., "$29.99")
 */
export const formatPrice = (price: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
};

/**
 * formatDate — Formats an ISO date string to a readable format
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string (e.g., "Jul 2, 2026")
 */
export const formatDate = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };
  return new Date(dateString).toLocaleDateString("en-US", defaultOptions);
};

/**
 * truncateText — Truncates text to a maximum length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum character count (default: 100)
 * @returns Truncated text with "..." if it exceeds maxLength
 */
export const truncateText = (text: string, maxLength = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + "...";
};

/**
 * capitalize — Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * slugify — Converts a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns Slug string (e.g., "hello-world")
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};
