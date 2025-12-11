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
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  faq?: FAQItem[];
  products?: Product[];
  breadcrumbs?: { name: string; url: string }[];
}

export function SEOSchema({ title, description, url, image, faq, products, breadcrumbs }: SEOSchemaProps) {
  const faqMemo = useMemo(() => faq, [JSON.stringify(faq)]);
  const productsMemo = useMemo(() => products, [JSON.stringify(products)]);
  const breadcrumbsMemo = useMemo(() => breadcrumbs, [JSON.stringify(breadcrumbs)]);

  useEffect(() => {
    if (!title && !description && !url && !image) return;

    const existingWebpage = document.querySelector('script[data-seo-schema="webpage"]');
    if (existingWebpage) existingWebpage.remove();

    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "WebPage",
    };

    if (title) schema.name = title;
    if (description) schema.description = description;
    const resolvedUrl = url || (typeof window !== 'undefined' ? window.location.href : undefined);
    if (resolvedUrl) schema.url = resolvedUrl;
    if (image) {
      schema.primaryImageOfPage = {
        "@type": "ImageObject",
        "url": image
      };
    }

    const webpageScript = document.createElement('script');
    webpageScript.type = 'application/ld+json';
    webpageScript.setAttribute('data-seo-schema', 'webpage');
    webpageScript.textContent = JSON.stringify(schema);
    document.head.appendChild(webpageScript);

    return () => {
      const scriptToRemove = document.querySelector('script[data-seo-schema="webpage"]');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [title, description, url, image]);

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
