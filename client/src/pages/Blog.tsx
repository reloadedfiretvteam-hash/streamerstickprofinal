import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { apiCall } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  Flame, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  ChevronRight,
  Search,
  Tv,
  Zap,
  Shield,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

const categories = ["All", "Guides", "Savings", "How-To", "Sports", "Reviews", "Support", "Streaming"];

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
            date: post.createdAt ? new Date(post.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            featured: post.featured || false,
            image: "/api/placeholder/800/400",
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
    
    if (params.slug && posts.length > 0) {
      const postFromSlug = posts.find(p => p.slug === params.slug);
      if (postFromSlug) {
        setSelectedPost(postFromSlug);
        document.title = `${postFromSlug.title} | StreamStickPro Blog`;
      } else {
        setSelectedPost(null);
        document.title = "Blog | StreamStickPro - Cord Cutting Guides & Tips";
      }
    } else {
      setSelectedPost(null);
      document.title = "Blog | StreamStickPro - Cord Cutting Guides & Tips";
    }
    
    return () => {
      document.title = "StreamStickPro - Jailbroken Fire Sticks & IPTV";
    };
  }, [params.slug, posts]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = posts.filter(p => p.featured);

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": selectedPost.title,
          "description": selectedPost.excerpt,
          "datePublished": selectedPost.date,
          "author": { "@type": "Organization", "name": "StreamStickPro" },
          "articleBody": selectedPost.content
        }) }} />
        
        <nav className="border-b border-gray-800 sticky top-0 z-10 bg-gray-900/95 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedPost(null);
                setLocation("/blog");
              }}
              className="text-gray-400 hover:text-white"
              data-testid="button-back-to-blog"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold truncate" data-testid="text-blog-title">{selectedPost.title}</h1>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-8 flex-wrap">
            <span className="flex items-center gap-1" data-testid="text-publish-date">
              <Calendar className="w-4 h-4" />
              {new Date(selectedPost.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1" data-testid="text-read-time">
              <Clock className="w-4 h-4" />
              {selectedPost.readTime}
            </span>
            <Badge variant="secondary" data-testid="badge-category">{selectedPost.category}</Badge>
          </div>

          <div 
            className="prose prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ 
              __html: selectedPost.content
                .replace(/\n\n/g, "</p><p>")
                .replace(/^(.+)$/gm, match => !match.startsWith("<") ? match : match)
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/^- (.+)$/gm, "<li>$1</li>")
            }}
            data-testid="text-blog-content"
          />

          {/* Related Products Section - Internal Linking */}
          {(() => {
            const linkedProducts = selectedPost.linkedProductIds && selectedPost.linkedProductIds.length > 0
              ? products.filter(p => selectedPost.linkedProductIds?.includes(p.id))
              : products.slice(0, 3);
            
            if (linkedProducts.length === 0) return null;

            return (
              <div className="border-t border-gray-700 pt-12 mt-12" data-testid="section-related-products">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-orange-500" />
                  Related Products
                </h2>
                <p className="text-gray-400 mb-6">
                  Ready to start streaming? Check out our top-rated products mentioned in this article.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedProducts.map(product => (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -3, scale: 1.02 }}
                      className="cursor-pointer"
                      onClick={() => setLocation("/?section=shop")}
                      data-testid={`card-related-product-${product.id}`}
                    >
                      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500 transition-all h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="secondary" 
                              className={product.category === 'firestick' ? 'bg-orange-600/20 text-orange-400' : 'bg-purple-600/20 text-purple-400'}
                            >
                              {product.category === 'firestick' ? 'Fire Stick' : 'IPTV'}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg text-white">{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-orange-500">
                              ${(product.price / 100).toFixed(2)}
                            </span>
                            <Button 
                              size="sm" 
                              className="bg-orange-600 hover:bg-orange-700"
                              data-testid={`button-view-product-${product.id}`}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Section */}
                <div className="mt-8 p-6 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl border border-orange-500/30">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Ready to Cut the Cord?</h3>
                      <p className="text-gray-300">Be streaming in 10 minutes! Your Fire Stick includes login credentials, a quick setup video, and 24/7 support. Live TV, Movies, Series, Sports & PPV await!</p>
                    </div>
                    <Button 
                      size="lg" 
                      className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
                      onClick={() => setLocation("/?section=shop")}
                      data-testid="button-shop-now"
                    >
                      <Flame className="w-4 h-4 mr-2" />
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "StreamStickPro Blog",
        "description": "Guides, tips, and news about jailbroken Fire Sticks and IPTV streaming",
        "url": "https://streamstickpro.com/blog",
        "blogPost": posts.map(post => ({
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "datePublished": post.date,
          "author": { "@type": "Organization", "name": "StreamStickPro" }
        }))
      }) }} />

      <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-red-700" />
        <div className="absolute inset-0 opacity-10">
          <Flame className="absolute w-32 h-32 top-4 right-8 text-white" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center px-4">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            data-testid="heading-blog-title"
          >
            StreamStickPro Blog
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-100 text-center max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            data-testid="text-blog-subtitle"
          >
            Guides, tips, and everything you need to know about cord cutting and IPTV
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12" data-testid="text-loading">
            <p className="text-gray-400">Loading blog posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12" data-testid="text-no-posts">
            <p className="text-gray-400">No blog posts available yet.</p>
          </div>
        ) : (
          <>
            {featuredPosts.length > 0 && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3" data-testid="heading-featured-posts">
                  <Star className="w-8 h-8 text-yellow-500" />
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {featuredPosts.slice(0, 2).map(post => (
                    <motion.div
                      key={post.id}
                      whileHover={{ y: -5 }}
                      onClick={() => setLocation(`/blog/${post.slug}`)}
                      className="cursor-pointer"
                      data-testid={`card-featured-post-${post.id}`}
                    >
                      <Card className="h-full bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-orange-500 transition-colors overflow-hidden">
                        <div className="h-48 bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                          <Tv className="w-16 h-16 text-orange-400 opacity-50" />
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" data-testid={`badge-category-${post.id}`}>{post.category}</Badge>
                            <span className="text-xs text-gray-400" data-testid={`text-date-${post.id}`}>{post.date}</span>
                          </div>
                          <CardTitle className="text-xl" data-testid={`text-title-${post.id}`}>{post.title}</CardTitle>
                          <CardDescription className="text-gray-400" data-testid={`text-excerpt-${post.id}`}>{post.excerpt}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span className="flex items-center gap-1" data-testid={`text-read-time-${post.id}`}>
                              <Clock className="w-4 h-4" />
                              {post.readTime}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-12">
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700"
                    data-testid="input-search"
                  />
                </div>
              </div>

              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className={activeCategory === cat ? "bg-orange-600 hover:bg-orange-700" : "border-gray-700"}
                    data-testid={`button-category-${cat}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-12" data-testid="text-no-matching-posts">
                  <p className="text-gray-400">No posts found. Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredPosts.map(post => (
                    <motion.div
                      key={post.id}
                      whileHover={{ x: 5 }}
                      onClick={() => setLocation(`/blog/${post.slug}`)}
                      className="cursor-pointer"
                      data-testid={`card-blog-post-${post.id}`}
                    >
                      <Card className="bg-gray-800/50 border-gray-700 hover:border-orange-500 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" data-testid={`badge-category-list-${post.id}`}>{post.category}</Badge>
                                <span className="text-xs text-gray-400" data-testid={`text-date-list-${post.id}`}>{post.date}</span>
                              </div>
                              <CardTitle data-testid={`text-post-title-${post.id}`}>{post.title}</CardTitle>
                              <CardDescription className="text-gray-400 mt-2" data-testid={`text-post-excerpt-${post.id}`}>{post.excerpt}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span className="flex items-center gap-1" data-testid={`text-read-time-list-${post.id}`}>
                              <Clock className="w-4 h-4" />
                              {post.readTime}
                            </span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
