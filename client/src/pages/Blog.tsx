import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { apiCall } from "@/lib/api";
import { 
  Flame, 
  Calendar, 
  Clock, 
  ChevronRight,
  Search,
  Tv,
  Zap,
  Shield,
  Star,
  User,
  BookOpen,
  ExternalLink,
  Monitor,
  Play
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEOSchema, BlogPostSchema } from "@/components/SEOSchema";
import { truncateMetaDescription, truncateTitle } from "@/lib/seo";
import { CORE_INTERNAL_LINKS } from "@/lib/seo-pillar-graph";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  featured: boolean;
  image: string;
  linkedProductIds: string[] | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
}

const categories = ["All", "Guides", "IPTV Services", "Fire Stick Guides", "ONN Devices", "Sports Streaming", "IPTV Apps", "Troubleshooting", "VPN & Security", "Reviews"];

function extractTocHeadings(content: string): string[] {
  const c = content || "";
  const md = Array.from(c.matchAll(/^##\s+(.+)$/gm)).map((m) => (m[1] || "").trim()).filter(Boolean);
  if (md.length) return md.slice(0, 12);
  const html = Array.from(c.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)).map((m) => (m[1] || "").trim()).filter(Boolean);
  return html.slice(0, 12);
}

const CATEGORY_COLORS: Record<string, { from: string; to: string; icon: string }> = {
  "Fire Stick Guides": { from: "from-orange-600", to: "to-red-700", icon: "flame" },
  "IPTV Services": { from: "from-purple-600", to: "to-indigo-700", icon: "tv" },
  "ONN Devices": { from: "from-emerald-600", to: "to-teal-700", icon: "monitor" },
  "Sports Streaming": { from: "from-blue-600", to: "to-cyan-700", icon: "play" },
  "Guides": { from: "from-amber-600", to: "to-orange-700", icon: "book" },
  "IPTV Apps": { from: "from-violet-600", to: "to-purple-700", icon: "zap" },
  "Troubleshooting": { from: "from-rose-600", to: "to-pink-700", icon: "shield" },
  "VPN & Security": { from: "from-green-600", to: "to-emerald-700", icon: "shield" },
  "Reviews": { from: "from-sky-600", to: "to-blue-700", icon: "star" },
  "default": { from: "from-gray-600", to: "to-gray-800", icon: "book" },
};

function getCategoryStyle(cat: string) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS["default"];
}

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const style = getCategoryStyle(category);
  const cn = className || "w-12 h-12";
  switch (style.icon) {
    case "flame": return <Flame className={cn} />;
    case "tv": return <Tv className={cn} />;
    case "monitor": return <Monitor className={cn} />;
    case "play": return <Play className={cn} />;
    case "zap": return <Zap className={cn} />;
    case "shield": return <Shield className={cn} />;
    case "star": return <Star className={cn} />;
    default: return <BookOpen className={cn} />;
  }
}

