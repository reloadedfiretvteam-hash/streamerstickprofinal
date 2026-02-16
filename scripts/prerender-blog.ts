import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://streamstickpro.com";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured: boolean;
  published: boolean;
  createdAt?: string;
  keywords?: string[];
  metaDescription?: string;
}

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugifyAnchor(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/&amp;|&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function renderMarkdownLite(raw: string): { html: string; toc: { id: string; text: string }[] } {
  const lines = (raw || '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  const toc: { id: string; text: string }[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    const text = buf.join(' ').trim();
    if (!text) return;
    const p = escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" class="text-orange-400 hover:underline">$1</a>');
    out.push(`<p>${p}</p>`);
  };

  while (i < lines.length) {
    const line = lines[i].trimEnd();
    const t = line.trim();
    if (!t) {
      i++;
      continue;
    }

    // Headings
    const h3 = t.match(/^###\s+(.+)/);
    const h2 = t.match(/^##\s+(.+)/);
    const h1 = t.match(/^#\s+(.+)/);
    const heading = (h2 || h3 || h1)?.[1];
    if (heading) {
      const id = slugifyAnchor(heading);
      const safe = escapeHtml(heading);
      const level = h3 ? 3 : 2; // avoid multiple H1 inside article
      if (level === 2) toc.push({ id, text: heading });
      out.push(`<h${level} id="${id}" class="scroll-mt-24">${safe}</h${level}>`);
      i++;
      continue;
    }

    // Bullet list
    if (/^- /.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^- /, ''));
        i++;
      }
      const lis = items
        .map((x) => `<li>${escapeHtml(x).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`)
        .join('');
      out.push(`<ul>${lis}</ul>`);
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(t)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      const lis = items
        .map((x) => `<li>${escapeHtml(x).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</li>`)
        .join('');
      out.push(`<ol>${lis}</ol>`);
      continue;
    }

    // Paragraph (collect until blank line)
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      buf.push(lines[i].trim());
      i++;
    }
    flushParagraph(buf);
  }

  return { html: out.join('\n'), toc };
}

async function fetchBlogPosts(): Promise<BlogPost[]> {
  // Build-time Supabase config for prerendering.
  // Prefer env vars; fall back to the public anon key (safe, but env looks cleaner in repo).
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://emlqlmfzqsnqokrqvmcm.supabase.co";
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg";
  
  console.log(`   Using Supabase URL: ${supabaseUrl.substring(0, 40)}...`);

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });
    
    if (error) {
      console.error("Supabase error:", error.message);
      return [];
    }
    
    return (posts || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category || "Guides",
      featured: post.featured || false,
      published: post.is_published || true,
      createdAt: post.published_at || new Date().toISOString(),
      keywords: post.keywords || [],
      metaDescription: post.meta_description || post.excerpt || "",
    }));
  } catch (err: any) {
    console.error("Failed to fetch blog posts:", err.message);
    return [];
  }
}

