import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "What is a Jailbroken Fire Stick? Complete Guide 2025",
    slug: "what-is-jailbroken-fire-stick",
    excerpt: "Learn everything about jailbroken Fire Sticks, how they work, what you can stream, and why they're the best cord-cutting solution in 2025.",
    content: `A jailbroken Fire Stick is a modified Amazon Fire TV Stick that has been configured to access additional streaming apps and services beyond the standard Amazon app store. Unlike regular Fire Sticks, jailbroken devices come pre-loaded with apps that allow you to stream live TV, movies, sports, and more.

**What Makes It Different?**
- Access to third-party streaming apps
- Live TV channels from around the world
- Sports including PPV events
- Movies and TV shows on demand
- No monthly cable bills

**Is It Legal?**
The device itself is completely legal. The Fire Stick is a legitimate Amazon product, and the apps installed are freely available. What you choose to stream is your responsibility.

**Benefits of a Pre-Configured Device**
When you buy from StreamStickPro, your device comes ready to use. No technical knowledge needed - just plug it in and start streaming within minutes.`,
    category: "Guides",
    readTime: "5 min read",
    date: "2025-01-15",
    featured: true,
    image: "/api/placeholder/800/400"
  },
  {
    id: "2",
    title: "Fire Stick vs Cable TV: Cost Comparison 2025",
    slug: "fire-stick-vs-cable-cost-comparison",
    excerpt: "See how much you can save by switching from cable TV to a jailbroken Fire Stick with IPTV subscription. The numbers will surprise you!",
    content: `Cable TV costs continue to rise every year, with the average American household paying over $200/month for cable and streaming subscriptions combined. Here's how a jailbroken Fire Stick compares.

**Average Cable TV Costs:**
- Basic cable: $50-100/month
- Premium channels: +$30-50/month
- Sports packages: +$20-40/month
- DVR service: +$10-20/month
- Equipment rental: +$10-15/month
- **Total: $120-225/month**

**StreamStickPro Costs:**
- One-time Fire Stick purchase: $140-160
- IPTV subscription: $15-75/year
- **First year total: $155-235 (one time)**

**Annual Savings:** $1,200 - $2,500+

With StreamStickPro, you get MORE channels, MORE content, and pay a fraction of the price. The device pays for itself within the first month!`,
    category: "Savings",
    readTime: "4 min read",
    date: "2025-01-10",
    featured: true,
    image: "/api/placeholder/800/400"
  },
  {
    id: "3",
    title: "How to Set Up Your Fire Stick in 5 Minutes",
    slug: "setup-fire-stick-5-minutes",
    excerpt: "Our pre-configured Fire Sticks are designed for easy setup. Follow this simple guide to start streaming in minutes.",
    content: `Setting up your StreamStickPro Fire Stick is incredibly simple. Our devices come pre-configured, so there's no technical knowledge required.

**Step 1: Unbox Your Device**
Remove the Fire Stick, power adapter, and HDMI extender from the packaging.

**Step 2: Connect to Your TV**
Plug the Fire Stick into any available HDMI port on your TV. Use the HDMI extender if the fit is tight.

**Step 3: Power Up**
Connect the power adapter to the Fire Stick and plug it into a wall outlet.

**Step 4: Connect to WiFi**
Turn on your TV and select the correct HDMI input. Follow the on-screen prompts to connect to your WiFi network.

**Step 5: Start Streaming!**
All apps are pre-installed and configured. Simply navigate to the app you want and start enjoying thousands of channels!

**Pro Tips:**
- Use an ethernet adapter for the most stable connection
- Position the Fire Stick away from other electronics to avoid interference
- Contact our 24/7 support if you need any assistance`,
    category: "How-To",
    readTime: "3 min read",
    date: "2025-01-05",
    featured: false,
    image: "/api/placeholder/800/400"
  },
  {
    id: "4",
    title: "Best IPTV Channels for Sports Fans in 2025",
    slug: "best-iptv-sports-channels-2025",
    excerpt: "Discover the best sports channels available through IPTV, including NFL, NBA, UFC, Premier League, and all major sporting events.",
    content: `Sports fans are some of the biggest beneficiaries of cord-cutting. With IPTV, you get access to virtually every sporting event in the world at a fraction of cable costs.

**What Sports Can You Watch?**

**American Football:**
- NFL Network, ESPN, Fox Sports, CBS Sports
- Every NFL game including Sunday Ticket
- College football on all networks

**Basketball:**
- NBA League Pass included
- All local and national broadcasts
- College basketball coverage

**Soccer:**
- Premier League, La Liga, Bundesliga, Serie A
- MLS, Liga MX
- Champions League, World Cup qualifiers

**Combat Sports:**
- UFC Fight Nights and PPV events
- Boxing on all networks
- WWE and wrestling

**Other Sports:**
- MLB, NHL, Golf, Tennis, F1, NASCAR
- Cricket, Rugby, and international sports
- Olympics and special events

All of this comes included with your StreamStickPro device and IPTV subscription!`,
    category: "Sports",
    readTime: "6 min read",
    date: "2024-12-28",
    featured: true,
    image: "/api/placeholder/800/400"
  },
  {
    id: "5",
    title: "Fire Stick HD vs 4K vs 4K Max: Which Should You Buy?",
    slug: "fire-stick-hd-4k-4k-max-comparison",
    excerpt: "Compare all Fire Stick models to find the perfect streaming device for your setup. We break down specs, features, and value.",
    content: `Choosing the right Fire Stick depends on your TV and viewing preferences. Here's a detailed comparison of all three models we offer.

**Fire Stick HD - $140**
Best for: 1080p TVs, budget-conscious buyers
- Full HD 1080p resolution
- Smooth streaming performance
- All IPTV features included
- 1 Year IPTV subscription included

**Fire Stick 4K - $150**
Best for: 4K TV owners, most users
- 4K Ultra HD resolution
- Dolby Vision and HDR10+ support
- Improved processing power
- 1 Year IPTV subscription included
- **BEST VALUE - Our recommendation**

**Fire Stick 4K Max - $160**
Best for: Power users, smart home enthusiasts
- 4K Ultra HD with Wi-Fi 6E
- Fastest processing of all models
- Ambient Experience support
- Dolby Vision, Atmos, HDR10+
- 1 Year IPTV subscription included

**Our Recommendation:**
For most users, the Fire Stick 4K offers the best balance of features and value. If you have a 4K TV, the upgraded picture quality is absolutely worth the extra $10.`,
    category: "Reviews",
    readTime: "5 min read",
    date: "2024-12-20",
    featured: false,
    image: "/api/placeholder/800/400"
  },
  {
    id: "6",
    title: "Troubleshooting Common Fire Stick Issues",
    slug: "troubleshooting-fire-stick-issues",
    excerpt: "Having issues with your Fire Stick? Here are solutions to the most common problems and how to fix them quickly.",
    content: `Even the best devices occasionally need troubleshooting. Here are solutions to the most common Fire Stick issues.

**Buffering or Lag**
1. Check your internet speed (minimum 25 Mbps recommended)
2. Move your router closer to the TV
3. Use an ethernet adapter for wired connection
4. Clear app cache in settings

**Device Won't Turn On**
1. Check power connection
2. Try a different power outlet
3. Use the original power adapter (not TV USB)
4. Perform a hard reset (hold power 10 seconds)

**No Sound**
1. Check TV volume and mute status
2. Verify HDMI connection
3. Restart the Fire Stick
4. Check audio settings in Fire Stick menu

**Apps Not Working**
1. Force close and reopen the app
2. Clear app cache and data
3. Check for app updates
4. Uninstall and reinstall the app

**WiFi Connection Issues**
1. Restart your router and Fire Stick
2. Forget network and reconnect
3. Check for WiFi interference
4. Consider a WiFi extender

**Still Having Issues?**
Contact our 24/7 support team - we're here to help!`,
    category: "Support",
    readTime: "4 min read",
    date: "2024-12-15",
    featured: false,
    image: "/api/placeholder/800/400"
  }
];

