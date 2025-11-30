/**
 * Utility function to handle product purchase button clicks.
 * 
 * Implements "Option 2" for Stripe Payment Links:
 * - If product has a stripe_payment_link, redirect to that link directly
 * - If not, fall back to the internal /stripe-checkout page with product ID
 * 
 * @param productId - The product ID
 * @param stripePaymentLink - Optional Stripe Payment Link URL
 */
export function handleBuyClick(productId: string, stripePaymentLink?: string | null): void {
  if (stripePaymentLink && stripePaymentLink.trim() !== '') {
    // Redirect to the Stripe Payment Link
    window.location.href = stripePaymentLink;
  } else {
    // Fall back to internal checkout page
    window.location.href = `/stripe-checkout?product=${encodeURIComponent(productId)}`;
  }
}

/**
 * Check if a product has a valid Stripe Payment Link
 * @param stripePaymentLink - The payment link URL to validate
 * @returns boolean indicating if the link is valid
 */
export function hasValidPaymentLink(stripePaymentLink?: string | null): boolean {
  return !!(stripePaymentLink && stripePaymentLink.trim() !== '');
}
