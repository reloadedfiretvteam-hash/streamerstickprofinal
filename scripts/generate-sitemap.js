import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const baseUrl = 'https://streamstickpro.com';

async function generateSitemap() {
  console.log('🚀 Generating comprehensive sitemap...');

  const urls = [];

  urls.push({
    loc: `${baseUrl}/`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0,
    'image:image': {
      'image:loc': `${baseUrl}/hero-image.jpg`,
      'image:title': 'Stream Stick Pro - Premium IPTV Service'
    }
  });

  urls.push({
    loc: `${baseUrl}/shop`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 0.9
  });

  urls.push({
    loc: `${baseUrl}/faq`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.8
  });

  urls.push({
    loc: `${baseUrl}/track-order`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 0.7
  });

  try {
    console.log('📝 Fetching blog posts...');
    const { data: blogs } = await supabase
      .from('blog_posts')
      .select('slug, created_at, view_count')
      .order('created_at', { ascending: false });

    if (blogs) {
      console.log(`✅ Found ${blogs.length} blog posts`);
      blogs.forEach((blog, index) => {
        let priority = 0.8;

        if (index < 10) {
          priority = 0.95;
        } else if (index < 30) {
          priority = 0.9;
        } else if (index < 50) {
          priority = 0.85;
        }

        if ((blog.view_count || 0) > 1000) {
          priority = Math.min(0.95, priority + 0.05);
        }

        urls.push({
          loc: `${baseUrl}/blog/${blog.slug}`,
          lastmod: new Date(blog.created_at).toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: priority
        });
      });
    }
  } catch (error) {
    console.error('❌ Error fetching blog posts:', error);
  }

  try {
    console.log('🛍️ Fetching products...');
    const { data: products } = await supabase
      .from('products')
      .select('id, name, created_at, image_url')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (products) {
      console.log(`✅ Found ${products.length} products`);
      products.forEach(product => {
        const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        urls.push({
          loc: `${baseUrl}/shop#${slug}`,
          lastmod: new Date(product.created_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.85,
          'image:image': product.image_url ? {
            'image:loc': product.image_url,
            'image:title': product.name
          } : undefined
        });
      });
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error);
  }

  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n`;
  const urlsetClose = '</urlset>';

  const urlEntries = urls.map(url => {
    let entry = `  <url>\n`;
    entry += `    <loc>${url.loc}</loc>\n`;
    entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
    entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
    entry += `    <priority>${url.priority.toFixed(2)}</priority>\n`;

    if (url['image:image']) {
      entry += `    <image:image>\n`;
      entry += `      <image:loc>${url['image:image']['image:loc']}</image:loc>\n`;
      if (url['image:image']['image:title']) {
        entry += `      <image:title>${url['image:image']['image:title']}</image:title>\n`;
      }
      entry += `    </image:image>\n`;
    }

    entry += `  </url>\n`;
    return entry;
  }).join('\n');

  const sitemap = xmlHeader + urlsetOpen + urlEntries + urlsetClose;

  const sitemapPath = join(__dirname, '../public/sitemap.xml');
  writeFileSync(sitemapPath, sitemap, 'utf8');

  console.log(`\n✅ Sitemap generated successfully!`);
  console.log(`📊 Total URLs: ${urls.length}`);
  console.log(`📍 Location: public/sitemap.xml`);
  console.log(`🌐 URL: ${baseUrl}/sitemap.xml\n`);

  return { success: true, urlCount: urls.length };
}

generateSitemap().catch(console.error);
