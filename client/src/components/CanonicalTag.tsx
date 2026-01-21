import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * CanonicalTag Component
 * Properly sets canonical URLs for all pages
 * Fixes Google Search Console "Alternative page with proper canonical tag" issues
 */
export default function CanonicalTag() {
  const [location] = useLocation();

  useEffect(() => {
    // Normalize the URL - remove query params and fragments for canonical
    const getCanonicalUrl = () => {
      const baseUrl = 'https://streamstickpro.com';
      let path = location.split('?')[0].split('#')[0]; // Remove query params and hash
      
      // Normalize path - remove trailing slashes for cleaner URLs
      // Exception: root path stays as '/'
      path = path.replace(/\/+$/, '') || '/';
      
      // For blog posts, ensure no trailing slash
      // For other pages, also no trailing slash (cleaner URLs)
      // Root stays as '/'
      
      return path === '/' ? `${baseUrl}/` : `${baseUrl}${path}`;
    };

    const canonicalUrl = getCanonicalUrl();

    // Remove any existing canonical tags first
    const existingCanonicals = document.querySelectorAll('link[rel="canonical"]');
    existingCanonicals.forEach(link => link.remove());

    // Create new canonical link
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonicalUrl;
    
    // Insert at the beginning of head for better SEO
    const head = document.head;
    const firstChild = head.firstChild;
    if (firstChild) {
      head.insertBefore(canonicalLink, firstChild);
    } else {
      head.appendChild(canonicalLink);
    }

    // Also update og:url to match canonical
    let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.content = canonicalUrl;

    // Debug logging disabled in production for cleaner console

  }, [location]);

  return null;
}
