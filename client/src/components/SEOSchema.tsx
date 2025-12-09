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
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

export function SEOSchema({ faq, products, breadcrumbs, title, description, url, image }: SEOSchemaProps) {
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

  // Meta tags and canonical URL management
  useEffect(() => {
    const updateOrCreateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.querySelector(`meta[name="${property}"]`) as HTMLMetaElement;
      }
      if (meta) {
        meta.content = content;
      } else {
        meta = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', property);
        }
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // Ensure canonical URL with trailing slash
    if (url) {
      const canonicalUrl = url.endsWith('/') ? url : url + '/';
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonicalLink) {
        canonicalLink.href = canonicalUrl;
      } else {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        canonicalLink.href = canonicalUrl;
        document.head.appendChild(canonicalLink);
      }

      // Update og:url to match canonical
      updateOrCreateMetaTag('og:url', canonicalUrl);
    }

    if (title) {
      document.title = title;
      updateOrCreateMetaTag('og:title', title);
      updateOrCreateMetaTag('twitter:title', title);
    }

    if (description) {
      updateOrCreateMetaTag('description', description);
      updateOrCreateMetaTag('og:description', description);
      updateOrCreateMetaTag('twitter:description', description);
    }

    if (image) {
      updateOrCreateMetaTag('og:image', image);
      updateOrCreateMetaTag('twitter:image', image);
    }

    // Ensure og:type
    updateOrCreateMetaTag('og:type', 'website');
    updateOrCreateMetaTag('twitter:card', 'summary_large_image');
  }, [title, description, url, image]);

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
