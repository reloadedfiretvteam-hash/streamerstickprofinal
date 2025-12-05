import { useState, useEffect } from 'react';
import { supabase, getStorageUrl } from '../lib/supabase';

/**
 * Supported image formats (excluding videos)
 */
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];

/**
 * Video formats to exclude
 */
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv'];

/**
 * Check if a filename is an image (not a video)
 */
function isImageFile(filename: string): boolean {
  const lowerFilename = filename.toLowerCase();
  
  // Exclude videos
  if (VIDEO_EXTENSIONS.some(ext => lowerFilename.endsWith(ext))) {
    return false;
  }
  
  // Include images
  if (IMAGE_EXTENSIONS.some(ext => lowerFilename.endsWith(ext))) {
    return true;
  }
  
  // If no extension or unknown extension, assume it's not an image
  return false;
}

/**
 * Fuzzy match a filename against a pattern
 * Handles variations like:
 * - "Fire Stick" -> "firestick", "fire-stick", "fire stick"
 * - "IPTV subscription" -> "iptv-subscription", "iptvsubscription", "iptv subscription"
 */
function fuzzyMatch(filename: string, pattern: string): boolean {
  const normalizeString = (str: string) => 
    str.toLowerCase()
       .replace(/[-_\s]/g, '') // Remove hyphens, underscores, spaces
       .replace(/[^a-z0-9]/g, ''); // Remove special characters
  
  const normalizedFilename = normalizeString(filename);
  const normalizedPattern = normalizeString(pattern);
  
  return normalizedFilename.includes(normalizedPattern);
}

/**
 * Categorize images by type
 */
export interface CategorizedImages {
  hero: string | null;
  fireStickProducts: string[];
  iptvSubscription: string[];
  sports: {
    football: string[];
    baseball: string[];
    basketball: string[];
    ufc: string[];
    general: string[];
  };
  all: string[];
}

/**
 * Hook to fetch and categorize images from Supabase Storage
 * @param bucketName - The name of the storage bucket (defaults to 'images')
 * @returns Categorized images and loading state
 */
export function useSupabaseImages(bucketName: string = 'images') {
  const [images, setImages] = useState<CategorizedImages>({
    hero: null,
    fireStickProducts: [],
    iptvSubscription: [],
    sports: {
      football: [],
      baseball: [],
      basketball: [],
      ufc: [],
      general: [],
    },
    all: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAndCategorizeImages();
  }, [bucketName]);

  const fetchAndCategorizeImages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
        if (import.meta.env.DEV) {
          console.warn('[useSupabaseImages] Supabase not configured, skipping image fetch');
        }
        setLoading(false);
        return;
      }

      // List all files in the storage bucket
      const { data: files, error: listError } = await supabase
        .storage
        .from(bucketName)
        .list('', {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (listError) {
        console.error('[useSupabaseImages] Error listing files:', listError);
        setError(listError.message);
        setLoading(false);
        return;
      }

      if (!files || files.length === 0) {
        if (import.meta.env.DEV) {
          console.warn('[useSupabaseImages] No files found in bucket:', bucketName);
        }
        setLoading(false);
        return;
      }

      // Filter to only image files (exclude videos)
      const imageFiles = files.filter(file => isImageFile(file.name));

      if (import.meta.env.DEV) {
        console.log(`[useSupabaseImages] Found ${imageFiles.length} images (${files.length} total files)`);
      }

      // Categorize images
      const categorized: CategorizedImages = {
        hero: null,
        fireStickProducts: [],
        iptvSubscription: [],
        sports: {
          football: [],
          baseball: [],
          basketball: [],
          ufc: [],
          general: [],
        },
        all: [],
      };

      for (const file of imageFiles) {
        const filename = file.name;
        const url = getStorageUrl(bucketName, filename);
        
        // Add to all images
        categorized.all.push(url);

        // Hero image (contains 'hero')
        if (!categorized.hero && fuzzyMatch(filename, 'hero')) {
          categorized.hero = url;
          if (import.meta.env.DEV) {
            console.log(`[useSupabaseImages] Hero image found: ${filename}`);
          }
        }

        // Fire Stick products (contains 'fire stick', 'firestick', etc.)
        if (fuzzyMatch(filename, 'firestick') || fuzzyMatch(filename, 'fire stick')) {
          categorized.fireStickProducts.push(url);
          if (import.meta.env.DEV) {
            console.log(`[useSupabaseImages] Fire Stick image found: ${filename}`);
          }
        }

        // IPTV subscription (contains 'iptv' + 'subscription')
        if (fuzzyMatch(filename, 'iptv') && fuzzyMatch(filename, 'subscription')) {
          categorized.iptvSubscription.push(url);
          if (import.meta.env.DEV) {
            console.log(`[useSupabaseImages] IPTV subscription image found: ${filename}`);
          }
        }

        // Sports images
        if (fuzzyMatch(filename, 'nfl') || fuzzyMatch(filename, 'football')) {
          categorized.sports.football.push(url);
          if (import.meta.env.DEV) {
            console.log(`[useSupabaseImages] Football image found: ${filename}`);
          }
        }
        
        if (fuzzyMatch(filename, 'mlb') || fuzzyMatch(filename, 'baseball')) {
          categorized.sports.baseball.push(url);
          if (import.meta.env.DEV) {
            console.log(`[useSupabaseImages] Baseball image found: ${filename}`);
          }
        }
        
        if (fuzzyMatch(filename, 'nba') || fuzzyMatch(filename, 'basketball')) {
          categorized.sports.basketball.push(url);
          if (import.meta.env.DEV) {
            console.log(`[useSupabaseImages] Basketball image found: ${filename}`);
          }
        }
        
        if (fuzzyMatch(filename, 'ufc') || fuzzyMatch(filename, 'mma') || fuzzyMatch(filename, 'boxing')) {
          categorized.sports.ufc.push(url);
          if (import.meta.env.DEV) {
            console.log(`[useSupabaseImages] UFC/Boxing image found: ${filename}`);
          }
        }
      }

      setImages(categorized);
      setLoading(false);

      if (import.meta.env.DEV) {
        console.log('[useSupabaseImages] Image categorization complete:', {
          hero: !!categorized.hero,
          fireStickProducts: categorized.fireStickProducts.length,
          iptvSubscription: categorized.iptvSubscription.length,
          sports: {
            football: categorized.sports.football.length,
            baseball: categorized.sports.baseball.length,
            basketball: categorized.sports.basketball.length,
            ufc: categorized.sports.ufc.length,
          },
          total: categorized.all.length,
        });
      }

    } catch (err) {
      console.error('[useSupabaseImages] Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  return { images, loading, error };
}

/**
 * Helper function to get the best matching image from an array
 * Uses fuzzy matching to find the best match for a given pattern
 * @param images - Array of image URLs
 * @param pattern - Pattern to match (e.g., "4k max", "HD")
 * @returns The best matching image URL or the first image if no match
 */
export function getBestMatch(images: string[], pattern: string): string | null {
  if (images.length === 0) return null;
  if (images.length === 1) return images[0];

  // Try to find exact fuzzy match
  for (const image of images) {
    if (fuzzyMatch(image, pattern)) {
      return image;
    }
  }

  // Return first image as fallback
  return images[0];
}
