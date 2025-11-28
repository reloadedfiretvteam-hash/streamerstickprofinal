/**
 * Supabase Product Image URL Updater
 * 
 * This script updates the `main_image` field for all products in the `real_products`
 * table to use the correct public URLs from the Supabase `product-images` bucket.
 * 
 * ## Requirements
 * - Node.js 18+
 * - @supabase/supabase-js package
 * 
 * ## Setup
 * 1. Copy `.env.example` to `.env` in this directory (or project root)
 * 2. Fill in your Supabase credentials:
 *    - SUPABASE_URL: Your Supabase project URL (e.g., https://xxxxx.supabase.co)
 *    - SUPABASE_SERVICE_ROLE_KEY: Your service role key (NOT the anon key)
 * 
 * ## Running the Script
 * ```bash
 * cd scripts
 * npm install @supabase/supabase-js dotenv
 * node update_images.js
 * ```
 * 
 * ## What This Script Does
 * 1. Connects to your Supabase database using the service role key
 * 2. Fetches all products from the `real_products` table
 * 3. Maps each product to the correct image filename based on product name
 * 4. Constructs full Supabase Storage public URLs for the `product-images` bucket
 * 5. Updates each product's `main_image` field with the correct URL
 * 
 * ## Image Mapping
 * - Fire Stick HD → H_FireStick.png
 * - Fire Stick 4K → FireStick_4K.png
 * - Fire Stick 4K Max → FireStick_4KMax.png
 * - IPTV Subscription (all durations) → IPTV_4K_Blue.png
 * - Free Trial → IPTV_4K_Blue.png
 * 
 * Note: Only IPTV Subscription and Free Trial products use IPTV_4K_Blue.png.
 * All other products are matched by name to their respective image files.
 * 
 * ## Environment Variables
 * See .env.example in this directory for required configuration.
 */

// Load environment variables from .env file
// Try both current directory and parent directory
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from scripts directory first, then fallback to project root
config({ path: resolve(__dirname, '.env') });
config({ path: resolve(__dirname, '..', '.env') });

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Storage bucket name for product images
const BUCKET_NAME = 'product-images';

// Product name to image filename mapping
// These filenames should match exactly what's uploaded in Supabase Storage
const IMAGE_MAPPING = {
  // Fire Stick devices
  'fire stick hd': 'H_FireStick.png',
  'fire stick 4k max': 'FireStick_4KMax.png',
  'fire stick 4k': 'FireStick_4K.png',
  'fire stick max': 'FireStick_4KMax.png',
  
  // IPTV subscriptions - all use the same 4K blue image
  'iptv subscription': 'IPTV_4K_Blue.png',
  '1 month iptv': 'IPTV_4K_Blue.png',
  '3 month iptv': 'IPTV_4K_Blue.png',
  '6 month iptv': 'IPTV_4K_Blue.png',
  '12 month iptv': 'IPTV_4K_Blue.png',
  '1 year iptv': 'IPTV_4K_Blue.png',
  
  // Free Trial - uses same image as IPTV
  'free trial': 'IPTV_4K_Blue.png',
};

/**
 * Validates that required environment variables are set
 */
function validateEnvironment() {
  if (!SUPABASE_URL) {
    console.error('❌ Error: SUPABASE_URL environment variable is not set.');
    console.error('   Please create a .env file with your Supabase configuration.');
    console.error('   See .env.example for the required format.');
    process.exit(1);
  }
  
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.');
    console.error('   Please create a .env file with your Supabase configuration.');
    console.error('   See .env.example for the required format.');
    console.error('');
    console.error('   Note: Use the SERVICE ROLE KEY, not the anon key.');
    console.error('   Find it in: Supabase Dashboard > Project Settings > API > service_role');
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
  console.log(`   Supabase URL: ${SUPABASE_URL}`);
  console.log(`   Bucket: ${BUCKET_NAME}`);
}

/**
 * Creates a Supabase client with admin privileges
 */
function createSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Constructs the public URL for an image in Supabase Storage
 * @param {string} filename - The image filename
 * @returns {string} The full public URL
 */
