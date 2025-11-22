import { supabase } from '../lib/supabase';

interface SitemapURL {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export async function generateSitemap(): Promise<string> {
  const baseUrl = 'https://streamstickpro.com';
  const urls: SitemapURL[] = [];

  urls.push({
    loc: `${baseUrl}/`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0
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
    priority: 0.8
  });

  try {
    const { data: blogs } = await supabase
      .from('blog_posts')
      .select('slug, created_at, view_count')
      .order('created_at', { ascending: false });

    if (blogs) {
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
    console.error('Error fetching blog posts:', error);
  }

  try {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, updated_at, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (products) {
      products.forEach(product => {
        const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        urls.push({
          loc: `${baseUrl}/products/${slug}`,
          lastmod: (product.updated_at || product.created_at).split('T')[0],
          changefreq: 'weekly',
          priority: 0.8
        });
      });
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';
  const urlsetClose = '</urlset>';

  const urlEntries = urls.map(url => {
    return `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>\n`;
  }).join('\n');

  return xmlHeader + urlsetOpen + urlEntries + urlsetClose;
}

export async function updateSitemapTimestamp(): Promise<void> {
  try {
    await supabase.rpc('update_sitemap_timestamp');
  } catch (error) {
    console.error('Error updating sitemap timestamp:', error);
  }
}

export function getSitemapMetadata(): string {
  const today = new Date().toISOString().split('T')[0];
  return `
<!-- Sitemap Auto-Generated: ${today} -->
<!-- Total URLs: Dynamic count based on published content -->
<!-- Search Engines Supported: Google, Bing, Yahoo, Yandex, Baidu -->
`;
}
