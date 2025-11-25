/**
 * Price Synchronization API
 * 
 * This module provides functions to sync prices between real_products (authoritative)
 * and square_products tables. It also supports an opt-in feature flag to prepare
 * Square Catalog payloads (without actually calling Square API).
 * 
 * SECURITY:
 * - Requires ADMIN_API_KEY env var for authentication
 * - Square API calls are disabled by default (feature flag required)
 * - No secrets are stored in this file
 * 
 * USAGE:
 * - Import and call syncPrices() from your admin panel
 * - Pass a valid admin API key for authentication
 */

import { supabase } from '../lib/supabase';

// Types
export interface PriceMismatch {
  productId: string;
  productName: string;
  sku: string;
  realPrice: number;
  squarePrice: number;
  difference: number;
  percentDiff: number;
}

export interface SyncResult {
  success: boolean;
  message: string;
  mismatches: PriceMismatch[];
  synced: number;
  errors: string[];
  squarePayloads?: SquareCatalogPayload[];
}

export interface SquareCatalogPayload {
  type: 'ITEM_VARIATION';
  id: string;
  itemVariationData: {
    name: string;
    pricingType: 'FIXED_PRICING';
    priceMoney: {
      amount: number; // In cents
      currency: 'USD';
    };
  };
}

// Feature flags (controlled by environment)
const ENABLE_SQUARE_SYNC = import.meta.env.VITE_ENABLE_SQUARE_SYNC === 'true';

/**
 * Validates the admin API key
 * @param apiKey - The API key to validate
 * @returns true if valid, false otherwise
 */
