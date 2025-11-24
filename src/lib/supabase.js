import { createClient } from '@supabase/supabase-js'

// Use the same safe pattern as the TypeScript client so the site
// does NOT crash if env vars are missing in the browser build.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase environment variables are missing. ' +
      'Main site will load, but Supabase-powered features may be disabled.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'public-anon-key-placeholder'
)

/**
 * Get the public URL for a file in Supabase Storage
 * @param {string} bucket - The storage bucket name (e.g., 'images', 'product-images', 'imiges')
 * @param {string} path - The file path within the bucket
 * @returns {string} The full public URL to the file
 */
export function getStorageUrl(bucket, path) {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    // Return a placeholder image if Supabase is not configured
    return 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
  
  // Allow override of bucket name via environment variable
  // This supports cases where images are in 'imiges', 'product-images', or other bucket names
  const bucketOverride = import.meta.env.VITE_STORAGE_BUCKET_NAME
  const actualBucket = bucketOverride || bucket
  
  // Ensure path doesn't start with a slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  return `${supabaseUrl}/storage/v1/object/public/${actualBucket}/${cleanPath}`
}
