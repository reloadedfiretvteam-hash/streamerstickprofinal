import { useEffect, useMemo } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface Product {
  name: string;
  description: string;
  price: number;
  image?: string;
  sku?: string;
  brand?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
}

interface SEOSchemaProps {
  faq?: FAQItem[];
  products?: Product[];
  breadcrumbs?: { name: string; url: string }[];
}

export function SEOSchema({ faq, products, breadcrumbs }: SEOSchemaProps) {
  const faqMemo = useMemo(() => faq, [JSON.stringify(faq)]);
  const productsMemo = useMemo(() => products, [JSON.stringify(products)]);
  const breadcrumbsMemo = useMemo(() => breadcrumbs, [JSON.stringify(breadcrumbs)]);

  useEffect(() => {
    if (faqMemo && faqMemo.length > 0) {
      const existingFaq = document.querySelector('script[data-seo-schema="faq"]');
      if (existingFaq) existingFaq.remove();

      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqMemo.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      };
      const faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.setAttribute('data-seo-schema', 'faq');
      faqScript.textContent = JSON.stringify(faqSchema);
      document.head.appendChild(faqScript);
    }

    return () => {
      const faqScript = document.querySelector('script[data-seo-schema="faq"]');
      if (faqScript) faqScript.remove();
    };
  }, [faqMemo]);

  useEffect(() => {
    if (productsMemo && productsMemo.length > 0) {
      document.querySelectorAll('script[data-seo-schema^="product-"]').forEach(s => s.remove());

      productsMemo.forEach((product, index) => {
        const productSchema = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": product.image || "https://streamstickpro.com/opengraph.jpg",
          "brand": {
            "@type": "Brand",
            "name": product.brand || "StreamStickPro"
          },
          "sku": product.sku || `SSP-${index + 1}`,
          "offers": {
            "@type": "Offer",
            "url": "https://streamstickpro.com",
            "priceCurrency": "USD",
            "price": product.price,
            "availability": `https://schema.org/${product.availability || 'InStock'}`,
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "seller": {
              "@type": "Organization",
              "name": "StreamStickPro"
            }
          }
        };
        const productScript = document.createElement('script');
        productScript.type = 'application/ld+json';
        productScript.setAttribute('data-seo-schema', `product-${index}`);
        productScript.textContent = JSON.stringify(productSchema);
        document.head.appendChild(productScript);
      });
    }

    return () => {
      document.querySelectorAll('script[data-seo-schema^="product-"]').forEach(s => s.remove());
    };
  }, [productsMemo]);

  useEffect(() => {
    if (breadcrumbsMemo && breadcrumbsMemo.length > 0) {
      const existingBreadcrumbs = document.querySelector('script[data-seo-schema="breadcrumbs"]');
      if (existingBreadcrumbs) existingBreadcrumbs.remove();

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbsMemo.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      };
      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.setAttribute('data-seo-schema', 'breadcrumbs');
      breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
      document.head.appendChild(breadcrumbScript);
    }

    return () => {
      const breadcrumbScript = document.querySelector('script[data-seo-schema="breadcrumbs"]');
      if (breadcrumbScript) breadcrumbScript.remove();
    };
  }, [breadcrumbsMemo]);

  return null;
}

export function BlogPostSchema({ 
  title, 
  description, 
  datePublished, 
  dateModified,
  author = "StreamStickPro Team",
  image
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-seo-schema="article"]');
    if (existingScript) existingScript.remove();

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "image": image || "https://streamstickpro.com/opengraph.jpg",
      "author": {
        "@type": "Organization",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "StreamStickPro",
        "logo": {
          "@type": "ImageObject",
          "url": "https://streamstickpro.com/favicon.png"
        }
      },
      "datePublished": datePublished,
      "dateModified": dateModified || datePublished,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-schema', 'article');
    script.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-seo-schema="article"]');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [title, description, datePublished, dateModified, author, image]);

  return null;
}