function generateBlogPostHTML(post: BlogPost, cssPath: string, jsPath: string): string {
  const title = post.title || "Blog Post";
  const descriptionRaw = post.metaDescription || post.excerpt || `Read about ${title} on StreamStickPro`;
  const description = escapeHtml(descriptionRaw).slice(0, 160);
  const keywords = post.keywords?.join(", ") || "fire stick, iptv, streaming, cord cutting";
  const date = post.createdAt || new Date().toISOString();
  const readTime = Math.ceil((post.content || "").split(" ").length / 200);
  const updated = new Date(date).toISOString();
  
  // Mid-article product advertisement (proper HTML - not inside <p>)
  const midArticleAd = `<div class="my-8 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30">
      <div class="flex flex-col md:flex-row items-center gap-4">
        <div class="flex-1 text-center md:text-left">
          <h4 class="text-lg font-bold text-orange-400">Limited Time Offer!</h4>
          <p class="text-gray-300 text-sm">Fire Sticks with 1 Year Live TV - Starting at just $130</p>
        </div>
        <a href="/?section=shop" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg whitespace-nowrap">
          Shop Now →
        </a>
      </div>
    </div>`;
  
  const rendered = renderMarkdownLite(post.content || "");
  // Insert ad after first chunk (keeps HTML valid)
  const parts = rendered.html.split('\n');
  const cleanContent = parts.length > 6 ? [...parts.slice(0, 6), midArticleAd, ...parts.slice(6)].join('\n') : rendered.html;

  const tocHtml =
    rendered.toc.length > 2
      ? `<div class="my-8 p-5 rounded-xl border border-white/10 bg-gray-800/40">
          <h2 class="text-lg font-bold mb-3">On this page</h2>
          <ul class="text-sm text-gray-300 space-y-2">
            ${rendered.toc
              .slice(0, 10)
              .map((h) => `<li><a class="text-orange-400 hover:underline" href="#${escapeHtml(h.id)}">${escapeHtml(h.text)}</a></li>`)
              .join('')}
          </ul>
        </div>`
      : '';

  const quickAnswer = `<div class="my-8 p-6 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-600/15 to-red-600/10">
      <div class="flex items-start gap-3">
        <div class="text-2xl">⚡</div>
        <div class="flex-1">
          <div class="text-sm text-orange-300 font-semibold mb-1">Quick answer (30 seconds)</div>
          <p class="text-gray-200">${description}</p>
          <div class="mt-4 flex flex-wrap gap-3">
            <a href="/36hr-trial" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg">Start Free Trial →</a>
            <a href="/shop" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-5 rounded-lg">Shop Plans →</a>
          </div>
        </div>
      </div>
    </div>`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "datePublished": date,
    "dateModified": date,
    "author": { "@type": "Organization", "name": "StreamStickPro", "url": SITE_URL },
    "publisher": { "@type": "Organization", "name": "StreamStickPro", "logo": { "@type": "ImageObject", "url": `${SITE_URL}/favicon.png` } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    "keywords": keywords,
    "inLanguage": "en-US"
  });

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${SITE_URL}/blog` },
      { "@type": "ListItem", "position": 3, "name": title, "item": `${SITE_URL}/blog/${post.slug}` }
    ]
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | StreamStickPro Blog</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE_URL}/blog/${post.slug}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${SITE_URL}/blog/${post.slug}">
  <meta property="og:image" content="${SITE_URL}/opengraph.jpg">
  <meta property="og:site_name" content="StreamStickPro">
  <meta property="article:published_time" content="${date}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${SITE_URL}/opengraph.jpg">
  
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="stylesheet" href="${cssPath}">
  <script type="application/ld+json">${jsonLd}</script>
  <script type="application/ld+json">${breadcrumbLd}</script>
</head>
<body class="bg-gray-900 text-white">
  <div id="root">
    <header class="bg-gray-900 border-b border-white/10 px-4 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" class="flex items-center gap-2 text-xl font-bold text-orange-500">StreamStickPro</a>
        <nav class="flex gap-4">
          <a href="/?section=shop" class="text-gray-300 hover:text-white">Shop</a>
          <a href="/blog" class="text-gray-300 hover:text-white">Blog</a>
        </nav>
      </div>
    </header>
    
    <main class="max-w-4xl mx-auto px-4 py-12">
      <article>
        <a href="/blog" class="text-orange-500 hover:text-orange-400 mb-4 inline-block">&larr; Back to Blog</a>
        <h1 class="text-3xl md:text-4xl font-bold mb-4">${title}</h1>
        <div class="flex items-center gap-4 text-gray-400 mb-8">
          <span>${new Date(date).toLocaleDateString()}</span>
          <span>${readTime} min read</span>
          <span class="bg-orange-600/20 text-orange-400 px-2 py-1 rounded text-sm">${post.category || "Guides"}</span>
        </div>
        <div class="p-4 rounded-xl border border-white/10 bg-gray-800/30 mb-8">
          <div class="text-sm text-gray-300">
            <strong>By StreamStickPro Editorial Team</strong> • Updated <time datetime="${updated}">${new Date(updated).toLocaleDateString()}</time>
          </div>
          <div class="text-xs text-gray-400 mt-2">
            Want help choosing a plan? <a class="text-orange-400 hover:underline" href="/36hr-trial">Start a free trial</a> or <a class="text-orange-400 hover:underline" href="/shop">shop plans</a>.
          </div>
        </div>
        ${quickAnswer}
        ${tocHtml}
        <div class="prose prose-invert max-w-none">
          ${cleanContent}
        </div>
        
        <div class="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <h3 class="text-lg font-bold mb-2">Related guides</h3>
          <p class="text-gray-400 text-sm mb-3">Explore more from StreamStickPro:</p>
          <ul class="flex flex-wrap gap-3">
            <li><a href="/iptv-services" class="text-orange-400 hover:underline">IPTV Services</a></li>
            <li><a href="/jailbroken-fire-sticks" class="text-orange-400 hover:underline">Jailbroken Fire Sticks</a></li>
            <li><a href="/iptv-firestick" class="text-orange-400 hover:underline">IPTV for Fire Stick</a></li>
            <li><a href="/shop" class="text-orange-400 hover:underline">Shop</a></li>
          </ul>
        </div>
        <div class="mt-12 p-6 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl border border-orange-500/30">
          <h3 class="text-xl font-bold mb-2">Ready to Cut the Cord?</h3>
          <p class="text-gray-300 mb-4">Get streaming in 10 minutes with our pre-configured Fire Sticks and IPTV subscriptions.</p>
          <a href="/?section=shop" class="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg">
            Shop Now
          </a>
        </div>
      </article>
    </main>
    
    <footer class="bg-gray-900 border-t border-white/10 py-8 mt-12">
      <div class="max-w-6xl mx-auto px-4 text-center text-gray-400">
        <p>&copy; ${new Date().getFullYear()} StreamStickPro. All rights reserved.</p>
        <div class="mt-4 flex flex-wrap justify-center gap-4">
          <a href="/" class="hover:text-orange-400">Home</a>
          <a href="/shop" class="hover:text-orange-400">Shop</a>
          <a href="/iptv-services" class="hover:text-orange-400">IPTV Services</a>
          <a href="/jailbroken-fire-sticks" class="hover:text-orange-400">Jailbroken Fire Sticks</a>
          <a href="/blog" class="hover:text-orange-400">Blog</a>
        </div>
      </div>
    </footer>
  </div>
  <script type="module" src="${jsPath}"></script>
</body>
</html>`;
}

