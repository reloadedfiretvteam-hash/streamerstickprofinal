/**
 * Advanced SEO Utilities for Multi-Engine Optimization
 * Supports: Google, Bing, Yandex, Baidu, DuckDuckGo, and AI Search Engines
 */

export interface AdvancedSEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'video';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  product?: {
    price?: string;
    currency?: string;
    availability?: string;
    brand?: string;
    sku?: string;
  };
  video?: {
    url?: string;
    thumbnail?: string;
    duration?: string;
  };
  breadcrumbs?: Array<{ name: string; url: string }>;
  schema?: Record<string, any>;
}

/**
 * Set comprehensive meta tags for all search engines
 */
export function setAdvancedMetaTags(config: AdvancedSEOConfig): void {
  const baseUrl = 'https://streamstickpro.com';
  
  // Set document title
  document.title = config.title;
  
  // Helper to set meta tags
  const setMeta = (name: string, content: string, isProperty = false) => {
    if (!content) return;
    const attr = isProperty ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };
  
  // Helper to set link tags
  const setLink = (rel: string, href: string, attributes?: Record<string, string>) => {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = href;
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
    }
  };
  
  // Basic Meta Tags
  setMeta('description', config.description);
  setMeta('keywords', config.keywords?.join(', ') || '');
  setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  setMeta('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  setMeta('bingbot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  setMeta('slurp', 'index, follow'); // Yahoo
  setMeta('DuckDuckBot', 'index, follow'); // DuckDuckGo
  setMeta('yandex', 'index, follow'); // Yandex
  setMeta('baiduspider', 'index, follow'); // Baidu
  
  // Language and Locale
  setMeta('language', 'English');
  setMeta('revisit-after', '1 day');
  setMeta('distribution', 'global');
  setMeta('rating', 'general');
  setMeta('geo.region', 'US');
  setMeta('geo.placename', 'United States');
  
  // Canonical URL
  setLink('canonical', config.canonicalUrl);
  
  // Open Graph Tags (Facebook, LinkedIn, etc.)
  setMeta('og:title', config.title, true);
  setMeta('og:description', config.description, true);
  setMeta('og:type', config.ogType || 'website', true);
  setMeta('og:url', config.canonicalUrl, true);
  setMeta('og:site_name', 'StreamStickPro', true);
  setMeta('og:locale', 'en_US', true);
  setMeta('og:locale:alternate', 'en_GB', true);
  
  if (config.ogImage) {
    setMeta('og:image', config.ogImage, true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);
    setMeta('og:image:alt', config.title, true);
    setMeta('og:image:type', 'image/jpeg', true);
  }
  
  // Article-specific Open Graph
  if (config.article) {
    if (config.article.publishedTime) setMeta('article:published_time', config.article.publishedTime, true);
    if (config.article.modifiedTime) setMeta('article:modified_time', config.article.modifiedTime, true);
    if (config.article.author) setMeta('article:author', config.article.author, true);
    if (config.article.section) setMeta('article:section', config.article.section, true);
    if (config.article.tags) {
      config.article.tags.forEach(tag => {
        setMeta('article:tag', tag, true);
      });
    }
  }
  
  // Product-specific Open Graph
  if (config.product) {
    setMeta('product:price:amount', config.product.price || '', true);
    setMeta('product:price:currency', config.product.currency || 'USD', true);
    setMeta('product:availability', config.product.availability || 'in stock', true);
    if (config.product.brand) setMeta('product:brand', config.product.brand, true);
  }
  
  // Twitter Card Tags
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:site', '@streamstickpro');
  setMeta('twitter:creator', '@streamstickpro');
  setMeta('twitter:title', config.title);
  setMeta('twitter:description', config.description);
  if (config.ogImage) {
    setMeta('twitter:image', config.ogImage);
    setMeta('twitter:image:alt', config.title);
  }
  
  // Video-specific tags
  if (config.video) {
    if (config.video.url) setMeta('og:video', config.video.url, true);
    if (config.video.thumbnail) setMeta('og:video:thumbnail', config.video.thumbnail, true);
    if (config.video.duration) setMeta('og:video:duration', config.video.duration, true);
    setMeta('og:video:type', 'video/mp4', true);
  }
  
  // Hreflang tags for international SEO
  setLink('alternate', config.canonicalUrl, { hreflang: 'en' });
  setLink('alternate', config.canonicalUrl, { hreflang: 'x-default' });
  
  // Additional search engine specific tags
  setMeta('msvalidate.01', 'F672EB0BB38ACF36885E6E30A910DDDB'); // Bing
  setMeta('google-site-verification', 'c8f0b74f53fde501'); // Google
  setMeta('yandex-verification', ''); // Yandex (add if available)
  setMeta('baidu-site-verification', ''); // Baidu (add if available)
  
  // PWA and Mobile
  setMeta('theme-color', '#1a1a1a');
  setMeta('mobile-web-app-capable', 'yes');
  setMeta('apple-mobile-web-app-capable', 'yes');
  setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  setMeta('apple-mobile-web-app-title', 'StreamStickPro');
  
  // Breadcrumbs
  if (config.breadcrumbs && config.breadcrumbs.length > 0) {
    addBreadcrumbSchema(config.breadcrumbs);
  }
  
  // Custom Schema
  if (config.schema) {
    addSchemaMarkup(config.schema);
  }
}