export default function Blog() {
  const [, setLocation] = useLocation();
  const params = useParams<{ slug?: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiCall("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiCall("/api/blog/posts");
        if (response.ok) {
          const data = await response.json();
          const fetchedPosts = (data.data || []).map((post: any) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category || "Guides",
            readTime: `${Math.ceil((post.content || "").split(" ").length / 200)} min read`,
            date: (post.publishedAt || post.createdAt) ? new Date(post.publishedAt || post.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            featured: post.featured || false,
            image: post.imageUrl || post.image_url || "",
            linkedProductIds: post.linkedProductIds || null
          }));
          setPosts(fetchedPosts);
        }
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
    
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    const baseUrl = 'https://streamstickpro.com';
    const defaultDescription = 'IPTV guides: what you get with 18K+ channels, Fire Stick setup, ONN Google TV, free trial. StreamStick Pro blog—streaming tips and niche guides.';
    const defaultTitle = 'IPTV & Fire Stick Blog 2026 | Guides & Tips | StreamStick Pro';

    if (params.slug && posts.length > 0) {
      const postFromSlug = posts.find(p => p.slug === params.slug);
      if (postFromSlug) {
        setSelectedPost(postFromSlug);
        document.title = truncateTitle(postFromSlug.title);
        const metaDesc = truncateMetaDescription(postFromSlug.excerpt);
        setMetaTag('description', metaDesc);
        setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        const ogTitle = truncateTitle(postFromSlug.title, '');
        setMetaTag('og:title', ogTitle, true);
        setMetaTag('og:description', metaDesc, true);
        setMetaTag('og:url', `${baseUrl}/blog/${postFromSlug.slug}`, true);
        setMetaTag('og:type', 'article', true);
        setMetaTag('og:site_name', 'StreamStick Pro', true);
        const imageUrl = postFromSlug.image && postFromSlug.image.startsWith('http') ? postFromSlug.image : `${baseUrl}/opengraph.jpg`;
        setMetaTag('og:image', imageUrl, true);
        setMetaTag('og:image:width', '1200', true);
        setMetaTag('og:image:height', '630', true);
        setMetaTag('og:image:alt', postFromSlug.title, true);
        setMetaTag('twitter:image', imageUrl);
        setMetaTag('twitter:image:alt', postFromSlug.title);
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', ogTitle);
        setMetaTag('twitter:description', metaDesc);
        setMetaTag('article:published_time', postFromSlug.date, true);
      } else {
        setSelectedPost(null);
        document.title = defaultTitle;
        setMetaTag('description', defaultDescription);
        setMetaTag('og:title', defaultTitle, true);
        setMetaTag('og:description', defaultDescription, true);
        setMetaTag('og:url', `${baseUrl}/blog`, true);
        setMetaTag('og:type', 'website', true);
        setMetaTag('og:image', `${baseUrl}/opengraph.jpg`, true);
        setMetaTag('twitter:title', defaultTitle);
        setMetaTag('twitter:description', defaultDescription);
        setMetaTag('twitter:image', `${baseUrl}/opengraph.jpg`);
        setMetaTag('twitter:card', 'summary_large_image');
      }
    } else {
      setSelectedPost(null);
      document.title = defaultTitle;
      setMetaTag('description', defaultDescription);
      setMetaTag('og:title', defaultTitle, true);
      setMetaTag('og:description', defaultDescription, true);
      setMetaTag('og:url', `${baseUrl}/blog`, true);
      setMetaTag('og:type', 'website', true);
      setMetaTag('og:image', `${baseUrl}/opengraph.jpg`, true);
      setMetaTag('twitter:title', defaultTitle);
      setMetaTag('twitter:description', defaultDescription);
      setMetaTag('twitter:image', `${baseUrl}/opengraph.jpg`);
      setMetaTag('twitter:card', 'summary_large_image');
    }
    
    return () => {
      document.title = "StreamStickPro - Get Fully Loaded Streaming in 10 Minutes";
    };
  }, [params.slug, posts]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = posts.filter(p => p.featured);

  // ═══════════════════════════════════════════════
  // SINGLE BLOG POST VIEW — Professional Layout
  // ═══════════════════════════════════════════════
  if (selectedPost) {
    const quickAnswer = (selectedPost.excerpt || selectedPost.content || '').toString().replace(/<[^>]+>/g, '').trim().slice(0, 200);
    const toc = extractTocHeadings(selectedPost.content || "");
    const catStyle = getCategoryStyle(selectedPost.category);
    const wordCount = (selectedPost.content || "").split(/\s+/).length;

    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">

        {/* ── Site Header — clean, professional, with clear website link ── */}
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 group" aria-label="StreamStickPro Homepage">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg hidden sm:block group-hover:text-orange-500 transition-colors">StreamStickPro</span>
              </a>
              <span className="text-gray-300 dark:text-gray-700 hidden sm:block">|</span>
              <a href="/blog" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block">Blog</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="/shop" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Shop</a>
              <a href="/36hr-trial" className="text-sm px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">Free Trial</a>
              <a href="/" className="text-sm px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-orange-500 font-medium transition-colors flex items-center gap-1.5">
                Visit Website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </header>

        {/* ── Hero Image Area — category-based visual with title overlay ── */}
        <div className={`relative bg-gradient-to-br ${catStyle.from} ${catStyle.to}`}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs px-3 py-1">
                {selectedPost.category}
              </Badge>
              <span className="text-white/70 text-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(selectedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="text-white/70 text-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {selectedPost.readTime}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-4xl">
              {selectedPost.title}
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-3xl leading-relaxed">
              {quickAnswer}{quickAnswer.length >= 190 ? "…" : ""}
            </p>

            {/* Author byline */}
            <div className="mt-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">StreamStickPro Editorial Team</p>
                <p className="text-white/60 text-xs">Updated {new Date(selectedPost.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · {wordCount.toLocaleString()} words</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Article Body ── */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          {/* Table of Contents */}
          {toc.length > 2 && (
            <nav className="mb-10 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800" aria-label="Table of contents">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> In this article
              </h2>
              <ol className="space-y-2">
                {toc.slice(0, 10).map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 mt-0.5 font-mono w-5 text-right flex-shrink-0">{idx + 1}.</span>
                    <button
                      type="button"
                      className="text-sm text-orange-600 dark:text-orange-400 hover:underline text-left leading-snug"
                      onClick={() => {
                        const container = document.querySelector('[data-testid="text-blog-content"]');
                        const els = container ? Array.from(container.querySelectorAll('h2')) : [];
                        const el = els[idx] as HTMLElement | undefined;
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      {h}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Featured image if exists */}
          {selectedPost.image && selectedPost.image.startsWith('http') && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title}
                className="w-full h-auto max-h-[450px] object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Article content */}
          <article 
            className="prose prose-lg dark:prose-invert max-w-none mb-14"
            style={{
              fontSize: 'clamp(17px, 3.5vw, 19px)',
              lineHeight: '1.85',
              letterSpacing: '0.01em',
            }}
            dangerouslySetInnerHTML={{ 
              __html: selectedPost.content
                .replace(/\n\n/g, "</p><p style='margin-bottom: 1.25rem;'>")
                .replace(/\*\*(.+?)\*\*/g, "<strong style='font-weight: 700;'>$1</strong>")
                .replace(/^- (.+)$/gm, "<li style='margin-left: 1.25rem; margin-bottom: 0.5rem; padding-left: 0.5rem;'>$1</li>")
                .replace(/^# (.+)$/gm, "<h2 style='font-size: 1.75rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1.3; border-bottom: 2px solid rgba(249,115,22,0.2); padding-bottom: 0.5rem;'>$1</h2>")
                .replace(/^## (.+)$/gm, "<h2 style='font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; line-height: 1.4;'>$1</h2>")
                .replace(/^### (.+)$/gm, "<h3 style='font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; line-height: 1.4;'>$1</h3>")
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' style='color: #ea580c; text-decoration: underline; text-underline-offset: 3px;'>$1</a>")
            }}
            data-testid="text-blog-content"
          />

          {/* ── Inline CTA — natural-looking, not spammy ── */}
          <div className="my-12 p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                <Flame className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Ready to start streaming?</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  StreamStickPro offers pre-configured Fire Sticks with 18,000+ live channels. Free 36-hour trial, no credit card required.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <a href="/" className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors text-center flex-1 sm:flex-none">
                  Visit Website
                </a>
                <a href="/36hr-trial" className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-orange-500 font-semibold text-sm transition-colors text-center flex-1 sm:flex-none">
                  Free Trial
                </a>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm">
            <a href="/" className="px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> StreamStickPro.com
            </a>
            <a href="/blog" className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-orange-500 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">All Articles</a>
            <a href="/shop" className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-orange-500 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">Shop</a>
            <a href="/36hr-trial" className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:border-green-500 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors">Free Trial</a>
          </div>

          {/* Article schema for SEO */}
          <BlogPostSchema
            title={selectedPost.title}
            description={selectedPost.excerpt || selectedPost.content?.slice(0, 160) || "StreamStickPro blog guide."}
            datePublished={selectedPost.date}
            dateModified={selectedPost.date}
            image={selectedPost.image || "https://streamstickpro.com/opengraph.jpg"}
          />
          {selectedPost.linkedProductIds && selectedPost.linkedProductIds.length > 0 && (
            <SEOSchema 
              products={products
                .filter(p => selectedPost.linkedProductIds?.includes(p.id))
                .map(p => ({
                  name: p.name,
                  description: p.description || selectedPost.excerpt,
                  price: p.price,
                  image: p.imageUrl ?? undefined,
                  availability: 'InStock' as const,
                  brand: 'StreamStickPro',
                  sku: p.id
                }))}
            />
          )}

          {/* Related Products */}
          {(() => {
            const linkedProducts = selectedPost.linkedProductIds && selectedPost.linkedProductIds.length > 0
              ? products.filter(p => selectedPost.linkedProductIds?.includes(p.id))
              : products.slice(0, 3);
            
            if (linkedProducts.length === 0) return null;

            return (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-10 mt-10" data-testid="section-related-products">
                <h2 className="text-xl font-bold mb-6">Related Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedProducts.map(product => (
                    <a
                      key={product.id}
                      href="/shop"
                      className="block p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-orange-500 transition-all hover:shadow-md group"
                      data-testid={`card-related-product-${product.id}`}
                    >
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {product.category === 'firestick' ? 'StreamStick' : 'Live TV'}
                      </Badge>
                      <p className="font-semibold group-hover:text-orange-500 transition-colors">{product.name}</p>
                      <p className="text-xl font-bold text-orange-500 mt-2">${(product.price / 100).toFixed(2)}</p>
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Footer ── */}
        <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-white" />
              </div>
              <span>© 2026 StreamStickPro. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="hover:text-orange-500 transition-colors">Home</a>
              <a href="/shop" className="hover:text-orange-500 transition-colors">Shop</a>
              <a href="/blog" className="hover:text-orange-500 transition-colors">Blog</a>
              <a href="/privacy" className="hover:text-orange-500 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-orange-500 transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // BLOG LISTING PAGE — Professional Grid Layout
  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* ── Site Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 group" aria-label="StreamStickPro Homepage">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg group-hover:text-orange-500 transition-colors">StreamStickPro</span>
            </a>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="text-sm font-medium text-gray-500">Blog</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/shop" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block">Shop</a>
            <a href="/36hr-trial" className="text-sm px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors">Free Trial</a>
            <a href="/" className="text-sm px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:border-orange-500 text-gray-700 dark:text-gray-300 hover:text-orange-500 font-medium transition-colors flex items-center gap-1.5">
              Visit Website <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "IPTV & Fire Stick Blog | StreamStick Pro",
        "description": "What you get with IPTV: 18K+ channels, Fire Stick setup, ONN Google TV, free trial. Niche guides and streaming tips from StreamStick Pro.",
        "url": "https://streamstickpro.com/blog",
        "blogPost": posts.slice(0, 50).map(post => ({
          "@type": "BlogPosting",
          "headline": post.title,
          "description": (post.excerpt || '').slice(0, 160),
          "datePublished": post.date,
          "author": { "@type": "Organization", "name": "StreamStick Pro" }
        }))
      }) }} />

      {/* ── Hero Section ── */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-orange-950 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <Badge className="mb-4 bg-orange-500/20 text-orange-300 border-orange-500/30">Updated February 2026</Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            IPTV & Fire Stick Blog
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Expert guides on IPTV, jailbroken Fire Sticks, ONN Google TV, cord-cutting, and streaming. 
            Trusted by thousands of cord-cutters.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="/" className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors">
              Visit StreamStickPro.com
            </a>
            <a href="/shop" className="px-6 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-white font-medium text-sm transition-colors">
              Shop Products
            </a>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2" data-testid="section-core-guides">
        <div className="rounded-2xl border border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-950/20 p-4 sm:p-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Core money guides</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Start with these high-intent pages for plans, devices, and setup help.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {CORE_INTERNAL_LINKS.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="block rounded-lg border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900 px-3 py-2 hover:border-orange-400 dark:hover:border-orange-500 transition-colors"
              >
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">{item.label}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.keyword}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search & Filters ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl h-11"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? "bg-orange-500 text-white shadow-md" 
                  : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
              }`}
              data-testid={`button-category-${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Posts Grid ── */}
        {loading ? (
          <div className="text-center py-20" data-testid="text-loading">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20" data-testid="text-no-matching-posts">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No articles found. Try a different search or category.</p>
          </div>
        ) : (
          <>
            {/* Featured posts — large cards */}
            {activeCategory === "All" && featuredPosts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" /> Featured
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.slice(0, 4).map(post => {
                    const pStyle = getCategoryStyle(post.category);
                    return (
                      <a
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        onClick={(e) => { e.preventDefault(); setLocation(`/blog/${post.slug}`); }}
                        className="group block rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-orange-500 transition-all hover:shadow-xl"
                        data-testid={`card-featured-post-${post.id}`}
                      >
                        <div className={`h-44 bg-gradient-to-br ${pStyle.from} ${pStyle.to} relative flex items-center justify-center`}>
                          <div className="absolute inset-0 bg-black/20" />
                          <CategoryIcon category={post.category} className="w-16 h-16 text-white/30" />
                          {post.image && post.image.startsWith('http') && (
                            <img src={post.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                            <span className="text-xs text-gray-400">{post.date}</span>
                          </div>
                          <h3 className="text-lg font-bold group-hover:text-orange-500 transition-colors line-clamp-2 mb-2">{post.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                            <span className="text-orange-500 font-medium group-hover:underline">Read article →</span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All posts — compact card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.slice(0, 60).map(post => {
                const pStyle = getCategoryStyle(post.category);
                return (
                  <a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    onClick={(e) => { e.preventDefault(); setLocation(`/blog/${post.slug}`); }}
                    className="group block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-orange-500 transition-all hover:shadow-lg"
                    data-testid={`card-blog-post-${post.id}`}
                  >
                    <div className={`h-32 bg-gradient-to-br ${pStyle.from} ${pStyle.to} relative flex items-center justify-center`}>
                      <CategoryIcon category={post.category} className="w-10 h-10 text-white/25" />
                      {post.image && post.image.startsWith('http') && (
                        <img src={post.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                        <span className="text-xs text-gray-400">{post.readTime}</span>
                      </div>
                      <h3 className="font-bold text-sm group-hover:text-orange-500 transition-colors line-clamp-2 mb-1">{post.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {filteredPosts.length > 60 && (
              <div className="text-center mt-8">
                <p className="text-sm text-gray-500">Showing 60 of {filteredPosts.length} articles. Use search or filters to find specific topics.</p>
              </div>
            )}
          </>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-gray-900 to-orange-950 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Cut the Cord?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Join thousands of cord-cutters streaming 18,000+ channels. Pre-configured Fire Sticks, free trial, 24/7 support.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/" className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-colors">
              Visit StreamStickPro.com
            </a>
            <a href="/36hr-trial" className="px-8 py-3 rounded-xl border border-white/20 hover:border-white/40 text-white font-medium text-sm transition-colors">
              Start Free Trial
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-white" />
            </div>
            <span>© 2026 StreamStickPro. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="hover:text-orange-500 transition-colors">Home</a>
            <a href="/shop" className="hover:text-orange-500 transition-colors">Shop</a>
            <a href="/blog" className="hover:text-orange-500 transition-colors">Blog</a>
            <a href="/privacy" className="hover:text-orange-500 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-orange-500 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
