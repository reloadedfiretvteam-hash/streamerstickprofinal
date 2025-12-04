/**
 * Centralized Storage Configuration
 * 
 * This module provides a centralized way to manage Supabase storage bucket names
 * and image file fallbacks across the application.
 */

/**
 * Default storage bucket name
 * Can be overridden via VITE_STORAGE_BUCKET_NAME environment variable
 */
export const STORAGE_BUCKET = 'super-bass';

/**
 * Hero image filename candidates for fallback attempts
 * Tried in order when hero image fails to load
 */
export const HERO_FILENAME_CANDIDATES = [
  'hero-firestick-breakout.jpg',
  'hero-firestick.jpg',
  'hero-image.jpg',
  'hero.jpg',
  'firestick-hero.jpg',
  'main-hero.jpg',
];

/**
 * Get the storage bucket name from environment or use default
 * @returns The bucket name to use for Supabase storage
 */
export function getBucketName(): string {
  return import.meta.env.VITE_STORAGE_BUCKET_NAME || STORAGE_BUCKET;
}

/**
 * Get full storage URL for a file in the bucket
 * @param supabaseUrl - The Supabase project URL
 * @param fileName - The file name within the bucket
 * @returns Full URL to the file in storage
 */
export function getStorageFileUrl(supabaseUrl: string, fileName: string): string {
  const bucket = getBucketName();
  const cleanPath = fileName.startsWith('/') ? fileName.slice(1) : fileName;
  const encodedPath = encodeURIComponent(cleanPath);
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodedPath}`;
}
