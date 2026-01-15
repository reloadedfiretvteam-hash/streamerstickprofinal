/**
 * Advanced SEO Head Component
 * Implements comprehensive SEO for all search engines
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  setAdvancedMetaTags,
  addOrganizationSchema,
  addBreadcrumbSchema,
  generateSEOConfig,
  submitToIndexNow
} from '../utils/advancedSEO';

interface AdvancedSEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  pageType?: 'home' | 'blog' | 'product' | 'article';
  pageData?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
  autoIndex?: boolean; // Automatically submit to IndexNow
}

export default function AdvancedSEOHead({
  title,
  description,
  keywords,
  ogImage,
  pageType = 'home',
  pageData,
  breadcrumbs,
  autoIndex = false
}: AdvancedSEOHeadProps) {
  const location = useLocation();
  const baseUrl = 'https://streamstickpro.com';
  
  useEffect(() => {
    // Generate SEO config based on page type
    let seoConfig;
    
    if (pageData) {
      seoConfig = generateSEOConfig(pageType, pageData);
    } else {
      seoConfig = {
        title: title || 'StreamStickPro - Premium Streaming Devices & Live TV Plans 2025',
        description: description || 'Get fully loaded in 10 minutes! Fire Sticks with Live TV plans - extensive content library, thousands of movies, comprehensive sports coverage.',
        keywords: keywords || ['streaming device', 'fire tv stick', 'live tv streaming', 'iptv'],
        canonicalUrl: `${baseUrl}${location.pathname}`,
        ogImage: ogImage || `${baseUrl}/og-image.png`,
        ogType: pageType === 'article' ? 'article' : 'website',
        breadcrumbs: breadcrumbs || [
          { name: 'Home', url: baseUrl },
          ...(location.pathname !== '/' ? [{ name: location.pathname.split('/').pop() || '', url: `${baseUrl}${location.pathname}` }] : [])
        ]
      };
    }
    
    // Set comprehensive meta tags
    setAdvancedMetaTags(seoConfig);
    
    // Add organization schema on all pages
    addOrganizationSchema();
    
    // Add breadcrumb schema if provided
    if (seoConfig.breadcrumbs && seoConfig.breadcrumbs.length > 0) {
      addBreadcrumbSchema(seoConfig.breadcrumbs);
    }
    
    // Auto-submit to IndexNow if enabled
    if (autoIndex) {
      submitToIndexNow([location.pathname]).catch(err => {
        console.warn('IndexNow submission failed:', err);
      });
    }
    
    // Cleanup function
    return () => {
      // Remove dynamic schema markups on unmount (optional)
    };
  }, [location.pathname, title, description, keywords, ogImage, pageType, pageData, breadcrumbs, autoIndex]);
  
  return null; // This component doesn't render anything
}
