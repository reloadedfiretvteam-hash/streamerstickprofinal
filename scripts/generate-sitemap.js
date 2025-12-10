/**
 * Generate sitemap.xml from Supabase blog posts
 * 
 * This script:
 * 1. Discovers the blog table (tries: blogPosts, blog_posts, blogposts, blogs)
 * 2. Fetches published posts from Supabase
 * 3. Generates a sitemap.xml file with blog post URLs
 * 4. Writes to client/public/sitemap.xml (or public/sitemap.xml)
 * 
 * Required environment variables:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_KEY: Supabase key (service_role recommended for complete access)
 * - SITE_BASE_URL: Your site's base URL (e.g., https://streamstickpro.com)
 * 
 * Usage:
 *   SUPABASE_URL=xxx SUPABASE_KEY=xxx SITE_BASE_URL=https://streamstickpro.com npm run generate-sitemap
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://streamstickpro.com';

// Candidate table names to try
const CANDIDATE_TABLES = ['blogPosts', 'blog_posts', 'blogposts', 'blogs'];

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Required: SUPABASE_URL, SUPABASE_KEY');
  console.error('   Optional: SITE_BASE_URL (default: https://streamstickpro.com)');
  console.error('');
  console.error('Usage:');
  console.error('  SUPABASE_URL=xxx SUPABASE_KEY=xxx npm run generate-sitemap');
  process.exit(1);
}

/**
 * Discover which blog table exists and fetch published posts
 */
async function fetchBlogPosts(client) {
  for (const tableName of CANDIDATE_TABLES) {
    try {
      console.log(`🔍 Trying table: ${tableName}...`);
      
      const { data, error } = await client
        .from(tableName)
        .select('id, slug, title, createdAt, updatedAt, published')
        .eq('published', true)
        .order('createdAt', { ascending: false });
      
      if (!error && data && data.length > 0) {
        console.log(`✅ Found ${data.length} published posts in table: ${tableName}`);
        return { posts: data, tableName };
      } else if (!error && data) {
        console.log(`⚠️  Table ${tableName} exists but has no published posts`);
        return { posts: [], tableName };
      }
    } catch (err) {
      console.log(`   Table ${tableName} not accessible: ${err.message}`);
    }
  }
  
  throw new Error(`No blog table found. Tried: ${CANDIDATE_TABLES.join(', ')}`);
}

/**
 * Generate XML sitemap content
 */
function generateSitemapXML(posts, baseUrl) {
  const now = new Date().toISOString().split('T')[0];
  
  // Static pages
  const staticUrls = [
    { loc: baseUrl, priority: '1.0', changefreq: 'weekly' },
    { loc: `${baseUrl}/blog`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/checkout`, priority: '0.8', changefreq: 'monthly' },
  ];
  
  // Blog post URLs
  const blogUrls = posts.map(post => {
    const slug = post.slug || post.id;
    const lastmod = post.updatedAt || post.createdAt || now;
    const formattedDate = new Date(lastmod).toISOString().split('T')[0];
    
    return {
      loc: `${baseUrl}/blog/${slug}`,
      lastmod: formattedDate,
      priority: '0.8',
      changefreq: 'monthly'
    };
  });
  
  const allUrls = [...staticUrls, ...blogUrls];
  
  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : `<lastmod>${now}</lastmod>`}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  
  return xml;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Sitemap Generator');
  console.log('==================');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🌐 Site Base URL: ${SITE_BASE_URL}`);
  console.log('');
  
  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  // Fetch blog posts
  console.log('📥 Fetching blog posts...');
  const { posts, tableName } = await fetchBlogPosts(supabase);
  
  // Generate sitemap
  console.log('');
  console.log('📝 Generating sitemap...');
  const sitemapXML = generateSitemapXML(posts, SITE_BASE_URL);
  
  // Determine output path - try client/public first, then public
  const possiblePaths = [
    resolve(__dirname, '../client/public/sitemap.xml'),
    resolve(__dirname, '../public/sitemap.xml'),
  ];
  
  let outputPath = null;
  for (const path of possiblePaths) {
    const dir = dirname(path);
    if (existsSync(dir)) {
      outputPath = path;
      break;
    }
  }
  
  if (!outputPath) {
    // Create client/public directory if it doesn't exist
    const defaultPath = possiblePaths[0];
    const dir = dirname(defaultPath);
    console.log(`📁 Creating directory: ${dir}`);
    mkdirSync(dir, { recursive: true });
    outputPath = defaultPath;
  }
  
  // Write sitemap
  writeFileSync(outputPath, sitemapXML, 'utf8');
  
  // Summary
  console.log('');
  console.log('✅ Sitemap generated successfully!');
  console.log('================================');
  console.log(`📊 Statistics:`);
  console.log(`   - Blog table: ${tableName}`);
  console.log(`   - Blog posts: ${posts.length}`);
  console.log(`   - Static pages: 3`);
  console.log(`   - Total URLs: ${posts.length + 3}`);
  console.log(`📄 Output: ${outputPath}`);
  console.log('');
  console.log('📌 Next steps:');
  console.log('   1. Commit and push the sitemap.xml file');
  console.log('   2. Deploy to Cloudflare Pages (automatic on push)');
  console.log('   3. Submit sitemap to search engines:');
  console.log(`      - Google: https://search.google.com/search-console`);
  console.log(`      - Bing: https://www.bing.com/webmasters`);
  console.log('   4. Verify sitemap is accessible: ' + SITE_BASE_URL + '/sitemap.xml');
  console.log('');
}

// Run main function
main().catch(err => {
  console.error('');
  console.error('❌ Error generating sitemap:', err.message);
  console.error('');
  process.exit(1);
});