export function HowToSchema({
  name,
  description,
  steps,
  totalTime
}: {
  name: string;
  description: string;
  steps: { name: string; text: string; image?: string }[];
  totalTime?: string;
}) {
  const stepsMemo = useMemo(() => steps, [JSON.stringify(steps)]);

  useEffect(() => {
    const existingScript = document.querySelector('script[data-seo-schema="howto"]');
    if (existingScript) existingScript.remove();

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": name,
      "description": description,
      "totalTime": totalTime || "PT15M",
      "step": stepsMemo.map((step, index) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "name": step.name,
        "text": step.text,
        ...(step.image && { "image": step.image })
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-schema', 'howto');
    script.textContent = JSON.stringify(howToSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-seo-schema="howto"]');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [name, description, stepsMemo, totalTime]);

  return null;
}

// Video Schema for 2025-2026 SEO (Answer Engine Optimization)
export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}) {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-seo-schema="video"]');
    if (existingScript) existingScript.remove();

    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": name,
      "description": description,
      "thumbnailUrl": thumbnailUrl,
      "uploadDate": uploadDate,
      ...(duration && { "duration": duration }),
      ...(contentUrl && { "contentUrl": contentUrl }),
      ...(embedUrl && { "embedUrl": embedUrl }),
      "publisher": {
        "@type": "Organization",
        "name": "StreamStickPro",
        "logo": {
          "@type": "ImageObject",
          "url": "https://streamstickpro.com/favicon.png"
        }
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-schema', 'video');
    script.textContent = JSON.stringify(videoSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-seo-schema="video"]');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [name, description, thumbnailUrl, uploadDate, duration, contentUrl, embedUrl]);

  return null;
}

// Q&A Schema for Answer Engine Optimization (2025-2026)
export function QASchema({
  questions
}: {
  questions: { question: string; answer: string; author?: string; dateCreated?: string }[];
}) {
  const questionsMemo = useMemo(() => questions, [JSON.stringify(questions)]);

  useEffect(() => {
    const existingScript = document.querySelector('script[data-seo-schema="qa"]');
    if (existingScript) existingScript.remove();

    const qaSchema = {
      "@context": "https://schema.org",
      "@type": "QAPage",
      "mainEntity": questionsMemo.map(q => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.answer,
          ...(q.author && { "author": { "@type": "Person", "name": q.author } }),
          ...(q.dateCreated && { "dateCreated": q.dateCreated })
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-schema', 'qa');
    script.textContent = JSON.stringify(qaSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-seo-schema="qa"]');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [questionsMemo]);

  return null;
}

// Service Schema for IPTV Service Offerings
export function ServiceSchema({
  name,
  description,
  serviceType,
  areaServed,
  provider
}: {
  name: string;
  description: string;
  serviceType: string;
  areaServed?: string;
  provider?: string;
}) {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-seo-schema="service"]');
    if (existingScript) existingScript.remove();

    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": name,
      "description": description,
      "serviceType": serviceType,
      "provider": {
        "@type": "Organization",
        "name": provider || "StreamStickPro",
        "url": "https://streamstickpro.com"
      },
      ...(areaServed && {
        "areaServed": {
          "@type": "Country",
          "name": areaServed
        }
      })
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-schema', 'service');
    script.textContent = JSON.stringify(serviceSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-seo-schema="service"]');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [name, description, serviceType, areaServed, provider]);

  return null;
}

// ItemList Schema for Product Listings (2025-2026)
export function ItemListSchema({
  name,
  description,
  items
}: {
  name: string;
  description: string;
  items: { name: string; description: string; url?: string; image?: string; price?: number }[];
}) {
  const itemsMemo = useMemo(() => items, [JSON.stringify(items)]);

  useEffect(() => {
    const existingScript = document.querySelector('script[data-seo-schema="itemlist"]');
    if (existingScript) existingScript.remove();

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": name,
      "description": description,
      "itemListElement": itemsMemo.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": item.name,
          "description": item.description,
          ...(item.url && { "url": item.url }),
          ...(item.image && { "image": item.image }),
          "offers": {
            "@type": "Offer",
            "url": item.url || "https://streamstickpro.com",
            "priceCurrency": "USD",
            "price": item.price || 0,
            "availability": "https://schema.org/InStock",
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "seller": {
              "@type": "Organization",
              "name": "StreamStickPro"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "2847",
            "bestRating": "5",
            "worstRating": "1"
          }
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-schema', 'itemlist');
    script.textContent = JSON.stringify(itemListSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-seo-schema="itemlist"]');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [name, description, itemsMemo]);

  return null;
}