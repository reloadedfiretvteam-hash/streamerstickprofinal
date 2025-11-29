/**
 * Image Validation and Health Check Utilities for Supabase Storage
 * 
 * This module provides utilities for:
 * - Validating image files before upload
 * - Checking for corrupted or blank files
 * - Case-insensitive product-image matching
 * - Image health checking
 */

import { supabase } from '../lib/supabase';

// Minimum valid image size in bytes (20 bytes is placeholder/blank)
const MIN_VALID_IMAGE_SIZE = 100;

// Maximum image size in bytes (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Valid MIME types for product images
const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileSize: number;
  detectedType: string | null;
}

export interface ImageHealthCheckResult {
  url: string;
  productId: string;
  productName: string;
  isHealthy: boolean;
  statusCode: number | null;
  contentType: string | null;
  contentLength: number | null;
  error: string | null;
}

export interface ProductImageMatch {
  productId: string;
  productName: string;
  imageUrl: string;
  matchConfidence: 'exact' | 'case-insensitive' | 'fuzzy' | 'none';
}

/**
 * Validate image file before upload
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let detectedType: string | null = null;

  // Check file size
  if (file.size < MIN_VALID_IMAGE_SIZE) {
    errors.push(`File is too small (${file.size} bytes). Minimum size is ${MIN_VALID_IMAGE_SIZE} bytes. This may be a corrupted or blank placeholder file.`);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    errors.push(`File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024} MB.`);
  }

  // Check MIME type
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Allowed types: ${VALID_IMAGE_TYPES.join(', ')}`);
  }

  // Read first bytes to verify image format
  try {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    detectedType = detectImageType(bytes);
    
    if (!detectedType) {
      errors.push('Unable to detect valid image format from file header. File may be corrupted.');
    } else if (file.type && !file.type.includes(detectedType)) {
      warnings.push(`File extension suggests ${file.type} but detected format is ${detectedType}`);
    }
  } catch (error) {
    warnings.push('Unable to verify file format from header bytes');
  }

  // Check for blank/empty content (multiple null bytes at start)
  try {
    const buffer = await file.slice(0, 20).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const nullCount = bytes.filter(b => b === 0).length;
    
    if (nullCount > 15) {
      errors.push('File appears to be blank or contain mostly null bytes. This is likely a placeholder file.');
    }
  } catch {
    // Ignore errors in this check
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileSize: file.size,
    detectedType,
  };
}

/**
 * Detect image type from magic bytes
 */
function detectImageType(bytes: Uint8Array): string | null {
  // Check JPEG
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return 'jpeg';
  }
  
  // Check PNG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return 'png';
  }
  
  // Check GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'gif';
  }
  
  // Check WebP (RIFF....WEBP)
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return 'webp';
    }
  }

  return null;
}

/**
 * Upload image with validation
 */
export async function uploadValidatedImage(
  file: File,
  productId: string,
  bucket: string = 'product-images'
): Promise<{ success: boolean; url?: string; error?: string; validation: ImageValidationResult }> {
  // Validate first
  const validation = await validateImageFile(file);
  
  if (!validation.isValid) {
    console.error('[IMAGE_UPLOAD] Validation failed:', validation.errors);
    return {
      success: false,
      error: validation.errors.join('; '),
      validation,
    };
  }

  // Log warnings
  if (validation.warnings.length > 0) {
    console.warn('[IMAGE_UPLOAD] Warnings:', validation.warnings);
  }

  // Generate filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = fileName;

  console.log(`[IMAGE_UPLOAD] Uploading ${fileName} (${(file.size / 1024).toFixed(2)} KB)`);

  // Upload to Supabase storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    console.error('[IMAGE_UPLOAD] Upload failed:', uploadError);
    return {
      success: false,
      error: uploadError.message,
      validation,
    };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  console.log(`[IMAGE_UPLOAD] Success: ${publicUrl}`);

  return {
    success: true,
    url: publicUrl,
    validation,
  };
}

/**
 * Check health of an image URL
 */
