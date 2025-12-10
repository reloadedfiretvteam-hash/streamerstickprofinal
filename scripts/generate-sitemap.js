#!/usr/bin/env node

/**
 * Generate sitemap.xml from Supabase blog posts
 * 
 * This script:
 * 1. Discovers the blog table (tries multiple candidate names)
 * 2. Fetches published blog posts from Supabase
 * 3. Generates sitemap.xml with blog post URLs
 * 4. Writes to client/public/sitemap.xml
 * 
 * Environment Variables:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_KEY: Supabase anon or service role key
 * - SITE_BASE_URL: Base URL of your site (default: https://streamstickpro.com)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://streamstickpro.com';
const OUTPUT_PATH = path.join(__dirname, '..', 'client', 'public', 'sitemap.xml');

// Candidate table names to try
const TABLE_CANDIDATES = ['blog_posts', 'blogPosts', 'blogposts', 'blogs'];

// Static pages to include in sitemap
const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/blog', priority: '0.9', changefreq: 'weekly' },
  { loc: '/checkout', priority: '0.8', changefreq: 'monthly' },
];

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date) {
  if (!date) return new Date().toISOString().split('T')[0];
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Try to fetch blog posts from various table names
 */
async function fetchBlogPosts(supabase) {
  for (const tableName of TABLE_CANDIDATES) {
    try {
      console.log(`Trying table: ${tableName}...`);
      const { data, error } = await supabase
        .from(tableName)
        .select('id, slug, title, publishedAt, createdAt, updatedAt, published')
        .eq('published', true)
        .order('publishedAt', { ascending: false });

      if (error) {
        console.log(`  ❌ Error with ${tableName}: ${error.message}`);
        continue;
      }

      if (data && data.length > 0) {
        console.log(`  ✅ Found ${data.length} posts in table: ${tableName}`);
        return { data, tableName };
      }

      console.log(`  ⚠️  Table ${tableName} exists but has no published posts`);
    } catch (err) {
      console.log(`  ❌ Exception with ${tableName}: ${err.message}`);
      continue;
    }
  }

  return { data: [], tableName: null };
}

/**
 * Generate XML sitemap content
 */
function generateSitemap(posts) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  // Add static pages
  STATIC_PAGES.forEach(page => {
    lines.push('  <url>');
    lines.push(`    <loc>${SITE_BASE_URL}${page.loc}</loc>`);
    lines.push(`    <lastmod>${formatDate()}</lastmod>`);
    lines.push(`    <changefreq>${page.changefreq}</changefreq>`);
    lines.push(`    <priority>${page.priority}</priority>`);
    lines.push('  </url>');
  });

  // Add blog posts
  posts.forEach(post => {
    const slug = post.slug || post.id;
    const lastmod = post.publishedAt || post.updatedAt || post.createdAt;
    
    lines.push('  <url>');
    lines.push(`    <loc>${SITE_BASE_URL}/blog/${slug}</loc>`);
    lines.push(`    <lastmod>${formatDate(lastmod)}</lastmod>`);
    lines.push('    <changefreq>monthly</changefreq>');
    lines.push('    <priority>0.8</priority>');
    lines.push('  </url>');
  });

  lines.push('</urlset>');
  return lines.join('\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🗺️  Sitemap Generator for StreamStickPro\n');
  console.log('Configuration:');
  console.log(`  SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_KEY: ${SUPABASE_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SITE_BASE_URL: ${SITE_BASE_URL}`);
  console.log(`  Output: ${OUTPUT_PATH}\n`);

  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Missing required environment variables');
    console.error('   Please set SUPABASE_URL and SUPABASE_KEY');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fetch blog posts
  console.log('Fetching blog posts from Supabase...');
  const { data: posts, tableName } = await fetchBlogPosts(supabase);

  if (!tableName) {
    console.warn('⚠️  Warning: Could not find blog posts table');
    console.warn('   Attempted tables:', TABLE_CANDIDATES.join(', '));
    console.warn('   Generating sitemap with static pages only...\n');
  }

  // Generate sitemap
  const sitemap = generateSitemap(posts);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write sitemap
  fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');

  // Summary
  console.log('\n✅ Sitemap generated successfully!\n');
  console.log('Summary:');
  console.log(`  📄 Static pages: ${STATIC_PAGES.length}`);
  console.log(`  📝 Blog posts: ${posts.length}`);
  console.log(`  📊 Total URLs: ${STATIC_PAGES.length + posts.length}`);
  console.log(`  💾 Saved to: ${OUTPUT_PATH}\n`);

  if (tableName) {
    console.log(`  📋 Source table: ${tableName}`);
  }

  console.log('Next steps:');
  console.log('  1. Review the generated sitemap.xml');
  console.log('  2. Deploy to Cloudflare Pages (sitemap will be at /sitemap.xml)');
  console.log('  3. Submit to Google Search Console and Bing Webmaster Tools');
  console.log('  4. Ensure robots.txt references the sitemap\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
