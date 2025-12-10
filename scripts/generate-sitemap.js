#!/usr/bin/env node

/**
 * Sitemap Generator for StreamStickPro
 * 
 * Generates public/sitemap.xml from blog posts in Supabase
 * 
 * Required Environment Variables:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_KEY: Service role key or anon key
 * - SITE_BASE_URL: Base URL for your site (e.g., https://streamstickpro.com)
 * 
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_KEY=xxx SITE_BASE_URL=https://streamstickpro.com npm run generate-sitemap
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_BASE_URL = (process.env.SITE_BASE_URL || process.env.BASE_URL || 'https://streamstickpro.com').replace(/\/$/, '');

// Candidate table names to try
const CANDIDATE_TABLES = ['blogPosts', 'blog_posts', 'blogposts', 'blogs'];

async function findBlogTable(client) {
  console.log('🔍 Searching for blog posts table...');
  
  for (const tableName of CANDIDATE_TABLES) {
    try {
      const { data, error } = await client
        .from(tableName)
        .select('id, slug, title, date, updated_at')
        .eq('published', true)
        .limit(1);
      
      if (!error && data !== null) {
        console.log(`✅ Found blog table: "${tableName}"`);
        return tableName;
      }
    } catch (err) {
      // Continue to next candidate
      continue;
    }
  }
  
  return null;
}

async function fetchBlogPosts(client, tableName) {
  console.log(`📥 Fetching published posts from "${tableName}"...`);
  
  const { data, error } = await client
    .from(tableName)
    .select('id, slug, title, date, updated_at')
    .eq('published', true)
    .order('date', { ascending: false });
  
  if (error) {
    throw new Error(`Error fetching blog posts: ${error.message}`);
  }
  
  return data || [];
}

function generateSitemap(posts, baseUrl) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Homepage
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n';
  
  // Blog index
  xml += '  <url>\n';
  xml += `    <loc>${baseUrl}/blog</loc>\n`;
  xml += `    <lastmod>${currentDate}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>0.9</priority>\n';
  xml += '  </url>\n';
  
  // Individual blog posts
  for (const post of posts) {
    const slug = post.slug || post.id;
    const lastmod = post.updated_at || post.date || currentDate;
    const formattedDate = new Date(lastmod).toISOString().split('T')[0];
    
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/blog/${slug}</loc>\n`;
    xml += `    <lastmod>${formattedDate}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }
  
  xml += '</urlset>\n';
  
  return xml;
}

async function main() {
  console.log('🚀 Starting sitemap generation...\n');
  
  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Missing required environment variables');
    console.error('   Required: SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
    console.error('   Example: SUPABASE_URL=https://xxx.supabase.co SUPABASE_KEY=xxx npm run generate-sitemap');
    process.exit(1);
  }
  
  console.log(`📍 Site base URL: ${SITE_BASE_URL}`);
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}\n`);
  
  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Find the blog table
  const tableName = await findBlogTable(supabase);
  
  if (!tableName) {
    console.error('❌ Error: Could not find blog posts table');
    console.error(`   Checked tables: ${CANDIDATE_TABLES.join(', ')}`);
    console.error('   Make sure you have a blog table with a "published" column');
    console.error('   See scripts/create-blogview.sql for DB setup instructions');
    process.exit(1);
  }
  
  // Fetch blog posts
  const posts = await fetchBlogPosts(supabase, tableName);
  console.log(`📊 Found ${posts.length} published blog posts\n`);
  
  // Generate sitemap XML
  const sitemapXml = generateSitemap(posts, SITE_BASE_URL);
  
  // Write to public/sitemap.xml
  const outputDir = join(__dirname, '..', 'public');
  const outputPath = join(outputDir, 'sitemap.xml');
  
  try {
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(outputPath, sitemapXml, 'utf-8');
    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📄 Location: ${outputPath}`);
    console.log(`📏 Size: ${(sitemapXml.length / 1024).toFixed(2)} KB`);
    console.log(`🔗 URLs included: ${posts.length + 2} (homepage + blog index + ${posts.length} posts)\n`);
    console.log('📤 Next steps:');
    console.log('   1. Commit public/sitemap.xml to your repository');
    console.log('   2. Deploy to Cloudflare Pages (automatic on push)');
    console.log('   3. Verify at: ' + SITE_BASE_URL + '/sitemap.xml');
    console.log('   4. Submit to search engines (see docs/ELITE_SEO_README.md)');
  } catch (err) {
    console.error('❌ Error writing sitemap file:', err.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