function generateBlogIndexHTML(posts: BlogPost[], cssPath: string, jsPath: string): string {
  const postCards = posts.slice(0, 20).map(post => `
    <a href="/blog/${post.slug}" class="block bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors border border-gray-700 hover:border-orange-500">
      <span class="bg-orange-600/20 text-orange-400 px-2 py-1 rounded text-xs">${post.category || "Guides"}</span>
      <h2 class="text-xl font-bold mt-2 mb-2">${post.title}</h2>
      <p class="text-gray-400 text-sm mb-4">${post.excerpt || ""}</p>
      <span class="text-orange-500 text-sm">Read more &rarr;</span>
    </a>
  `).join("\n");

  const lastUpdated = posts[0]?.createdAt ? new Date(posts[0].createdAt).toISOString() : new Date().toISOString();

  const blogLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "StreamStickPro Blog",
    "description": "Guides on IPTV, Fire Stick setup, ONN Google TV, and cord cutting.",
    "url": `${SITE_URL}/blog`,
    "publisher": { "@type": "Organization", "name": "StreamStickPro", "url": SITE_URL }
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog | StreamStickPro - Cord Cutting Guides & Fire Stick Tips</title>
  <meta name="description" content="Expert guides on jailbroken Fire Sticks, IPTV streaming, cord cutting, and saving money on TV. Learn how to stream sports, movies, and TV shows.">
  <meta name="keywords" content="fire stick, iptv, cord cutting, streaming guides, jailbroken fire stick">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${SITE_URL}/blog">
  
  <meta property="og:type" content="website">
  <meta property="og:title" content="StreamStickPro Blog - Cord Cutting Guides">
  <meta property="og:description" content="Expert guides on Fire Sticks, IPTV, and cord cutting.">
  <meta property="og:url" content="${SITE_URL}/blog">
  <meta property="og:image" content="${SITE_URL}/opengraph.jpg">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="StreamStickPro Blog">
  <meta name="twitter:description" content="Expert guides on Fire Sticks, IPTV, and cord cutting.">
  
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="stylesheet" href="${cssPath}">
  <script type="application/ld+json">${blogLd}</script>
</head>
<body class="bg-gray-900 text-white">
  <div id="root">
    <header class="bg-gray-900 border-b border-white/10 px-4 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" class="flex items-center gap-2 text-xl font-bold text-orange-500">StreamStickPro</a>
        <nav class="flex gap-4">
          <a href="/?section=shop" class="text-gray-300 hover:text-white">Shop</a>
          <a href="/blog" class="text-orange-500">Blog</a>
        </nav>
      </div>
    </header>
    
    <main class="max-w-6xl mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold mb-2">StreamStickPro Blog</h1>
      <p class="text-gray-400 mb-8">Expert guides on cord cutting, Fire Sticks, and IPTV streaming</p>

      <div class="mb-10 p-6 rounded-xl border border-white/10 bg-gray-800/30">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="text-sm text-gray-300">
              <strong>By StreamStickPro Editorial Team</strong> • Updated <time datetime="${lastUpdated}">${new Date(lastUpdated).toLocaleDateString()}</time>
            </div>
            <div class="text-gray-400 text-sm mt-2 max-w-2xl">
              If you’re new: start with <a class="text-orange-400 hover:underline" href="/36hr-trial">the free trial</a>, then read the guides below to pick the best setup.
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <a href="/36hr-trial" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg">Start Free Trial →</a>
            <a href="/shop" class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-5 rounded-lg">Shop Plans →</a>
            <a href="/iptv-services" class="border border-orange-500/40 text-orange-300 hover:text-white hover:border-orange-400 font-semibold py-2 px-5 rounded-lg">IPTV Services</a>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${postCards}
      </div>
      
      <div class="mt-12 text-center">
        <p class="text-gray-400 mb-4">Showing ${Math.min(20, posts.length)} of ${posts.length} articles</p>
      </div>
    </main>
    
    <footer class="bg-gray-900 border-t border-white/10 py-8 mt-12">
      <div class="max-w-6xl mx-auto px-4 text-center text-gray-400">
        <p>&copy; ${new Date().getFullYear()} StreamStickPro. All rights reserved.</p>
      </div>
    </footer>
  </div>
  <script type="module" src="${jsPath}"></script>
</body>
</html>`;
}

function generateSitemap(posts: BlogPost[]): string {
  const today = new Date().toISOString().split("T")[0];
  
  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "weekly" },
    { url: "/blog", priority: "0.9", changefreq: "daily" },
    // Do not include checkout in sitemap (noindex + disallowed)
    { url: "/locations", priority: "0.85", changefreq: "daily" },
  ];
  
  const staticUrls = staticPages.map(page => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("");
  
  const blogUrls = posts.map(post => {
    const date = post.createdAt ? new Date(post.createdAt).toISOString().split("T")[0] : today;
    return `
  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join("");
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${blogUrls}
</urlset>`;
}

function generateRobotsTxt(): string {
  // IMPORTANT: This file is what production serves (/_routes.json excludes /robots.txt from the Worker).
  // It must point to the LIVE sitemap index (which includes /l/* location pages) and must not list noindex pages.
  return `# StreamStickPro - robots.txt
# Allow Googlebot/Bingbot; no Crawl-delay (Google ignores it; it can slow Bing).

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /admin/
Disallow: /shadow-services
Disallow: /checkout
Disallow: /success
Disallow: /cancel

# Sitemaps (index + full)
Sitemap: ${SITE_URL}/sitemap-index.xml
Sitemap: ${SITE_URL}/sitemap.xml
`;
}

async function findAssetPaths(distDir: string): Promise<{ css: string; js: string }> {
  const { readdir } = await import("fs/promises");
  const assetsDir = path.join(distDir, "assets");
  
  try {
    const files = await readdir(assetsDir);
    const cssFile = files.find(f => f.endsWith(".css")) || "index.css";
    const jsFile = files.find(f => f.startsWith("index-") && f.endsWith(".js")) || "index.js";
    
    return {
      css: `/assets/${cssFile}`,
      js: `/assets/${jsFile}`,
    };
  } catch {
    return { css: "/assets/index.css", js: "/assets/index.js" };
  }
}

async function main() {
  console.log("🔄 Starting blog prerender...");
  
  const distDir = path.resolve(process.cwd(), "dist");
  const blogDir = path.join(distDir, "blog");
  
  // Fetch blog posts from Supabase
  console.log("📥 Fetching blog posts from Supabase...");
  const posts = await fetchBlogPosts();
  console.log(`   Found ${posts.length} published posts`);
  
  if (posts.length === 0) {
    console.warn("⚠️ No blog posts found, skipping prerender");
    return;
  }
  
  // Find CSS/JS asset paths
  const assets = await findAssetPaths(distDir);
  console.log(`   Using CSS: ${assets.css}, JS: ${assets.js}`);
  
  // Create blog directory
  await mkdir(blogDir, { recursive: true });
  
  // Generate blog index page
  console.log("📝 Generating blog index page...");
  const indexHtml = generateBlogIndexHTML(posts, assets.css, assets.js);
  await writeFile(path.join(blogDir, "index.html"), indexHtml);
  
  // Generate individual blog post pages
  console.log("📝 Generating individual blog post pages...");
  for (const post of posts) {
    if (!post.slug) continue;
    
    const postDir = path.join(blogDir, post.slug);
    await mkdir(postDir, { recursive: true });
    
    const postHtml = generateBlogPostHTML(post, assets.css, assets.js);
    await writeFile(path.join(postDir, "index.html"), postHtml);
  }
  console.log(`   Generated ${posts.length} blog post pages`);
  
  // Generate sitemap
  console.log("🗺️ Generating sitemap.xml...");
  const sitemap = generateSitemap(posts);
  await writeFile(path.join(distDir, "sitemap.xml"), sitemap);
  console.log(`   Sitemap includes ${posts.length + 3} URLs`);
  
  // Generate robots.txt
  console.log("🤖 Generating robots.txt...");
  const robotsTxt = generateRobotsTxt();
  await writeFile(path.join(distDir, "robots.txt"), robotsTxt);
  
  console.log("✅ Blog prerender complete!");
  console.log(`   - Blog index: ${blogDir}/index.html`);
  console.log(`   - Blog posts: ${posts.length} pages`);
  console.log(`   - Sitemap: ${distDir}/sitemap.xml`);
  console.log(`   - Robots: ${distDir}/robots.txt`);
}

main().catch(err => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
