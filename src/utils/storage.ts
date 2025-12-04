/**
 * Centralized storage bucket configuration and utilities.
 * 
 * This module provides consistent bucket naming and hero image fallback logic
 * across the application to handle storage bucket variations and image loading failures.
 */

/**
 * Default storage bucket name.
 * This constant serves as the primary fallback when no environment variable is set.
 */
export const STORAGE_BUCKET = 'super-bass';

/**
 * Get the storage bucket name from environment or use default.
 * 
 * Priority:
 * 1. VITE_STORAGE_BUCKET_NAME environment variable
 * 2. STORAGE_BUCKET constant ('super-bass')
 * 
 * @returns The bucket name to use for storage operations
 */
export function getBucketName(): string {
  return import.meta.env.VITE_STORAGE_BUCKET_NAME || STORAGE_BUCKET;
}

/**
 * Common hero image filename candidates for fallback logic.
 * These filenames are tried in order when loading the hero image.
 * 
 * Usage: Loop through these candidates and attempt to load each one
 * until a successful load occurs.
 */
export const HERO_FILENAME_CANDIDATES = [
  'hero-firestick-breakout.jpg',
  'hero-image.jpg',
  'hero.jpg',
  'hero-firestick.jpg',
  'firestick-hero.jpg',
  'main-hero.jpg'
];
