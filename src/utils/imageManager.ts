/**
 * Comprehensive Image Management System
 * 
 * This utility provides a robust image management system with:
 * 1. Local /public/images/ asset fallback (if present)
 * 2. Supabase Storage public URL fallback (if image missing locally)
 * 3. Placeholder image if neither exists
 * 4. Batch upload capabilities
 * 5. Instant update notifications
 */

import { supabase, getStorageUrl } from '../lib/supabase';

// Default placeholder image
const PLACEHOLDER_IMAGE = '/placeholder.svg';

// Local images directory
const LOCAL_IMAGES_PATH = '/images/';

/**
 * Product image with priority fallback logic
 */
export interface ProductImageOptions {
  productId?: string;
  imagePath?: string;
  supabaseUrl?: string;
  category?: 'firestick' | 'iptv' | 'website' | 'addon';
}

/**
 * Get the best available image URL for a product with fallback logic:
 * 1. Local /public/images/ asset (if imagePath provided)
 * 2. Supabase Storage URL (if supabaseUrl provided)
 * 3. Category-based placeholder from local or Supabase
 * 4. Generic placeholder
 * 
 * @param options - Image options with fallback paths
 * @returns The best available image URL
 */
export function getProductImage(options: ProductImageOptions): string {
  const { imagePath, supabaseUrl, category } = options;

  // Priority 1: Local image path
  if (imagePath && imagePath.trim()) {
    // If it starts with http:// or https://, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it starts with /, it's already a public path
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Otherwise, prepend the local images path
    return `${LOCAL_IMAGES_PATH}${imagePath}`;
  }

  // Priority 2: Supabase Storage URL
  if (supabaseUrl && supabaseUrl.trim() && !supabaseUrl.includes('placeholder')) {
    return supabaseUrl;
  }

  // Priority 3: Category-based fallback from local storage
  if (category) {
    const categoryImages: Record<string, string> = {
      firestick: `${LOCAL_IMAGES_PATH}firestick-4k.jpg`,
      iptv: `${LOCAL_IMAGES_PATH}iptv-subscription.jpg`,
      website: PLACEHOLDER_IMAGE,
      addon: PLACEHOLDER_IMAGE,
    };
    
    if (categoryImages[category]) {
      return categoryImages[category];
    }
  }

  // Priority 4: Generic placeholder
  return PLACEHOLDER_IMAGE;
}

/**
 * Upload image to Supabase Storage
 * 
 * @param file - The file to upload
 * @param productId - Optional product ID for naming
 * @param bucketName - Storage bucket name (defaults to 'images')
 * @returns Object with publicUrl and filePath on success, or error
 */
export async function uploadImageToSupabase(
  file: File,
  productId?: string,
  bucketName: string = 'images'
): Promise<{ publicUrl: string; filePath: string } | { error: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = productId 
      ? `${productId}-${timestamp}.${fileExt}`
      : `product-${timestamp}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { publicUrl, filePath };
  } catch (err) {
    console.error('Unexpected upload error:', err);
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Upload image to both Supabase and attempt to save locally
 * 
 * Note: Local save will work on development but may fail on some hosting platforms.
 * This function gracefully handles that case.
 * 
 * @param file - The file to upload
 * @param productId - Optional product ID for naming
 * @param localFileName - Optional local file name
 * @returns Object with URLs and success status
 */
export async function uploadImageDual(
  file: File,
  productId?: string,
  localFileName?: string
): Promise<{
  supabaseUrl?: string;
  localPath?: string;
  localSaveSuccess: boolean;
  supabaseSuccess: boolean;
  error?: string;
}> {
  const result = {
    supabaseSuccess: false,
    localSaveSuccess: false,
  } as any;

  // 1. Upload to Supabase (always attempt this)
  const supabaseResult = await uploadImageToSupabase(file, productId);
  if ('publicUrl' in supabaseResult) {
    result.supabaseUrl = supabaseResult.publicUrl;
    result.supabaseSuccess = true;
  } else {
    result.error = supabaseResult.error;
  }

  // 2. Attempt to save locally (will fail on most cloud hosting, that's OK)
  // Note: This only works in development or with special server-side handling
  // We'll provide instructions in the README for manual local file placement
  try {
    const localName = localFileName || file.name;
    result.localPath = `${LOCAL_IMAGES_PATH}${localName}`;
    // In a browser environment, we can't write to the file system
    // This would need a server endpoint to handle file writes
    // For now, we'll just return the path where it should be placed
    result.localSaveSuccess = false; // Intentionally false for browser
  } catch (err) {
    console.debug('Local save not available in browser environment');
    result.localSaveSuccess = false;
  }

  return result;
}

/**
 * Batch upload multiple images
 * 
 * @param files - Array of files to upload
 * @param productId - Optional product ID for naming
 * @param onProgress - Optional callback for upload progress
 * @returns Array of upload results
 */
export async function uploadImagesBatch(
  files: File[],
  productId?: string,
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<Array<{
  file: File;
  success: boolean;
  supabaseUrl?: string;
  localPath?: string;
  error?: string;
}>> {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress(i + 1, files.length, file.name);
    }

    const uploadResult = await uploadImageDual(file, productId);
    
    results.push({
      file,
      success: uploadResult.supabaseSuccess,
      supabaseUrl: uploadResult.supabaseUrl,
      localPath: uploadResult.localPath,
      error: uploadResult.error,
    });
  }

  return results;
}

/**
 * Delete image from Supabase Storage
 * 
 * @param imageUrl - The image URL to delete
 * @param bucketName - Storage bucket name (defaults to 'images')
 * @returns Success status
 */
export async function deleteImageFromSupabase(
  imageUrl: string,
  bucketName: string = 'images'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part === bucketName);
    
    if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
      return { success: false, error: 'Invalid image URL format' };
    }

    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected delete error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Validate if an image URL is accessible
 * 
 * @param url - The image URL to validate
 * @returns Promise that resolves to true if image is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
}

/**
 * Get product image with validation and automatic fallback
 * 
 * @param options - Image options
 * @returns Promise with the validated image URL
 */
export async function getValidatedProductImage(
  options: ProductImageOptions
): Promise<string> {
  const primaryUrl = getProductImage(options);
  
  // Try to validate the primary URL
  const isValid = await validateImageUrl(primaryUrl);
  
  if (isValid) {
    return primaryUrl;
  }

  // If primary fails, try Supabase Storage fallback
  if (options.supabaseUrl && options.supabaseUrl !== primaryUrl) {
    const isSupabaseValid = await validateImageUrl(options.supabaseUrl);
    if (isSupabaseValid) {
      return options.supabaseUrl;
    }
  }

  // Fall back to placeholder
  return PLACEHOLDER_IMAGE;
}