/**
 * Add Breadcrumb Schema Markup
 */
export function addBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): void {
  const baseUrl = 'https://streamstickpro.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
    }))
  };
  
  addSchemaMarkup(schema);
}

/**
 * Add Organization Schema
 */
export function addOrganizationSchema(): void {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'StreamStickPro',
    alternateName: 'Stream Stick Pro',
    url: 'https://streamstickpro.com',
    logo: 'https://streamstickpro.com/logo.png',
    description: 'Premium IPTV streaming service with 20,000+ live channels, movies, sports and PPV events. Jailbroken Fire Stick devices available.',
    email: 'reloadedfiretvteam@gmail.com',
    foundingDate: '2020',
    sameAs: [
      'https://twitter.com/streamstickpro',
      'https://facebook.com/streamstickpro'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'reloadedfiretvteam@gmail.com',
      availableLanguage: ['English'],
      areaServed: 'Worldwide'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1247',
      bestRating: '5',
      worstRating: '1'
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '15.00',
      highPrice: '109.99',
      offerCount: '7'
    }
  };
  
  addSchemaMarkup(schema);
}

/**
 * Add Product Schema
 */
export function addProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: string;
  currency?: string;
  availability?: string;
  sku?: string;
  brand?: string;
  rating?: { value: number; count: number };
}): void {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku || product.name.toLowerCase().replace(/\s+/g, '-'),
    brand: {
      '@type': 'Brand',
      name: product.brand || 'StreamStickPro'
    },
    offers: {
      '@type': 'Offer',
      url: `https://streamstickpro.com/shop`,
      priceCurrency: product.currency || 'USD',
      price: product.price,
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'StreamStickPro'
      }
    }
  };
  
  if (product.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.value.toString(),
      reviewCount: product.rating.count.toString(),
      bestRating: '5',
      worstRating: '1'
    };
  }
  
  addSchemaMarkup(schema);
}

/**
 * Add Article/BlogPost Schema
 */
export function addArticleSchema(article: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  publisher?: string;
}): void {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image || 'https://streamstickpro.com/og-image.png',
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: {
      '@type': 'Organization',
      name: article.publisher || 'StreamStickPro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://streamstickpro.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': typeof window !== 'undefined' ? window.location.href : ''
    }
  };
  
  addSchemaMarkup(schema);
}

/**
 * Add FAQ Schema
 */
export function addFAQSchema(faqs: Array<{ question: string; answer: string }>): void {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
  
  addSchemaMarkup(schema);
}

/**
 * Add Video Schema
 */
export function addVideoSchema(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}): void {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    publisher: {
      '@type': 'Organization',
      name: 'StreamStickPro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://streamstickpro.com/logo.png'
      }
    }
  };
  
  if (video.duration) schema.duration = video.duration;
  if (video.contentUrl) schema.contentUrl = video.contentUrl;
  if (video.embedUrl) schema.embedUrl = video.embedUrl;
  
  addSchemaMarkup(schema);
}

