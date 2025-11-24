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
 * Get the public URL for a file in Supabase Storage
 * @param bucket - The storage bucket name (e.g., 'images', 'product-images')
 * @param path - The file path within the bucket
 * @returns The full public URL to the file
 */
export function getStorageUrl(bucket: string, path: string): string {
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
    // Return a placeholder image if Supabase is not configured
    return 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  
  // Ensure path doesn't start with a slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
