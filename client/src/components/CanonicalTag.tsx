import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { absoluteCanonicalUrl } from '@/lib/canonical-path';

/**
 * CanonicalTag — aligns with worker-injected meta (blog trailing slash, legacy path → preferred URL).
 */
export default function CanonicalTag() {
  const [location] = useLocation();

  useEffect(() => {
    const pathOnly = location.split('?')[0].split('#')[0] || '/';
    const canonicalUrl = absoluteCanonicalUrl(pathOnly);

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

    // hreflang for US, Canada, UK – signals to Google/Bing for more impressions in those regions
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach((el) => el.remove());
    const hreflangs = [
      { lang: 'en-US', href: canonicalUrl },
      { lang: 'en-CA', href: canonicalUrl },
      { lang: 'en-GB', href: canonicalUrl },
      { lang: 'x-default', href: canonicalUrl },
    ];
    hreflangs.forEach(({ lang, href }) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = href;
      document.head.appendChild(link);
    });
  }, [location]);

  return null;
}
