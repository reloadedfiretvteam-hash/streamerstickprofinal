/**
 * Allowed URL prefixes for Stripe Payment Links.
 * This prevents open redirects to malicious sites.
 */
const ALLOWED_STRIPE_URL_PREFIXES = [
  'https://buy.stripe.com/',
  'https://checkout.stripe.com/',
  'https://invoice.stripe.com/',
];

/**
 * Validates that a URL is a legitimate Stripe payment link.
 * Prevents open redirect vulnerabilities by only allowing known Stripe domains.
 * 
 * @param url - The URL to validate
 * @returns boolean indicating if the URL is a valid Stripe payment link
 */
function isValidStripeUrl(url: string): boolean {
  const trimmedUrl = url.trim();
  return ALLOWED_STRIPE_URL_PREFIXES.some(prefix => trimmedUrl.startsWith(prefix));
}

/**
 * Validates that a product ID follows expected format (alphanumeric with hyphens/underscores).
 * Prevents potential injection attacks.
 * 
 * @param productId - The product ID to validate
 * @returns boolean indicating if the product ID is valid
 */
function isValidProductId(productId: string): boolean {
  // Allow alphanumeric characters, hyphens, underscores, and UUIDs
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(productId) && productId.length > 0 && productId.length <= 100;
}

/**
 * Utility function to handle product purchase button clicks.
 * 
 * Implements "Option 2" for Stripe Payment Links:
 * - If product has a stripe_payment_link, redirect to that link directly
 * - If not, fall back to the internal /stripe-checkout page with product ID
 * 
 * Security features:
 * - Validates Stripe URLs against allowed prefixes to prevent open redirects
 * - Validates product IDs to prevent injection attacks
 * 
 * @param productId - The product ID
 * @param stripePaymentLink - Optional Stripe Payment Link URL
 */
export function handleBuyClick(productId: string, stripePaymentLink?: string | null): void {
  // Validate and use Stripe Payment Link if available
  if (stripePaymentLink && stripePaymentLink.trim() !== '' && isValidStripeUrl(stripePaymentLink)) {
    window.location.href = stripePaymentLink;
    return;
  }
  
  // Fall back to internal checkout page with validated product ID
  if (isValidProductId(productId)) {
    window.location.href = `/stripe-checkout?product=${encodeURIComponent(productId)}`;
  } else {
    // If product ID is invalid, redirect to shop page
    console.warn('Invalid product ID format:', productId);
    window.location.href = '/shop';
  }
}

/**
 * Check if a product has a valid Stripe Payment Link
 * @param stripePaymentLink - The payment link URL to validate
 * @returns boolean indicating if the link is valid
 */
export function hasValidPaymentLink(stripePaymentLink?: string | null): boolean {
  return !!(stripePaymentLink && stripePaymentLink.trim() !== '' && isValidStripeUrl(stripePaymentLink));
}
