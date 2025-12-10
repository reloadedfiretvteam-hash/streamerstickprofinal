#!/usr/bin/env node

/**
 * Generate sitemap.xml from Supabase blog posts
 * 
 * Environment variables required:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_KEY: Your Supabase anon or service role key
 * - SITE_BASE_URL: Your site's base URL (default: https://streamstickpro.com)
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://streamstickpro.com';

// Table candidates to try
const TABLE_CANDIDATES = ['blogPosts', 'blog_posts', 'blogposts', 'blogs'];

// Static pages to include in sitemap
const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/blog', priority: '0.9', changefreq: 'weekly' },
  { loc: '/checkout', priority: '0.8', changefreq: 'monthly' }
];

async function discoverBlogTable(client) {
  console.log('🔍 Discovering blog table...');
  
  for (const tableName of TABLE_CANDIDATES) {
    try {
      console.log(`   Trying table: ${tableName}...`);
      const { data, error } = await client
        .from(tableName)
        .select('*')
        .eq('published', true)
        .limit(1);
      
      if (!error && data !== null) {
        console.log(`✅ Found blog table: ${tableName}`);
        return tableName;
      }
    } catch (err) {
      // Continue to next candidate
    }
  }
  
  throw new Error(`No blog table found. Tried: ${TABLE_CANDIDATES.join(', ')}`);
}

async function fetchBlogPosts(client, tableName) {
  console.log(`📚 Fetching blog posts from ${tableName}...`);
  
  const { data, error } = await client
    .from(tableName)
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(1000);
  
  if (error) {
    throw new Error(`Failed to fetch blog posts: ${error.message}`);
  }
  
  console.log(`✅ Found ${data?.length || 0} published posts`);
  return data || [];
}

function generateSitemapXML(posts) {
  console.log('🗺️  Generating sitemap XML...');
  
  const now = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add static pages
  for (const page of STATIC_PAGES) {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_BASE_URL}${page.loc}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  
  // Add blog posts
  for (const post of posts) {
    // Try to get slug from various possible field names
    const slug = post.slug || post.id || post.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    if (!slug) {
      console.warn(`⚠️  Skipping post without slug: ${post.title || 'Unknown'}`);
      continue;
    }
    
    // Get last modified date
    const lastmod = post.updated_at || post.created_at || now;
    const lastmodDate = new Date(lastmod).toISOString().split('T')[0];
    
    xml += '  <url>\n';
    xml += `    <loc>${SITE_BASE_URL}/blog/${slug}</loc>\n`;
    xml += `    <lastmod>${lastmodDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += '  </url>\n';
  }
  
  xml += '</urlset>\n';
  
  return xml;
}

function writeSitemap(xml) {
  // Determine output path - write to client/public/sitemap.xml
  const outputPath = join(__dirname, '..', 'client', 'public', 'sitemap.xml');
  
  console.log(`💾 Writing sitemap to: ${outputPath}`);
  
  writeFileSync(outputPath, xml, 'utf-8');
  
  console.log('✅ Sitemap generated successfully!');
  return outputPath;
}

async function main() {
  console.log('🚀 Starting sitemap generation...\n');
  
  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Missing required environment variables');
    console.error('   Required: SUPABASE_URL, SUPABASE_KEY (or SUPABASE_ANON_KEY)');
    console.error('   Optional: SITE_BASE_URL (default: https://streamstickpro.com)');
    process.exit(1);
  }
  
  console.log(`📍 Site base URL: ${SITE_BASE_URL}`);
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}\n`);
  
  try {
    // Create Supabase client
    const client = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Discover which table has the blog posts
    const tableName = await discoverBlogTable(client);
    
    // Fetch all published blog posts
    const posts = await fetchBlogPosts(client, tableName);
    
    // Generate sitemap XML
    const xml = generateSitemapXML(posts);
    
    // Write to file
    const outputPath = writeSitemap(xml);
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Static pages: ${STATIC_PAGES.length}`);
    console.log(`   Blog posts: ${posts.length}`);
    console.log(`   Total URLs: ${STATIC_PAGES.length + posts.length}`);
    console.log(`   Output: ${outputPath}`);
    console.log('\n✨ Done! You can now deploy the sitemap to production.');
    console.log('   Next steps:');
    console.log('   1. Commit the generated sitemap.xml');
    console.log('   2. Deploy to Cloudflare Pages');
    console.log('   3. Submit to Google Search Console and Bing Webmaster Tools');
    
  } catch (error) {
    console.error('\n❌ Error generating sitemap:', error.message);
    process.exit(1);
  }
}

main();