export async function checkImageHealth(url: string): Promise<{
  isHealthy: boolean;
  statusCode: number | null;
  contentType: string | null;
  contentLength: number | null;
  error: string | null;
}> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const lengthNum = contentLength ? parseInt(contentLength, 10) : null;

    // Check if response is OK
    if (!response.ok) {
      return {
        isHealthy: false,
        statusCode: response.status,
        contentType,
        contentLength: lengthNum,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Check if content type is an image
    if (!contentType || !contentType.startsWith('image/')) {
      return {
        isHealthy: false,
        statusCode: response.status,
        contentType,
        contentLength: lengthNum,
        error: `Invalid content type: ${contentType}`,
      };
    }

    // Check if file is too small (potential placeholder)
    if (lengthNum !== null && lengthNum < MIN_VALID_IMAGE_SIZE) {
      return {
        isHealthy: false,
        statusCode: response.status,
        contentType,
        contentLength: lengthNum,
        error: `File too small (${lengthNum} bytes). May be corrupted or placeholder.`,
      };
    }

    return {
      isHealthy: true,
      statusCode: response.status,
      contentType,
      contentLength: lengthNum,
      error: null,
    };
  } catch (error) {
    return {
      isHealthy: false,
      statusCode: null,
      contentType: null,
      contentLength: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check health of all product images
 */
export async function checkAllProductImageHealth(): Promise<ImageHealthCheckResult[]> {
  console.log('[IMAGE_HEALTH] Starting product image health check...');
  
  const results: ImageHealthCheckResult[] = [];

  // Get all products with images
  const { data: products, error } = await supabase
    .from('products_full')
    .select('id, name, image_url');

  if (error) {
    console.error('[IMAGE_HEALTH] Error fetching products:', error);
    return results;
  }

  if (!products || products.length === 0) {
    console.log('[IMAGE_HEALTH] No products found');
    return results;
  }

  console.log(`[IMAGE_HEALTH] Checking ${products.length} products...`);

  for (const product of products) {
    if (!product.image_url) {
      results.push({
        url: '',
        productId: product.id,
        productName: product.name,
        isHealthy: false,
        statusCode: null,
        contentType: null,
        contentLength: null,
        error: 'No image URL set',
      });
      continue;
    }

    const health = await checkImageHealth(product.image_url);
    results.push({
      url: product.image_url,
      productId: product.id,
      productName: product.name,
      ...health,
    });

    if (!health.isHealthy) {
      console.warn(`[IMAGE_HEALTH] Unhealthy image for ${product.name}: ${health.error}`);
    }
  }

  const healthyCount = results.filter(r => r.isHealthy).length;
  const unhealthyCount = results.length - healthyCount;
  console.log(`[IMAGE_HEALTH] Complete: ${healthyCount} healthy, ${unhealthyCount} unhealthy`);

  return results;
}

/**
 * Match product name to image URL with case-insensitivity
 */
export function matchProductToImage(
  productName: string,
  productId: string,
  availableImageUrls: string[]
): ProductImageMatch {
  const normalizedProductName = productName.toLowerCase().trim();
  const productSlug = normalizedProductName.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  
  // Try exact match first
  for (const url of availableImageUrls) {
    const fileName = url.split('/').pop()?.toLowerCase() || '';
    if (fileName.includes(productId.toLowerCase())) {
      return {
        productId,
        productName,
        imageUrl: url,
        matchConfidence: 'exact',
      };
    }
  }

  // Try case-insensitive match on product name
  for (const url of availableImageUrls) {
    const fileName = url.split('/').pop()?.toLowerCase() || '';
    if (fileName.includes(normalizedProductName) || fileName.includes(productSlug)) {
      return {
        productId,
        productName,
        imageUrl: url,
        matchConfidence: 'case-insensitive',
      };
    }
  }

  // Try fuzzy match (words from product name)
  const productWords = normalizedProductName.split(/\s+/).filter(w => w.length > 3);
  for (const url of availableImageUrls) {
    const fileName = url.split('/').pop()?.toLowerCase() || '';
    const matchingWords = productWords.filter(word => fileName.includes(word));
    if (matchingWords.length >= Math.ceil(productWords.length / 2)) {
      return {
        productId,
        productName,
        imageUrl: url,
        matchConfidence: 'fuzzy',
      };
    }
  }

  return {
    productId,
    productName,
    imageUrl: '',
    matchConfidence: 'none',
  };
}

/**
 * List all files in the product images bucket
 */
export async function listProductImages(bucket: string = 'product-images'): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list();

  if (error) {
    console.error('[IMAGE_LIST] Error listing images:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  // Get public URLs for all files
  return data.map(file => {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(file.name);
    return publicUrl;
  });
}

/**
 * Find and return orphaned images (images not associated with any product)
 */
export async function findOrphanedImages(): Promise<string[]> {
  // Get all storage images
  const allImages = await listProductImages();
  
  // Get all product image URLs
  const { data: products } = await supabase
    .from('products_full')
    .select('image_url');

  const { data: productImages } = await supabase
    .from('product_images')
    .select('image_url');

  // Combine all used image URLs
  const usedUrls = new Set<string>();
  products?.forEach(p => p.image_url && usedUrls.add(p.image_url));
  productImages?.forEach(p => p.image_url && usedUrls.add(p.image_url));

  // Find orphaned images
  return allImages.filter(url => !usedUrls.has(url));
}

/**
 * Remove corrupted or blank images from storage
 */
export async function removeCorruptedImages(
  bucket: string = 'product-images',
  dryRun: boolean = true
): Promise<{ removed: string[]; errors: string[] }> {
  console.log(`[IMAGE_CLEANUP] Starting ${dryRun ? 'dry run' : 'cleanup'}...`);
  
  const removed: string[] = [];
  const errors: string[] = [];

  // List all files
  const { data: files, error } = await supabase.storage
    .from(bucket)
    .list();

  if (error || !files) {
    console.error('[IMAGE_CLEANUP] Error listing files:', error);
    return { removed, errors: ['Failed to list files'] };
  }

  for (const file of files) {
    // Check if file is too small
    if (file.metadata?.size && file.metadata.size < MIN_VALID_IMAGE_SIZE) {
      console.log(`[IMAGE_CLEANUP] Found small file: ${file.name} (${file.metadata.size} bytes)`);
      
      if (!dryRun) {
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([file.name]);

        if (deleteError) {
          errors.push(`Failed to delete ${file.name}: ${deleteError.message}`);
        } else {
          removed.push(file.name);
        }
      } else {
        removed.push(file.name);
      }
    }
  }

  console.log(`[IMAGE_CLEANUP] ${dryRun ? 'Would remove' : 'Removed'} ${removed.length} files`);
  return { removed, errors };
}

/**
 * Log image operation for debugging
 */
export function logImageOperation(
  operation: 'upload' | 'delete' | 'validate' | 'health_check',
  details: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    ...details,
  };
  
  console.log(`[IMAGE_${operation.toUpperCase()}]`, JSON.stringify(logEntry));
  
  // Also store in localStorage for debugging (limited to recent 100 entries)
  try {
    const logs = JSON.parse(localStorage.getItem('image_operation_logs') || '[]');
    logs.unshift(logEntry);
    if (logs.length > 100) {
      logs.pop();
    }
    localStorage.setItem('image_operation_logs', JSON.stringify(logs));
  } catch {
    // Ignore localStorage errors
  }
}