export function validateAdminApiKey(apiKey: string): boolean {
  const expectedKey = import.meta.env.VITE_ADMIN_API_KEY;
  
  if (!expectedKey) {
    console.warn('ADMIN_API_KEY not configured - admin operations disabled');
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (apiKey.length !== expectedKey.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < apiKey.length; i++) {
    result |= apiKey.charCodeAt(i) ^ expectedKey.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Fetches current price mismatches between real_products and square_products
 * @returns Array of price mismatches
 */
export async function getPriceMismatches(): Promise<PriceMismatch[]> {
  const mismatches: PriceMismatch[] = [];
  
  try {
    // Fetch all real_products with their square_products mappings
    const { data: realProducts, error: realError } = await supabase
      .from('real_products')
      .select('id, name, sku, price')
      .eq('active', true);
    
    if (realError) {
      console.error('Error fetching real_products:', realError);
      return mismatches;
    }
    
    if (!realProducts || realProducts.length === 0) {
      return mismatches;
    }
    
    // Fetch square_products
    const { data: squareProducts, error: squareError } = await supabase
      .from('square_products')
      .select('real_product_id, sku, price');
    
    if (squareError) {
      console.error('Error fetching square_products:', squareError);
      return mismatches;
    }
    
    // Build lookup map
    const squarePriceMap = new Map<string, number>();
    squareProducts?.forEach((sp) => {
      if (sp.real_product_id) {
        squarePriceMap.set(sp.real_product_id, sp.price || 0);
      }
    });
    
    // Find mismatches
    realProducts.forEach((rp) => {
      const squarePrice = squarePriceMap.get(rp.id);
      
      if (squarePrice !== undefined && squarePrice !== rp.price) {
        const difference = rp.price - squarePrice;
        const percentDiff = squarePrice > 0 
          ? Math.abs((difference / squarePrice) * 100) 
          : 100;
        
        mismatches.push({
          productId: rp.id,
          productName: rp.name,
          sku: rp.sku || '',
          realPrice: rp.price,
          squarePrice: squarePrice,
          difference: difference,
          percentDiff: Math.round(percentDiff * 100) / 100,
        });
      }
    });
    
  } catch (error) {
    console.error('Error getting price mismatches:', error);
  }
  
  return mismatches;
}

/**
 * Syncs prices from real_products to square_products
 * @param apiKey - Admin API key for authentication
 * @param prepareSquarePayloads - If true, generates Square Catalog update payloads
 * @returns SyncResult with status and details
 */
export async function syncPrices(
  apiKey: string,
  prepareSquarePayloads: boolean = false
): Promise<SyncResult> {
  // Validate API key
  if (!validateAdminApiKey(apiKey)) {
    return {
      success: false,
      message: 'Invalid or missing admin API key',
      mismatches: [],
      synced: 0,
      errors: ['Authentication failed'],
    };
  }
  
  const result: SyncResult = {
    success: false,
    message: '',
    mismatches: [],
    synced: 0,
    errors: [],
    squarePayloads: prepareSquarePayloads ? [] : undefined,
  };
  
  try {
    // Get current mismatches
    const mismatches = await getPriceMismatches();
    result.mismatches = mismatches;
    
    if (mismatches.length === 0) {
      result.success = true;
      result.message = 'All prices are already in sync';
      return result;
    }
    
    // Sync each mismatched product
    for (const mismatch of mismatches) {
      try {
        // Update square_products price from real_products
        const { error: updateError } = await supabase
          .from('square_products')
          .update({ 
            price: mismatch.realPrice,
            updated_at: new Date().toISOString(),
          })
          .eq('real_product_id', mismatch.productId);
        
        if (updateError) {
          result.errors.push(
            `Failed to sync ${mismatch.productName}: ${updateError.message}`
          );
          continue;
        }
        
        result.synced++;
        
        // Prepare Square Catalog payload if requested
        if (prepareSquarePayloads && result.squarePayloads) {
          // Note: This only prepares the payload - does NOT call Square API
          // The actual Square API call would require the Square SDK and live credentials
          result.squarePayloads.push({
            type: 'ITEM_VARIATION',
            id: mismatch.productId, // Would need actual Square variation ID
            itemVariationData: {
              name: mismatch.productName,
              pricingType: 'FIXED_PRICING',
              priceMoney: {
                amount: Math.round(mismatch.realPrice * 100), // Convert to cents
                currency: 'USD',
              },
            },
          });
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Error syncing ${mismatch.productName}: ${errorMessage}`);
      }
    }
    
    // Set final status
    result.success = result.errors.length === 0;
    result.message = result.success
      ? `Successfully synced ${result.synced} product prices`
      : `Synced ${result.synced} prices with ${result.errors.length} errors`;
    
    // Add Square sync status note
    if (prepareSquarePayloads && ENABLE_SQUARE_SYNC) {
      result.message += ' (Square payloads prepared but NOT sent - manual upload required)';
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Sync failed: ${errorMessage}`);
    result.message = 'Price sync failed';
  }
  
  return result;
}

/**
 * Validates cart prices against authoritative database prices
 * This is the runtime checkout guard to prevent price drift
 * @param cartItems - Array of cart items with product IDs and prices
 * @returns Validation result with any price discrepancies
 */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartValidationResult {
  valid: boolean;
  message: string;
  discrepancies: Array<{
    productId: string;
    productName: string;
    cartPrice: number;
    dbPrice: number;
    difference: number;
  }>;
}

export async function validateCartPrices(
  cartItems: CartItem[]
): Promise<CartValidationResult> {
  const result: CartValidationResult = {
    valid: true,
    message: 'All prices verified',
    discrepancies: [],
  };
  
  if (cartItems.length === 0) {
    return result;
  }
  
  try {
    // Get product IDs
    const productIds = cartItems.map((item) => item.productId);
    
    // Fetch authoritative prices from square_products (which should be synced)
    const { data: dbProducts, error } = await supabase
      .from('square_products')
      .select('real_product_id, price')
      .in('real_product_id', productIds);
    
    if (error) {
      // On error, fall back to real_products
      const { data: realProducts, error: realError } = await supabase
        .from('real_products')
        .select('id, price')
        .in('id', productIds);
      
      if (realError) {
        result.valid = false;
        result.message = 'Unable to verify prices - please try again';
        return result;
      }
      
      // Build price map from real_products
      const priceMap = new Map<string, number>();
      realProducts?.forEach((p) => priceMap.set(p.id, p.price));
      
      // Check cart prices
      for (const cartItem of cartItems) {
        const dbPrice = priceMap.get(cartItem.productId);
        if (dbPrice !== undefined && Math.abs(dbPrice - cartItem.price) > 0.01) {
          result.valid = false;
          result.discrepancies.push({
            productId: cartItem.productId,
            productName: cartItem.name,
            cartPrice: cartItem.price,
            dbPrice: dbPrice,
            difference: cartItem.price - dbPrice,
          });
        }
      }
      
      return result;
    }
    
    // Build price map from square_products
    const priceMap = new Map<string, number>();
    dbProducts?.forEach((p) => priceMap.set(p.real_product_id, p.price));
    
    // Check each cart item
    for (const cartItem of cartItems) {
      const dbPrice = priceMap.get(cartItem.productId);
      
      // Allow small floating point differences (1 cent tolerance)
      if (dbPrice !== undefined && Math.abs(dbPrice - cartItem.price) > 0.01) {
        result.valid = false;
        result.discrepancies.push({
          productId: cartItem.productId,
          productName: cartItem.name,
          cartPrice: cartItem.price,
          dbPrice: dbPrice,
          difference: cartItem.price - dbPrice,
        });
      }
    }
    
    if (!result.valid) {
      result.message = `Price mismatch detected for ${result.discrepancies.length} item(s). Please refresh your cart.`;
    }
    
  } catch (error) {
    console.error('Error validating cart prices:', error);
    result.valid = false;
    result.message = 'Unable to verify prices - please contact support';
  }
  
  return result;
}

export default {
  validateAdminApiKey,
  getPriceMismatches,
  syncPrices,
  validateCartPrices,
};
