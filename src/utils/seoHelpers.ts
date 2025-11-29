export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

export function updatePageSEO(config: SEOConfig): void {
  document.title = config.title;

  const setMetaTag = (name: string, content: string, isProperty = false) => {
    if (!content) return;

    const attribute = isProperty ? 'property' : 'name';
    let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    element.content = content;
  };

  setMetaTag('description', config.description);
  if (config.keywords) setMetaTag('keywords', config.keywords);

  setMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  setMetaTag('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  setMetaTag('bingbot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

  setMetaTag('og:title', config.title, true);
  setMetaTag('og:description', config.description, true);
  setMetaTag('og:type', config.ogType || 'website', true);
  setMetaTag('og:url', config.canonical || window.location.href, true);
  setMetaTag('og:site_name', 'Stream Stick Pro', true);
  setMetaTag('og:locale', 'en_US', true);

  if (config.ogImage) {
    setMetaTag('og:image', config.ogImage, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:image:alt', config.title, true);
  }

  if (config.article) {
    if (config.article.publishedTime) {
      setMetaTag('article:published_time', config.article.publishedTime, true);
    }
    if (config.article.modifiedTime) {
      setMetaTag('article:modified_time', config.article.modifiedTime, true);
    }
    if (config.article.author) {
      setMetaTag('article:author', config.article.author, true);
    }
    if (config.article.section) {
      setMetaTag('article:section', config.article.section, true);
    }
  }

  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:site', '@streamstickpro');
  setMetaTag('twitter:creator', '@streamstickpro');
  setMetaTag('twitter:title', config.title);
  setMetaTag('twitter:description', config.description);
  if (config.ogImage) {
    setMetaTag('twitter:image', config.ogImage);
  }

  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = config.canonical || window.location.href;
}

export function generateBreadcrumbSchema(items: Array<{name: string; url: string}>): void {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  let scriptTag = document.querySelector('script[data-breadcrumb-schema]') as HTMLScriptElement;
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.setAttribute('data-breadcrumb-schema', 'true');
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(schema);
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: string;
  brand?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
}): void {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Stream Stick Pro'
    },
    sku: product.sku || product.name,
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      priceCurrency: product.currency,
      price: product.price.toFixed(2),
      availability: `https://schema.org/${product.availability}`,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };

  if (product.rating && product.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewCount.toString(),
      bestRating: '5',
      worstRating: '1'
    };
  }

  let scriptTag = document.querySelector('script[data-product-schema]') as HTMLScriptElement;
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.setAttribute('data-product-schema', 'true');
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(schema);
}

export function generateVideoSchema(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}): void {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    contentUrl: video.contentUrl,
    embedUrl: video.embedUrl,
    duration: video.duration
  };

  let scriptTag = document.querySelector('script[data-video-schema]') as HTMLScriptElement;
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.setAttribute('data-video-schema', 'true');
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(schema);
}

export function generateWebsiteSchema(): void {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Stream Stick Pro',
    alternateName: 'Stream Unlimited',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  let scriptTag = document.querySelector('script[data-website-schema]') as HTMLScriptElement;
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.setAttribute('data-website-schema', 'true');
    document.head.appendChild(scriptTag);
  }
  scriptTag.textContent = JSON.stringify(schema);
}

export function addStructuredDataPreload(): void {
  const preloadTypes = [
    'https://schema.org',
    'https://www.google.com/schemas/sitemap-image/1.1'
  ];

  preloadTypes.forEach(url => {
    let link = document.querySelector(`link[href="${url}"]`) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      document.head.appendChild(link);
    }
  });
}

export function optimizeImagesForSEO(): void {
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach((img, index) => {
    const htmlImg = img as HTMLImageElement;

    if (index < 3) {
      htmlImg.loading = 'eager';
      htmlImg.fetchPriority = 'high';
    } else {
      htmlImg.loading = 'lazy';
    }

    if (!htmlImg.alt) {
      const src = htmlImg.src;
      const filename = src.split('/').pop()?.split('.')[0] || '';
      htmlImg.alt = filename.replace(/[-_]/g, ' ');
    }
  });
}

export function addHreflangTags(languages: Array<{code: string; url: string}>): void {
  languages.forEach(lang => {
    let link = document.querySelector(`link[hreflang="${lang.code}"]`) as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang.code;
      document.head.appendChild(link);
    }
    link.href = lang.url;
  });
}
