import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Don't crash the whole app if env vars are missing.
// The main marketing site should still render; Supabase‑powered
// features (analytics/admin) will just be disabled until configured.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. ' +
      'Main site will load, but analytics/admin features are disabled.',
  );
}

// Use a safe fallback so createClient always returns something.
// When real env vars are set, those will be used automatically.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'public-anon-key-placeholder',
);

/**
 * Interface for pricing plans stored in Supabase
 */
export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  period?: string;
  features: string[];
  popular?: boolean;
  active: boolean;
  display_order?: number;
}

/**
 * Common bucket name typo mappings.
 * Maps commonly misspelled bucket names to canonical versions.
 */
const BUCKET_NAME_MAPPINGS: Record<string, string> = {
  'imiges': 'images',    // Common typo: 'imiges' -> 'images'
  'imagees': 'images',   // Common typo: 'imagees' -> 'images'
  'imags': 'images',     // Common typo: 'imags' -> 'images'
  'image': 'images',     // Singular -> plural
};

/**
 * Normalize bucket name by applying typo corrections.
 * @param bucket - The bucket name to normalize
 * @returns The normalized bucket name
 */
function normalizeBucketName(bucket: string): string {
  const lowerBucket = bucket.toLowerCase();
  
  // Check if there's a mapping for this bucket name
  if (lowerBucket in BUCKET_NAME_MAPPINGS) {
    const normalized = BUCKET_NAME_MAPPINGS[lowerBucket];
    // Only log in development to avoid performance impact in production
    if (import.meta.env.DEV) {
      console.debug(
        `[getStorageUrl] Bucket name normalized: '${bucket}' -> '${normalized}'`
      );
    }
    return normalized;
  }
  
  return bucket;
}

/**
 * Get the public URL for a file in Supabase Storage
 * 
 * Features:
 * - Normalizes common bucket name typos (e.g., 'imiges' -> 'images')
 * - Supports VITE_STORAGE_BUCKET_NAME override
 * - URL-encodes file paths for special characters
 * - Strips leading slashes from paths
 * - Returns placeholder image when Supabase is not configured
 * 
 * @param bucket - The storage bucket name (e.g., 'images', 'product-images')
 * @param path - The file path within the bucket
 * @returns The full public URL to the file
 */
export function getStorageUrl(bucket: string, path: string): string {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    // Return a placeholder image if Supabase is not configured
    return 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  
  // Allow override of bucket name via environment variable
  // This supports cases where images are in 'imiges', 'product-images', or other bucket names
  const bucketOverride = import.meta.env.VITE_STORAGE_BUCKET_NAME;
  
  // Determine actual bucket: use override if set, otherwise normalize the provided bucket
  let actualBucket: string;
  if (bucketOverride) {
    actualBucket = normalizeBucketName(bucketOverride);
  } else {
    actualBucket = normalizeBucketName(bucket);
  }
  
  // Strip leading slashes from path
  let cleanPath = path;
  while (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  
  // URL-encode the file path (handles spaces, special characters)
  // We encode each path segment separately to preserve directory structure
  const encodedPath = cleanPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  
  return `${supabaseUrl}/storage/v1/object/public/${actualBucket}/${encodedPath}`;
}
