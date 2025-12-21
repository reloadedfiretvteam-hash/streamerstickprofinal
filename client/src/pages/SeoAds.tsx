import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { apiCall } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Search,
  ShoppingCart,
  Star,
  CheckCircle,
  TrendingUp,
  Zap,
  Shield,
  Award,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SeoAd {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  featuredImage: string | null;
  galleryImages: string[];
  comparisonData: any;
  productLinks: any[];
  ctaText: string;
  ctaLink: string;
  badgeLabels: string[];
  socialProof: any;
  featured: boolean;
  createdAt: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
}

const categories = ["All", "device-comparison", "app-comparison", "service-comparison", "content-access"];

export default function SeoAds() {
  const [, setLocation] = useLocation();
  const params = useParams<{ slug?: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedAd, setSelectedAd] = useState<SeoAd | null>(null);
  const [ads, setAds] = useState<SeoAd[]>([]);
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
    const fetchAds = async () => {
      try {
        const url = params.slug 
          ? `/api/seo-ads/${params.slug}`
          : activeCategory === "All"
          ? "/api/seo-ads/ads"
          : `/api/seo-ads/ads/category/${activeCategory}`;
        
        const response = await apiCall(url);
        if (response.ok) {
          const data = await response.json();
          if (params.slug) {
            setSelectedAd(data.data);
          } else {
            setAds(data.data || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch SEO ads:", error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAds();
  }, [params.slug, activeCategory]);

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

    const setCanonical = (url: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    };

    const baseUrl = 'https://streamstickpro.com';
    
    if (selectedAd) {
      document.title = selectedAd.metaTitle || `${selectedAd.title} | StreamStickPro`;
      setMetaTag('description', selectedAd.metaDescription || selectedAd.excerpt);
      setCanonical(`${baseUrl}/seo-ads/${selectedAd.slug}`);
      setMetaTag('og:title', selectedAd.title, true);
      setMetaTag('og:description', selectedAd.excerpt, true);
      setMetaTag('og:url', `${baseUrl}/seo-ads/${selectedAd.slug}`, true);
      setMetaTag('og:type', 'article', true);
      if (selectedAd.featuredImage) {
        setMetaTag('og:image', selectedAd.featuredImage, true);
      }
    } else {
      document.title = 'SEO Guides & Comparisons | StreamStickPro';
      setMetaTag('description', 'Compare streaming devices, apps, and services. Find the best solutions for cord cutting and live TV streaming.');
      setCanonical(`${baseUrl}/seo-ads`);
    }
  }, [selectedAd]);

  const filteredAds = ads.filter(ad => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return ad.title.toLowerCase().includes(searchLower) ||
             ad.excerpt?.toLowerCase().includes(searchLower) ||
             ad.primaryKeyword.toLowerCase().includes(searchLower) ||
             ad.secondaryKeywords?.some(k => k.toLowerCase().includes(searchLower));
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (selectedAd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedAd(null);
                  setLocation("/seo-ads");
                }}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Guides
              </Button>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header with badges */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {selectedAd.badgeLabels?.map((badge, idx) => (
                <Badge key={idx} variant="secondary" className="bg-orange-500/20 text-orange-300">
                  {badge}
                </Badge>
              ))}
              <Badge variant="outline">{selectedAd.category}</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{selectedAd.title}</h1>
            {selectedAd.excerpt && (
              <p className="text-xl text-gray-300 mb-6">{selectedAd.excerpt}</p>
            )}
          </div>

          {/* Featured Image */}
          {selectedAd.featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={selectedAd.featuredImage} 
                alt={selectedAd.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Social Proof */}
          {selectedAd.socialProof && (
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 flex-wrap">
                  {selectedAd.socialProof.stats?.map((stat: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div 
            className="prose prose-invert max-w-none mb-12 text-gray-300"
            dangerouslySetInnerHTML={{ 
              __html: selectedAd.content
                .replace(/\n\n/g, "</p><p>")
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/^- (.+)$/gm, "<li>$1</li>")
            }}
          />

          {/* Comparison Table */}
          {selectedAd.comparisonData && (
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="pb-3 text-gray-300">Feature</th>
                        {selectedAd.comparisonData.items?.map((item: any, idx: number) => (
                          <th key={idx} className="pb-3 text-gray-300">{item.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAd.comparisonData.features?.map((feature: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-700/50">
                          <td className="py-3 text-gray-300">{feature.name}</td>
                          {selectedAd.comparisonData.items?.map((item: any, itemIdx: number) => (
                            <td key={itemIdx} className="py-3">
                              {feature.values[itemIdx] === true ? (
                                <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                              ) : feature.values[itemIdx] === false ? (
                                <span className="text-gray-500">—</span>
                              ) : (
                                <span className="text-gray-300">{feature.values[itemIdx]}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Showcase */}
          {selectedAd.productLinks && selectedAd.productLinks.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-orange-400" />
                  Recommended Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAd.productLinks.map((link: any, idx: number) => {
                    const product = products.find(p => p.id === link.productId || p.name.toLowerCase().includes(link.name?.toLowerCase() || ''));
                    if (!product) return null;
                    return (
                      <Card key={idx} className="bg-gray-700/50 border-gray-600">
                        <CardContent className="pt-6">
                          <div className="flex gap-4">
                            {product.imageUrl && (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                              <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-orange-400 font-bold">${(product.price / 100).toFixed(2)}</span>
                                <Button 
                                  size="sm" 
                                  onClick={() => setLocation("/shop")}
                                  className="bg-orange-500 hover:bg-orange-600"
                                >
                                  View Product
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-0 mb-8">
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-orange-100 mb-6">Get everything you need for the ultimate streaming experience</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button 
                  size="lg" 
                  onClick={() => setLocation(selectedAd.ctaLink || "/shop")}
                  className="bg-white text-orange-500 hover:bg-gray-100"
                >
                  {selectedAd.ctaText || "Shop Now"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setLocation("/?section=free-trial")}
                  className="border-white text-white hover:bg-white/10"
                >
                  Start Free Trial
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          {selectedAd.galleryImages && selectedAd.galleryImages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedAd.galleryImages.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`${selectedAd.title} - Image ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Streaming Guides & Comparisons
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Compare devices, apps, and services. Find the best solutions for cord cutting and live TV streaming.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search guides and comparisons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                {cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>
        </div>

        {/* Ads Grid */}
        {filteredAds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No guides found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-all cursor-pointer h-full flex flex-col"
                  onClick={() => {
                    setSelectedAd(ad);
                    setLocation(`/seo-ads/${ad.slug}`);
                  }}
                >
                  {ad.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={ad.featuredImage} 
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                      {ad.featured && (
                        <Badge className="absolute top-2 right-2 bg-orange-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {ad.badgeLabels?.slice(0, 2).map((badge, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-white line-clamp-2">{ad.title}</CardTitle>
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {ad.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {ad.category}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAd(ad);
                          setLocation(`/seo-ads/${ad.slug}`);
                        }}
                      >
                        Read More
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


