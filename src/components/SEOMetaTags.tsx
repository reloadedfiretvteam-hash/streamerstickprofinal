import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SEOMetaTags() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAndInjectSEOTags();
  }, []);

  const loadAndInjectSEOTags = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('google_search_console_verification, bing_webmaster_verification, google_analytics_id')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (error) {
        console.error('Error loading SEO settings:', error);
        setLoaded(true);
        return;
      }

      if (data) {
        // Inject Google Search Console verification meta tag
        if (data.google_search_console_verification && data.google_search_console_verification !== 'YOUR_GOOGLE_VERIFICATION_CODE') {
          const googleMeta = document.createElement('meta');
          googleMeta.name = 'google-site-verification';
          googleMeta.content = data.google_search_console_verification;
          document.head.appendChild(googleMeta);
        }

        // Inject Bing Webmaster Tools verification meta tag
        if (data.bing_webmaster_verification && data.bing_webmaster_verification !== 'YOUR_BING_VERIFICATION_CODE') {
          const bingMeta = document.createElement('meta');
          bingMeta.name = 'msvalidate.01';
          bingMeta.content = data.bing_webmaster_verification;
          document.head.appendChild(bingMeta);
        }

        // Inject Google Analytics 4 tracking
        if (data.google_analytics_id && data.google_analytics_id !== 'G-XXXXXXXXXX') {
          // Validate GA ID format to prevent XSS
          const gaIdPattern = /^G-[A-Z0-9]{10}$/;
          if (!gaIdPattern.test(data.google_analytics_id)) {
            console.warn('Invalid Google Analytics ID format. Expected format: G-XXXXXXXXXX');
            setLoaded(true);
            return;
          }

          // Add Google Analytics script
          const gaScript = document.createElement('script');
          gaScript.async = true;
          gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(data.google_analytics_id)}`;
          document.head.appendChild(gaScript);

          // Add gtag initialization using safe text content
          const gaInitScript = document.createElement('script');
          const scriptContent = document.createTextNode(`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${data.google_analytics_id}');
          `);
          gaInitScript.appendChild(scriptContent);
          document.head.appendChild(gaInitScript);
        }
      }

      setLoaded(true);
    } catch (err) {
      console.error('Failed to load SEO settings:', err);
      setLoaded(true);
    }
  };

  return null; // This component only injects tags, no visual output
}