/**
 * Add HowTo Schema
 */
export function addHowToSchema(howto: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string; url?: string }>;
}): void {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howto.name,
    description: howto.description,
    step: howto.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
      ...(step.url && { url: step.url })
    }))
  };
  
  addSchemaMarkup(schema);
}

/**
 * Add Schema Markup to page
 */
export function addSchemaMarkup(schema: Record<string, any>): void {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  script.id = `schema-${Date.now()}-${Math.random()}`;
  document.head.appendChild(script);
}

/**
 * Remove all schema markups (useful for page transitions)
 */
export function removeAllSchemaMarkups(): void {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  scripts.forEach(script => script.remove());
}

/**
 * Submit URL to IndexNow for instant indexing
 */
export async function submitToIndexNow(urls: string[]): Promise<{ success: boolean; message: string }> {
  const INDEXNOW_KEY = '59748a36d4494392a7d863abcf2d3b52';
  const SITE_URL = 'https://streamstickpro.com';
  
  const normalizedUrls = urls.map(url => 
    url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`
  );
  
  try {
    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: normalizedUrls
      })
    });
    
    if (response.ok || response.status === 200 || response.status === 202) {
      return {
        success: true,
        message: `Successfully submitted ${urls.length} URL(s) to IndexNow`
      };
    } else {
      return {
        success: false,
        message: `IndexNow returned status ${response.status}`
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `IndexNow submission failed: ${error.message}`
    };
  }
}

/**
 * Generate comprehensive SEO config from page data
 */
export function generateSEOConfig(
  pageType: 'home' | 'blog' | 'product' | 'article',
  data: any
): AdvancedSEOConfig {
  const baseUrl = 'https://streamstickpro.com';
  
  switch (pageType) {
    case 'home':
      return {
        title: 'StreamStickPro - Premium Streaming Devices & Live TV Plans 2025',
        description: 'Get fully loaded in 10 minutes! Fire Sticks with Live TV plans - extensive content library, thousands of movies, comprehensive sports coverage. Instant credentials, easy setup, 24/7 support.',
        keywords: ['streaming device', 'fire tv stick', 'live tv streaming', 'iptv', 'jailbroken fire stick'],
        canonicalUrl: baseUrl,
        ogImage: `${baseUrl}/og-image.png`,
        ogType: 'website',
        breadcrumbs: [
          { name: 'Home', url: baseUrl }
        ]
      };
      
    case 'blog':
      return {
        title: `${data.title} | StreamStickPro Blog`,
        description: data.excerpt || data.description || '',
        keywords: data.tags || [],
        canonicalUrl: `${baseUrl}/blog/${data.slug}`,
        ogImage: data.image || `${baseUrl}/og-image.png`,
        ogType: 'article',
        article: {
          publishedTime: data.publishedAt,
          modifiedTime: data.updatedAt,
          author: data.author || 'StreamStickPro',
          section: data.category,
          tags: data.tags
        },
        breadcrumbs: [
          { name: 'Home', url: baseUrl },
          { name: 'Blog', url: `${baseUrl}/blog` },
          { name: data.title, url: `${baseUrl}/blog/${data.slug}` }
        ]
      };
      
    case 'product':
      return {
        title: `${data.name} | StreamStickPro`,
        description: data.description || '',
        keywords: data.keywords || [],
        canonicalUrl: `${baseUrl}/shop`,
        ogImage: data.image || `${baseUrl}/og-image.png`,
        ogType: 'product',
        product: {
          price: data.price?.toString(),
          currency: 'USD',
          availability: 'in stock',
          brand: 'StreamStickPro',
          sku: data.id?.toString()
        },
        breadcrumbs: [
          { name: 'Home', url: baseUrl },
          { name: 'Shop', url: `${baseUrl}/shop` },
          { name: data.name, url: `${baseUrl}/shop` }
        ]
      };
      
    default:
      return {
        title: 'StreamStickPro - Premium Streaming Devices',
        description: 'Premium IPTV streaming service',
        canonicalUrl: baseUrl,
        ogType: 'website'
      };
  }
}