function getImageUrl(filename) {
  // URL encode the filename to handle special characters
  const encodedFilename = encodeURIComponent(filename);
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${encodedFilename}`;
}

/**
 * Finds the best matching image filename for a product name
 * @param {string} productName - The product name to match
 * @returns {string|null} The matching image filename or null
 */
function findMatchingImage(productName) {
  const normalizedName = productName.toLowerCase().trim();
  
  // Check for exact matches first (most specific)
  // Order matters: check "4k max" before "4k" to avoid false matches
  const orderedKeys = [
    'fire stick 4k max',
    'fire stick max',
    'fire stick 4k',
    'fire stick hd',
    'free trial',
    '12 month iptv',
    '1 year iptv',
    '6 month iptv',
    '3 month iptv',
    '1 month iptv',
    'iptv subscription',
  ];
  
  for (const key of orderedKeys) {
    if (normalizedName.includes(key)) {
      return IMAGE_MAPPING[key];
    }
  }
  
  // Special case: any product with "iptv" in the name gets the IPTV image
  // (but NOT Fire Sticks with IPTV bundled)
  if (normalizedName.includes('iptv') && !normalizedName.includes('fire stick')) {
    return IMAGE_MAPPING['iptv subscription'];
  }
  
  // Special case: any subscription-only product gets IPTV image
  if (normalizedName.includes('subscription') && !normalizedName.includes('fire stick')) {
    return IMAGE_MAPPING['iptv subscription'];
  }
  
  // No match found
  return null;
}

/**
 * Main function to update all product images
 */
async function updateProductImages() {
  console.log('\n🚀 Starting Product Image URL Update\n');
  console.log('='.repeat(60));
  
  // Validate environment
  validateEnvironment();
  
  // Create Supabase client
  const supabase = createSupabaseClient();
  console.log('\n✅ Supabase client created\n');
  
  // Fetch all products
  console.log('📦 Fetching products from real_products table...');
  const { data: products, error: fetchError } = await supabase
    .from('real_products')
    .select('id, name, main_image, slug, sku');
  
  if (fetchError) {
    console.error('❌ Error fetching products:', fetchError.message);
    process.exit(1);
  }
  
  if (!products || products.length === 0) {
    console.log('⚠️  No products found in real_products table.');
    process.exit(0);
  }
  
  console.log(`✅ Found ${products.length} products\n`);
  console.log('='.repeat(60));
  console.log('\n📸 Processing product images...\n');
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const product of products) {
    const imageFilename = findMatchingImage(product.name);
    
    if (!imageFilename) {
      console.log(`⚠️  [SKIPPED] ${product.name}`);
      console.log(`   No image mapping found for this product name.`);
      console.log('');
      skipped++;
      continue;
    }
    
    const newImageUrl = getImageUrl(imageFilename);
    
    // Check if update is needed
    if (product.main_image === newImageUrl) {
      console.log(`✓  [NO CHANGE] ${product.name}`);
      console.log(`   Already has correct URL: ${imageFilename}`);
      console.log('');
      skipped++;
      continue;
    }
    
    // Update the product
    const { error: updateError } = await supabase
      .from('real_products')
      .update({ main_image: newImageUrl })
      .eq('id', product.id);
    
    if (updateError) {
      console.error(`❌ [FAILED] ${product.name}`);
      console.error(`   Error: ${updateError.message}`);
      console.log('');
      failed++;
      continue;
    }
    
    console.log(`✅ [UPDATED] ${product.name}`);
    console.log(`   Old: ${product.main_image || '(empty)'}`);
    console.log(`   New: ${newImageUrl}`);
    console.log('');
    updated++;
  }
  
  // Summary
  console.log('='.repeat(60));
  console.log('\n📊 Summary\n');
  console.log(`   Total products:  ${products.length}`);
  console.log(`   Updated:         ${updated}`);
  console.log(`   Skipped:         ${skipped}`);
  console.log(`   Failed:          ${failed}`);
  console.log('');
  
  if (failed > 0) {
    console.log('⚠️  Some updates failed. Check the errors above.');
    process.exit(1);
  }
  
  console.log('✅ Product image update complete!\n');
}

// Run the script
updateProductImages().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
