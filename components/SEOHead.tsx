import { useEffect } from 'react';

export default function SEOHead() {
  useEffect(() => {
    document.title = 'Stream Stick Pro - Premium IPTV Subscriptions & Jailbroken Fire Stick | 20,000+ Channels';

    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setMetaTag('description', 'Premium IPTV subscriptions with 20,000+ live channels, movies, sports & PPV. Jailbroken Fire Stick 4K devices. 36-hour free trial. 24/7 support. Free trial available.');

    setMetaTag('keywords', 'IPTV, premium IPTV, IPTV subscription, Fire Stick, jailbroken Fire Stick, Fire TV, live TV streaming, 4K streaming, sports IPTV, movie streaming, PPV events, cord cutting, cable alternative, streaming service, Fire Stick IPTV, Android IPTV, Smart TV IPTV, best IPTV service, affordable IPTV, reliable IPTV, HD streaming');

    setMetaTag('author', 'Stream Stick Pro');
    setMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMetaTag('googlebot', 'index, follow');
    setMetaTag('bingbot', 'index, follow');

    setMetaTag('google-site-verification', 'YOUR_GOOGLE_VERIFICATION_CODE');

    setMetaTag('language', 'English');
    setMetaTag('revisit-after', '1 day');
    setMetaTag('distribution', 'global');
    setMetaTag('rating', 'general');

    setMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0');
    setMetaTag('theme-color', '#FF4500');
    setMetaTag('mobile-web-app-capable', 'yes');
    setMetaTag('apple-mobile-web-app-capable', 'yes');
    setMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');

    setMetaTag('og:site_name', 'Stream Stick Pro', true);
    setMetaTag('og:title', 'Stream Stick Pro - Premium IPTV with 20,000+ Channels', true);
    setMetaTag('og:description', 'Stream 20,000+ live channels, movies, sports & PPV events. Premium IPTV subscriptions and jailbroken Fire Stick devices. 36-hour free trial.', true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('og:url', window.location.href, true);
    setMetaTag('og:image', `${window.location.origin}/og-image.jpg`, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:image:alt', 'Stream Stick Pro Premium IPTV Service', true);
    setMetaTag('og:locale', 'en_US', true);

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:site', '@streamstickpro');
    setMetaTag('twitter:creator', '@streamstickpro');
    setMetaTag('twitter:title', 'Stream Stick Pro - Premium IPTV Streaming Service');
    setMetaTag('twitter:description', 'Access 20,000+ live channels, movies, sports and PPV events. Premium IPTV subscriptions and Fire Stick devices. Try free for 36 hours.');
    setMetaTag('twitter:image', `${window.location.origin}/twitter-card.jpg`);

    setMetaTag('geo.region', 'US');
    setMetaTag('geo.placename', 'United States');

    setMetaTag('format-detection', 'telephone=no');

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = window.location.origin + window.location.pathname;

    let alternateLink = document.querySelector('link[rel="alternate"]') as HTMLLinkElement;
    if (!alternateLink) {
      alternateLink = document.createElement('link');
      alternateLink.rel = 'alternate';
      alternateLink.type = 'application/rss+xml';
      alternateLink.title = 'Stream Stick Pro Blog Feed';
      alternateLink.href = `${window.location.origin}/feed.xml`;
      document.head.appendChild(alternateLink);
    }

    const preconnectLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com'
    ];

    preconnectLinks.forEach(url => {
      let link = document.querySelector(`link[href="${url}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        if (url.includes('gstatic')) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      }
    });

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Stream Stick Pro',
      alternateName: 'Stream Unlimited',
      description: 'Premium IPTV streaming service with 20,000+ live channels, movies, sports and PPV events. Jailbroken Fire Stick devices available.',
      url: window.location.origin,
      logo: `${window.location.origin}/logo.png`,
      email: 'reloadedfiretvteam@gmail.com',
      foundingDate: '2020',
      areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: '40.7128',
          longitude: '-74.0060'
        },
        geoRadius: '20000000'
      },
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

    let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

    const faqStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is IPTV and how does it work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'IPTV (Internet Protocol Television) delivers TV content through your internet connection instead of traditional cable or satellite. You need a stable internet connection and a compatible device to stream thousands of channels and on-demand content including movies, sports, and live TV.'
          }
        },
        {
          '@type': 'Question',
          name: 'What devices are compatible with Stream Stick Pro?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Stream Stick Pro works on Fire Stick, Fire TV, Smart TVs, Android TV, Apple TV, iPhone, iPad, Android phones and tablets, Windows PC, Mac, MAG boxes, Formuler boxes, and more. We provide setup support for all compatible devices.'
          }
        },
        {
          '@type': 'Question',
          name: 'How many channels do you offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We offer over 20,000+ live TV channels including sports, movies, international channels, news, entertainment, and premium content. Plus access to thousands of movies and TV series on demand.'
          }
        },
        {
          '@type': 'Question',
          name: 'Do you offer a money-back guarantee?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! We offer a 36-hour free trial. Experience our premium IPTV service completely free for 36 hours with full access to all features.'
          }
        },
        {
          '@type': 'Question',
          name: 'What internet speed do I need for IPTV?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For SD quality you need minimum 5 Mbps, for HD quality minimum 10 Mbps, and for 4K quality minimum 25 Mbps. We recommend at least 25 Mbps for the best streaming experience.'
          }
        }
      ]
    };

    let faqScript = document.querySelector('script[data-faq]') as HTMLScriptElement | null;
    if (!faqScript) {
      faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.setAttribute('data-faq', 'true');
      document.head.appendChild(faqScript);
    }
    faqScript.textContent = JSON.stringify(faqStructuredData);

  }, []);

  return null;
}