const categories = ["All", "Guides", "Savings", "How-To", "Sports", "Reviews", "Support"];

export default function Blog() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
  }, []);

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(p => p.featured);

  const generateStructuredData = () => {
    const blogListData = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "StreamStickPro Blog",
      "description": "Guides, tips, and news about jailbroken Fire Sticks and IPTV streaming",
      "url": "https://streamstickpro.com/blog",
      "blogPost": blogPosts.map(post => ({
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "datePublished": post.date,
        "author": {
          "@type": "Organization",
          "name": "StreamStickPro"
        }
      }))
    };
    return JSON.stringify(blogListData);
  };

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
          "publisher": { "@type": "Organization", "name": "StreamStickPro" }
        })}} />
        
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-900/95 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedPost(null)}
                className="text-gray-300 hover:text-white"
                data-testid="button-back-to-blog"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </div>
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer" onClick={() => setLocation("/")}>
              <Flame className="w-7 h-7 text-orange-500" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Stream Stick Pro</span>
            </div>
          </div>
        </nav>

        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-8">
            <Badge className="bg-orange-500/20 text-orange-400 mb-4">{selectedPost.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-post-title">{selectedPost.title}</h1>
            <div className="flex items-center gap-4 text-gray-400">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(selectedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {selectedPost.readTime}
              </span>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            {selectedPost.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <h2 key={i} className="text-2xl font-bold text-orange-400 mt-8 mb-4">{paragraph.replace(/\*\*/g, '')}</h2>;
              }
              if (paragraph.startsWith('**')) {
                const parts = paragraph.split('**');
                return (
                  <div key={i} className="mb-4">
                    {parts.map((part, j) => 
                      j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : <span key={j}>{part}</span>
                    )}
                  </div>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n');
                return (
                  <ul key={i} className="list-disc list-inside space-y-2 mb-4 text-gray-300">
                    {items.map((item, j) => (
                      <li key={j}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={i} className="text-gray-300 mb-4 leading-relaxed">{paragraph}</p>;
            })}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-500/30">
            <h3 className="text-2xl font-bold mb-3">Ready to Start Streaming?</h3>
            <p className="text-gray-300 mb-4">Get your pre-configured Fire Stick with 1 year of IPTV included. Start watching in minutes!</p>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              data-testid="button-shop-now"
            >
              Shop Now <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateStructuredData() }} />
      
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-900/95 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer" onClick={() => setLocation("/")}>
            <Flame className="w-7 h-7 text-orange-500" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Stream Stick Pro</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10" onClick={() => setLocation("/")}>
              Home
            </Button>
            <Button 
              onClick={() => setLocation("/")} 
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              data-testid="button-shop"
            >
              Shop Now
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900 py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-blog-title">
              StreamStickPro <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Blog</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Guides, tips, and everything you need to know about cord-cutting and streaming
            </p>
            
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-gray-800 border-gray-700 text-white h-12 rounded-full"
                data-testid="input-search-blog"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className={activeCategory === category 
                ? "bg-orange-500 hover:bg-orange-600" 
                : "border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
              }
              data-testid={`button-category-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {activeCategory === "All" && searchTerm === "" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-orange-500" />
              Featured Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.slice(0, 3).map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card 
                    className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 hover:border-orange-500/50 transition-all cursor-pointer h-full"
                    onClick={() => setSelectedPost(post)}
                    data-testid={`card-featured-${post.id}`}
                  >
                    <CardHeader>
                      <Badge className="w-fit bg-orange-500/20 text-orange-400 mb-2">{post.category}</Badge>
                      <CardTitle className="text-xl text-white hover:text-orange-400 transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-6">
            {activeCategory === "All" ? "All Articles" : `${activeCategory} Articles`}
          </h2>
          
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card 
                    className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-all cursor-pointer h-full"
                    onClick={() => setSelectedPost(post)}
                    data-testid={`card-post-${post.id}`}
                  >
                    <CardHeader>
                      <Badge className="w-fit bg-gray-700 text-gray-300 mb-2">{post.category}</Badge>
                      <CardTitle className="text-lg text-white hover:text-orange-400 transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400 line-clamp-3">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-r from-orange-500/10 to-red-500/10 py-16 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Cut the Cord?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers streaming live TV, sports, movies, and more for a fraction of cable costs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => setLocation("/")}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              data-testid="button-cta-shop"
            >
              <Tv className="w-5 h-5 mr-2" />
              Shop Fire Sticks
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setLocation("/")}
              className="border-gray-600 text-white hover:bg-gray-800"
              data-testid="button-cta-iptv"
            >
              <Zap className="w-5 h-5 mr-2" />
              View IPTV Plans
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-white">StreamStickPro</span>
          </div>
          <p className="text-sm">© 2025 StreamStickPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
