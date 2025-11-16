import { useEffect } from 'react';

export default function StructuredData() {
  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Stream Stick Pro",
      "alternateName": "Stream Stick Pro IPTV",
      "url": "https://streamstickpro.com",
      "logo": "https://streamstickpro.com/logo.png",
      "description": "Premium IPTV subscriptions and jailbroken Fire Stick devices. Access 20,000+ live TV channels, movies, sports, and PPV events.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-XXX-XXX-XXXX",
        "contactType": "Customer Service",
        "email": "reloadedfiretvteam@gmail.com",
        "availableLanguage": ["English"]
      },
      "sameAs": [
        "https://facebook.com/streamstickpro",
        "https://twitter.com/streamstickpro",
        "https://instagram.com/streamstickpro"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      }
    };

    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Stream Stick Pro",
      "image": "https://streamstickpro.com/logo.png",
      "priceRange": "$$$",
      "telephone": "+1-XXX-XXX-XXXX",
      "email": "reloadedfiretvteam@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "40.7128",
        "longitude": "-74.0060"
      },
      "url": "https://streamstickpro.com",
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "00:00",
        "closes": "23:59"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1247",
        "bestRating": "5",
        "worstRating": "1"
      }
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Stream Stick Pro",
      "url": "https://streamstickpro.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://streamstickpro.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "12-Month Premium IPTV Subscription",
      "description": "Access 20,000+ live TV channels, movies, sports, and PPV events with our premium IPTV service. No contracts, no hidden fees.",
      "brand": {
        "@type": "Brand",
        "name": "Stream Stick Pro"
      },
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "49.99",
        "highPrice": "199.99",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "seller": {
          "@type": "Organization",
          "name": "Stream Stick Pro"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1247",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [
        {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": "Michael Rodriguez"
          },
          "reviewBody": "Best IPTV service I've used! Crystal clear quality and excellent customer support."
        }
      ]
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://streamstickpro.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Products",
          "item": "https://streamstickpro.com#shop"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "IPTV Subscriptions",
          "item": "https://streamstickpro.com#iptv"
        }
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is IPTV?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "IPTV (Internet Protocol Television) is a system where television services are delivered using the Internet protocol suite over a packet-switched network such as the Internet, instead of being delivered through traditional terrestrial, satellite signal, and cable television formats."
          }
        },
        {
          "@type": "Question",
          "name": "How many channels do you offer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer access to over 20,000+ live TV channels including sports, movies, international channels, news, entertainment, and premium content from around the world."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer a money-back guarantee?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! We offer a 7-day money-back guarantee. If you're not completely satisfied with our service within the first 7 days, we'll provide a full refund, no questions asked."
          }
        },
        {
          "@type": "Question",
          "name": "What devices are compatible?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our IPTV service works on Fire Stick, Fire TV, Android devices, Smart TVs, MAG boxes, iOS devices, and more. We provide setup support for all compatible devices."
          }
        },
        {
          "@type": "Question",
          "name": "Is installation included?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! All our Fire Stick devices come pre-configured and ready to use. For IPTV subscriptions, we provide easy setup guides and customer support to help you get started."
          }
        }
      ]
    };

    const offerSchema = {
      "@context": "https://schema.org",
      "@type": "Offer",
      "name": "Premium IPTV Subscription Special Offer",
      "description": "Save 40% on 12-month IPTV subscriptions. Limited time offer!",
      "price": "119.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": "2024-01-01",
      "validThrough": "2025-12-31",
      "seller": {
        "@type": "Organization",
        "name": "Stream Stick Pro"
      }
    };

    const videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "How to Setup IPTV on Fire Stick",
      "description": "Complete step-by-step guide to setting up IPTV on your Amazon Fire Stick device.",
      "thumbnailUrl": "https://streamstickpro.com/tutorial-thumb.jpg",
      "uploadDate": "2024-01-01",
      "contentUrl": "https://streamstickpro.com/tutorials",
      "embedUrl": "https://streamstickpro.com/tutorials"
    };

    const schemas = [
      organizationSchema,
      localBusinessSchema,
      websiteSchema,
      productSchema,
      breadcrumbSchema,
      faqSchema,
      offerSchema,
      videoSchema
    ];

    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      if (script.textContent?.includes('schema.org')) {
        script.remove();
      }
    });

    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        if (script.textContent?.includes('schema.org')) {
          script.remove();
        }
      });
    };
  }, []);

  return null;
}
