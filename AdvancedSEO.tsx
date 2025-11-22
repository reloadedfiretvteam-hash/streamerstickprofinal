import { useEffect } from 'react';

/**
 * Advanced SEO Component
 * Implements cutting-edge SEO features to boost search engine rankings
 */
export default function AdvancedSEO() {
  useEffect(() => {
    // 1. Add hreflang tags for international SEO (if needed)
    const addHreflang = () => {
      const baseUrl = window.location.origin;
      let hreflang = document.querySelector('link[rel="alternate"][hreflang="en"]') as HTMLLinkElement;
      if (!hreflang) {
        hreflang = document.createElement('link');
        hreflang.rel = 'alternate';
        hreflang.hreflang = 'en';
        hreflang.href = baseUrl;
        document.head.appendChild(hreflang);
      }
    };

    // 2. Add Article Schema for Blog Posts
    const addArticleSchema = () => {
      const path = window.location.pathname;
      if (path.startsWith('/blog/')) {
        const articleSchema = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": document.title,
          "description": document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
          "image": document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
          "datePublished": new Date().toISOString(),
          "dateModified": new Date().toISOString(),
          "author": {
            "@type": "Organization",
            "name": "Stream Stick Pro"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Stream Stick Pro",
            "logo": {
              "@type": "ImageObject",
              "url": `${window.location.origin}/logo.png`
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
          }
        };

        let script = document.querySelector('script[data-article-schema]') as HTMLScriptElement;
        if (!script) {
          script = document.createElement('script');
          script.type = 'application/ld+json';
          script.setAttribute('data-article-schema', 'true');
          document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(articleSchema);
      }
    };

    // 3. Add HowTo Schema for Tutorials
    const addHowToSchema = () => {
      const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Setup IPTV on Fire Stick",
        "description": "Complete step-by-step guide to setting up IPTV on your Amazon Fire Stick device",
        "image": `${window.location.origin}/tutorial-image.jpg`,
        "totalTime": "PT10M",
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": "0"
        },
        "step": [
          {
            "@type": "HowToStep",
            "name": "Connect Fire Stick to TV",
            "text": "Plug your Fire Stick into an available HDMI port on your TV",
            "image": `${window.location.origin}/step1.jpg`
          },
          {
            "@type": "HowToStep",
            "name": "Connect to Internet",
            "text": "Connect your Fire Stick to WiFi or Ethernet",
            "image": `${window.location.origin}/step2.jpg`
          },
          {
            "@type": "HowToStep",
            "name": "Install IPTV App",
            "text": "Download and install the IPTV app from the app store",
            "image": `${window.location.origin}/step3.jpg`
          },
          {
            "@type": "HowToStep",
            "name": "Enter Credentials",
            "text": "Enter your IPTV username and password provided after purchase",
            "image": `${window.location.origin}/step4.jpg`
          }
        ]
      };

      let script = document.querySelector('script[data-howto-schema]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-howto-schema', 'true');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(howToSchema);
    };

    // 4. Add Service Schema for IPTV Service
    const addServiceSchema = () => {
      const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "IPTV Streaming Service",
        "provider": {
          "@type": "Organization",
          "name": "Stream Stick Pro",
          "url": window.location.origin
        },
        "areaServed": {
          "@type": "Country",
          "name": "Worldwide"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "IPTV Subscription Plans",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "1 Month IPTV Subscription"
              },
              "price": "15.00",
              "priceCurrency": "USD"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "12 Month IPTV Subscription"
              },
              "price": "109.99",
              "priceCurrency": "USD"
            }
          ]
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "1247"
        }
      };

      let script = document.querySelector('script[data-service-schema]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-service-schema', 'true');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(serviceSchema);
    };

    // 5. Add SoftwareApplication Schema for IPTV App
    const addSoftwareSchema = () => {
      const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Stream Stick Pro IPTV App",
        "applicationCategory": "EntertainmentApplication",
        "operatingSystem": "Android, iOS, Fire OS",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "1247"
        },
        "screenshot": `${window.location.origin}/app-screenshot.jpg`
      };

      let script = document.querySelector('script[data-software-schema]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-software-schema', 'true');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(softwareSchema);
    };

    // 6. Add ItemList Schema for Product Listings
    const addItemListSchema = () => {
      const path = window.location.pathname;
      if (path === '/shop' || path === '/') {
        const itemListSchema = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Fire Stick 4K",
              "url": `${window.location.origin}/shop#fire-stick-4k`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Fire Stick 4K Max",
              "url": `${window.location.origin}/shop#fire-stick-4k-max`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "1 Month IPTV Subscription",
              "url": `${window.location.origin}/shop#iptv-1month`
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": "12 Month IPTV Subscription",
              "url": `${window.location.origin}/shop#iptv-12months`
            }
          ]
        };

        let script = document.querySelector('script[data-itemlist-schema]') as HTMLScriptElement;
        if (!script) {
          script = document.createElement('script');
          script.type = 'application/ld+json';
          script.setAttribute('data-itemlist-schema', 'true');
          document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(itemListSchema);
      }
    };

    // 7. Add CollectionPage Schema for Shop Page
    const addCollectionPageSchema = () => {
      if (window.location.pathname === '/shop') {
        const collectionSchema = {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "IPTV Products & Fire Stick Devices",
          "description": "Browse our collection of premium IPTV subscriptions and jailbroken Fire Stick devices",
          "url": `${window.location.origin}/shop`,
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": 7
          }
        };

        let script = document.querySelector('script[data-collection-schema]') as HTMLScriptElement;
        if (!script) {
          script = document.createElement('script');
          script.type = 'application/ld+json';
          script.setAttribute('data-collection-schema', 'true');
          document.head.appendChild(script);
        }
        script.textContent = JSON.stringify(collectionSchema);
      }
    };

    // 8. Add preload hints for critical resources
    const addPreloadHints = () => {
      const criticalImages = ['/hero-image.jpg', '/logo.png'];
      criticalImages.forEach(src => {
        let link = document.querySelector(`link[rel="preload"][href="${src}"]`) as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        }
      });
    };

    // 9. Add DNS prefetch for external resources
    const addDNSPrefetch = () => {
      const domains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com'
      ];

      domains.forEach(domain => {
        let link = document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`) as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = domain;
          document.head.appendChild(link);
        }
      });
    };

    // 10. Add resource hints for performance
    const addResourceHints = () => {
      // Preconnect to critical third-party domains
      const preconnectDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];

      preconnectDomains.forEach(domain => {
        let link = document.querySelector(`link[rel="preconnect"][href="${domain}"]`) as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = domain;
          if (domain.includes('gstatic')) {
            link.crossOrigin = 'anonymous';
          }
          document.head.appendChild(link);
        }
      });
    };

    // Execute all SEO enhancements
    addHreflang();
    addArticleSchema();
    addHowToSchema();
    addServiceSchema();
    addSoftwareSchema();
    addItemListSchema();
    addCollectionPageSchema();
    addPreloadHints();
    addDNSPrefetch();
    addResourceHints();

    // Cleanup function
    return () => {
      // Remove dynamic schemas on unmount
      const dynamicSchemas = document.querySelectorAll('script[data-article-schema], script[data-howto-schema], script[data-service-schema], script[data-software-schema], script[data-itemlist-schema], script[data-collection-schema]');
      dynamicSchemas.forEach(script => script.remove());
    };
  }, []);

  return null;
}

