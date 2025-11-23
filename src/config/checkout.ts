/**
 * Checkout Configuration
 * Central configuration for checkout and payment settings
 */

export const CHECKOUT_CONFIG = {
  // Tax Configuration
  tax: {
    rate: 0.08, // 8% - Update based on business location
    label: 'Tax',
  },

  // Email Configuration
  emails: {
    shopOwner: 'reloadedfiretvteam@gmail.com',
  },

  // Order Configuration
  order: {
    numberPrefix: 'ORD',
    idLength: 9,
  },

  // Payment Configuration
  payment: {
    currency: 'USD',
    provider: 'Square',
  },
} as const;

export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11).toUpperCase();
  return `${CHECKOUT_CONFIG.order.numberPrefix}-${timestamp}-${random}`;
}

export function calculateTax(subtotal: number): number {
  return subtotal * CHECKOUT_CONFIG.tax.rate;
}

export function calculateTotal(subtotal: number): number {
  return subtotal + calculateTax(subtotal);
}
