/**
 * Legacy Blog Slug Mapping
 * 
 * This file maps old blog post slugs to their current slugs for SEO-friendly 301 redirects.
 * 
 * Usage:
 * When a user visits an old URL like /blog/old-slug, the system will check this map
 * and redirect them to /blog/new-slug with a 301 status.
 * 
 * Example entries:
 * "old-fire-stick-guide": "what-is-jailbroken-fire-stick",
 * "cable-vs-iptv": "fire-stick-vs-cable-cost-comparison",
 * 
 * Leave this object empty until the owner provides a list of legacy URLs to map.
 */

export const legacySlugMap: Record<string, string> = {
  // Add legacy slug mappings here when provided by owner
  // "old-slug": "new-slug",
};

/**
 * Helper function to get the new slug from a legacy slug
 * Returns null if no mapping exists
 */
export function getNewSlug(legacySlug: string): string | null {
  return legacySlugMap[legacySlug] || null;
}
