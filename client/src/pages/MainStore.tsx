import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShoppingCart, Flame, Check, Star, Zap, Mail, DollarSign, CreditCard, MessageCircle, Play, X, Gift } from "lucide-react";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStorageUrl } from "@/lib/supabase";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SportsCarousel } from "@/components/SportsCarousel";
import { ExitPopup } from "@/components/ExitPopup";
import { DemoVideo } from "@/components/DemoVideo";
import { FreeTrial } from "@/components/FreeTrial";
import { TrustBadges, PaymentBadges, GuaranteeBadge } from "@/components/TrustBadges";
import { TrustStats } from "@/components/SocialProof";
import { CustomerReviews } from "@/components/CustomerReviews";
import { ChannelLogos } from "@/components/ChannelLogos";
import { SavingsCalculator } from "@/components/SavingsCalculator";
import { StickyMobileCTA, ScrollToTopButton } from "@/components/StickyMobileCTA";

import firestickHdImg from "@assets/OIP_(11)99_1764978938773.jpg";
import firestick4kImg from "@assets/71+Pvh7WB6L._AC_SL1500__1764978938770.jpg";
import firestick4kMaxImg from "@assets/71E1te69hZL._AC_SL1500__1764978938773.jpg";
import iptvImg from "@assets/OIF_1764979270800.jpg";

const supabaseHeroImg = getStorageUrl('images', 'hero-firestick-breakout.jpg');

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  image: string;
  category: "firestick" | "iptv";
  badge: string;
  popular?: boolean;
  period?: string;
}

const defaultProducts: Product[] = [
  {
    id: "fs-hd",
    name: "Fire Stick HD - Jailbroken & Ready",
    price: 140,
    description: "Premium jailbroken Fire Stick HD with 1 Year IPTV included. Stream 18,000+ live TV channels, 60,000+ movies & shows, all sports & PPV events. Setup tutorial video, login credentials & easy guide emailed instantly!",
    features: ["1080p Full HD Resolution", "18,000+ Live TV Channels", "60,000+ Movies & Shows", "All Sports & PPV Events", "1 Year IPTV Subscription Included", "Setup Tutorial Video Emailed", "Login Credentials Delivered Instantly", "Pre-configured & Ready to Use", "24/7 Customer Support"],
    image: firestickHdImg,
    category: "firestick",
    badge: "STARTER"
  },
  {
    id: "fs-4k",
    name: "Fire Stick 4K - Jailbroken & Ready",
    price: 150,
    description: "Best-selling jailbroken Fire Stick 4K with Dolby Vision & 1 Year IPTV. Access 18,000+ live channels, 60,000+ movies & TV shows, all sports including NFL, NBA, UFC, PPV events. Tutorial, login & guide emailed!",
    features: ["4K Ultra HD Resolution", "Dolby Vision & HDR10+", "18,000+ Live TV Channels", "60,000+ Movies & Shows", "All Sports & PPV Events", "1 Year IPTV Subscription Included", "Setup Tutorial Video Emailed", "Login Credentials Delivered Instantly", "Pre-configured & Plug-n-Play", "24/7 Customer Support"],
    image: firestick4kImg,
    category: "firestick",
    badge: "BEST VALUE",
    popular: true
  },
  {
    id: "fs-max",
    name: "Fire Stick 4K Max - Jailbroken & Ready",
    price: 160,
    description: "Ultimate jailbroken Fire Stick 4K Max - Fastest Wi-Fi 6E model with 1 Year IPTV. Stream 18,000+ live channels, 60,000+ movies, all sports & PPV events in stunning 4K. Setup tutorial, credentials & easy guide emailed!",
    features: ["4K Ultra HD with Wi-Fi 6E", "Dolby Vision, Atmos & HDR10+", "18,000+ Live TV Channels", "60,000+ Movies & Shows", "All Sports & PPV Events", "1 Year IPTV Subscription Included", "Setup Tutorial Video Emailed", "Login Credentials Delivered Instantly", "Ambient Experience Support", "Pre-configured & Plug-n-Play", "24/7 Customer Support"],
    image: firestick4kMaxImg,
    category: "firestick",
    badge: "PREMIUM"
  },
  {
    id: "iptv-1",
    name: "1 Month IPTV Subscription",
    price: 15,
    description: "Premium IPTV subscription with 18,000+ live TV channels, 60,000+ movies & TV shows, all sports leagues (NFL, NBA, UFC, MLB) & PPV events. Works on any device. Login credentials & setup guide emailed instantly!",
    features: ["18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "NFL, NBA, UFC, MLB & More", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "24/7 Customer Support"],
    image: iptvImg,
    category: "iptv",
    badge: "STARTER",
    period: "/month"
  },
  {
    id: "iptv-3",
    name: "3 Month IPTV Subscription",
    price: 30,
    description: "Save 33%! Premium 3-month IPTV with 18,000+ live channels, 60,000+ movies & shows, all sports including NFL, NBA, UFC & PPV events. Works on Fire Stick, Roku, Android, iOS & more. Credentials emailed instantly!",
    features: ["18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "NFL, NBA, UFC, MLB & More", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "Priority Customer Support"],
    image: iptvImg,
    category: "iptv",
    badge: "POPULAR",
    popular: true,
    period: "/3 months"
  },
  {
    id: "iptv-6",
    name: "6 Month IPTV Subscription",
    price: 50,
    description: "Save 44%! 6-month premium IPTV subscription. Stream 18,000+ live TV channels, 60,000+ movies & TV shows, all sports (NFL, NBA, UFC, Premier League) & PPV events. Works on any device. VIP support included!",
    features: ["18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "NFL, NBA, UFC, Premier League", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "VIP Customer Support"],
    image: iptvImg,
    category: "iptv",
    badge: "GREAT VALUE",
    period: "/6 months"
  },
  {
    id: "iptv-12",
    name: "1 Year IPTV Subscription",
    price: 75,
    description: "Best Deal - Save 58%! Full year premium IPTV with 18,000+ live TV channels, 60,000+ movies & shows, all sports leagues (NFL, NBA, UFC, MLB, NHL, Premier League) & PPV events. Premium VIP support & free setup assistance!",
    features: ["18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "NFL, NBA, UFC, MLB, NHL & More", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "Premium VIP Support", "Free Setup Assistance"],
    image: iptvImg,
    category: "iptv",
    badge: "BEST VALUE",
    period: "/year"
  }
];

export default function MainStore() {
  const [, setLocation] = useLocation();
  const { addItem, items } = useCart();
  const [products, setProducts] = useState<Product[]>(defaultProducts);

  useEffect(() => {
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        const mappedProducts: Product[] = result.data.map((p: any) => {
          const isFirestick = p.name?.toLowerCase().includes('fire stick') || 
                              p.name?.toLowerCase().includes('fire tv') ||
                              p.category === 'firestick';
          
          let productImage = p.imageUrl || '';
          if (productImage && !productImage.startsWith('http') && !productImage.startsWith('/')) {
            productImage = getStorageUrl('images', productImage);
          } else if (!productImage) {
            if (p.id === 'fs-hd') productImage = firestickHdImg;
            else if (p.id === 'fs-4k') productImage = firestick4kImg;
            else if (p.id === 'fs-max') productImage = firestick4kMaxImg;
            else productImage = isFirestick ? firestick4kImg : iptvImg;
          }

          const defaultFeatures = defaultProducts.find(dp => dp.id === p.id)?.features || 
            ['Premium quality', '24/7 support'];
          const defaultBadge = defaultProducts.find(dp => dp.id === p.id)?.badge || 'POPULAR';
          const defaultPeriod = defaultProducts.find(dp => dp.id === p.id)?.period;
          const defaultDescription = defaultProducts.find(dp => dp.id === p.id)?.description || '';

          const priceInCents = parseInt(p.price?.toString() || '0', 10);
          const priceInDollars = priceInCents / 100;

          return {
            id: p.id,
            name: p.name,
            price: priceInDollars,
            description: p.description || defaultDescription,
            features: defaultFeatures,
            image: productImage,
            category: isFirestick ? 'firestick' : 'iptv',
            badge: defaultBadge,
            popular: p.id === 'fs-4k' || p.id === 'iptv-3' || p.id === 'firestick-4k' || p.id === 'iptv-3mo',
            period: isFirestick ? undefined : defaultPeriod
          };
        });
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.warn('Using default products:', error);
    }
  };

  const scrollToShop = () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const firestickProducts = products.filter(p => p.category === 'firestick');
  const iptvProducts = products.filter(p => p.category === 'iptv');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StreamStickPro",
    "url": "https://streamstickpro.com",
    "description": "Premium jailbroken Fire Sticks with IPTV - 18,000+ channels, 60,000+ movies, all sports & PPV",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://streamstickpro.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const productListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "StreamStickPro Products",
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.image,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "StreamStickPro"
          }
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "2847"
        }
      }
    }))
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "StreamStickPro",
    "url": "https://streamstickpro.com",
    "logo": "https://streamstickpro.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "sameAs": []
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-orange-500 selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productListData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }} />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-900/95 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <Flame className="w-7 h-7 text-orange-500" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Stream Stick Pro</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:flex text-gray-300 hover:text-white hover:bg-white/10" onClick={scrollToAbout}>How It Works</Button>
            <Button variant="ghost" className="hidden md:flex text-gray-300 hover:text-white hover:bg-white/10" onClick={scrollToShop}>Shop</Button>
            <Button variant="ghost" className="hidden md:flex text-gray-300 hover:text-white hover:bg-white/10" onClick={() => setLocation("/blog")} data-testid="button-blog">Blog</Button>
            <Button variant="ghost" className="hidden md:flex text-gray-300 hover:text-white hover:bg-white/10" onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-support">Support</Button>
            <Button 
              onClick={() => setLocation("/checkout")} 
              className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {items.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-white text-black hover:bg-gray-200" data-testid="text-cart-count">
                  {items.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={supabaseHeroImg}
            alt="Best Jailbroken Fire Stick 2025 - Premium IPTV Streaming Device"
            className="w-full h-full object-cover object-center"
            loading="eager"
            style={{ transform: 'scale(1.15)', transformOrigin: 'center center' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== iptvImg) {
                target.src = iptvImg;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
        </div>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-block px-6 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full text-sm font-semibold text-orange-300 animate-pulse">
                🔥 #1 Premium IPTV Provider
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400">
                Stream Stick Pro
              </span>
              <br />
              <span className="text-2xl sm:text-3xl md:text-5xl text-white">Premium IPTV Subscriptions</span>
              <br />
              <span className="text-xl sm:text-2xl md:text-4xl text-blue-200">& Jailbroken Fire Stick Shop</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto"
            >
              18,000+ live channels • 60,000+ movies & shows • All sports & PPV events
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
            >
              <button
                onClick={scrollToShop}
                className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold text-lg transition-all transform hover:scale-105 hover:shadow-2xl shadow-orange-500/50 inline-flex items-center justify-center gap-3"
                data-testid="button-shop-now"
              >
                <ShoppingCart className="w-6 h-6 group-hover:animate-bounce" />
                Shop Now
                <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">Save up to 50%</span>
              </button>
              <button
                onClick={scrollToAbout}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/20 hover:border-white/40 rounded-xl font-bold text-lg transition-all inline-flex items-center justify-center gap-2"
                data-testid="button-learn-more"
              >
                <Play className="w-5 h-5" />
                Learn More
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm md:text-base"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <div className="text-orange-400 font-bold text-lg" data-testid="text-customers">2,700+</div>
                <div className="text-blue-200">Happy Customers</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <div className="text-orange-400 font-bold text-lg" data-testid="text-rating">4.9/5 ⭐</div>
                <div className="text-blue-200">Customer Rating</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10">
                <div className="text-orange-400 font-bold text-lg">Same Day</div>
                <div className="text-blue-200">Shipping Available</div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Channel Logos */}
      <ChannelLogos />

      {/* Comparison Section - StreamStickPro vs Competitors */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">The Stream Stick Pro Difference</span>
            </h2>
            <p className="text-gray-400 text-lg">See why customers choose us over the competition</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Competitors - Red/Bad */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-red-950/30 border-2 border-red-500/50 rounded-2xl p-8"
              data-testid="comparison-competitors"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-400">Other Fire Stick Websites</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Hundreds of apps that fail on a daily basis",
                  "Broken links and dead streams constantly",
                  "Apps don't update themselves - manual maintenance required",
                  "Confusing interfaces that aren't user-friendly",
                  "Long, complicated tutorials just to get started",
                  "Poor or no customer support when things break",
                  "You end up frustrated with a bad product"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* StreamStickPro - Green/Good */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-green-950/30 border-2 border-green-500/50 rounded-2xl p-8"
              data-testid="comparison-streamstickpro"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-400">Stream Stick Pro Experience</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "ONE app does it all - no confusion, no hassle",
                  "Daily automatic updates - always fresh content",
                  "User-friendly interface - even grandma can use it",
                  "No broken links - premium, stable streams",
                  "Plug in and watch - ready in 5 minutes",
                  "Full 24/7 customer support - we're always here",
                  "You won't be disappointed - this is the future of streaming"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-6 py-2 mb-6">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">WHY CHOOSE US</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Break Free From Cable</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Premium streaming at a fraction of the cost. No contracts, no hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Plug & Play Ready</h3>
              <p className="text-gray-400">Pre-configured devices. Just connect to your TV and start streaming immediately.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Premium Content</h3>
              <p className="text-gray-400">Access 18,000+ live channels, 60,000+ movies, and all sports & PPV events.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-colors">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">24/7 Support</h3>
              <p className="text-gray-400">Our dedicated team is always available to help you with any questions or issues.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-6 py-2 mb-6">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
              <span className="text-sm font-medium text-orange-300">SHOP ALL PRODUCTS</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Premium Products</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Browse our complete collection of jailbroken Fire Sticks and IPTV subscriptions
            </p>
          </div>

          {/* Fire Sticks */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              Choose Your Fire Stick
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {firestickProducts.map((product) => (
                <div
                  key={product.id}
                  className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    product.popular ? 'ring-4 ring-orange-500 scale-105 shadow-2xl shadow-orange-500/50' : ''
                  }`}
                  data-testid={`card-product-${product.id}`}
                >
                  {product.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce">
                        <Star className="w-4 h-4 fill-current" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== firestick4kImg) {
                          target.src = firestick4kImg;
                        }
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                      {product.badge}
                    </div>
                  </div>

                  <div className="p-8">
                    <h4 className="text-2xl font-bold mb-4">{product.name}</h4>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-orange-400" data-testid={`text-price-${product.id}`}>
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-blue-200 text-sm mt-2">
                        Includes 1 Year IPTV Subscription
                      </p>
                    </div>

                    <button
                      onClick={() => addItem(product as any)}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 mb-6 flex items-center justify-center gap-2 ${
                        product.popular
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/50'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg'
                      }`}
                      data-testid={`button-add-${product.id}`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>

                    <div className="space-y-3">
                      {product.features.slice(0, 6).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-blue-100 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sports Carousel */}
          <SportsCarousel />

          {/* Demo Video */}
          <DemoVideo />

          {/* IPTV Subscriptions */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-blue-500" />
              IPTV Subscriptions Only
            </h3>
            
            {/* Free Trial Box */}
            <FreeTrial />

            <div className="grid md:grid-cols-4 gap-6">
              {iptvProducts.map((product) => (
                <div
                  key={product.id}
                  className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    product.popular ? 'ring-4 ring-blue-500 scale-105 shadow-2xl shadow-blue-500/50' : ''
                  }`}
                  data-testid={`card-product-${product.id}`}
                >
                  {product.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce text-sm">
                        <Star className="w-4 h-4 fill-current" />
                        POPULAR
                      </div>
                    </div>
                  )}

                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== iptvImg) {
                          target.src = iptvImg;
                        }
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-xs">
                      {product.badge}
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-4">{product.name}</h4>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-blue-400" data-testid={`text-price-${product.id}`}>
                          ${product.price.toFixed(2)}
                        </span>
                        {product.period && <span className="text-gray-400">{product.period}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => addItem(product as any)}
                      className="w-full py-3 rounded-xl font-bold text-base transition-all transform hover:scale-105 mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
                      data-testid={`button-add-${product.id}`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Subscribe Now
                    </button>

                    <div className="space-y-2">
                      {product.features.slice(0, 5).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-blue-100 text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* Savings Calculator */}
      <SavingsCalculator />

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Frequently Asked Questions</span>
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="border border-white/10 rounded-xl px-6 bg-white/5">
              <AccordionTrigger className="text-lg font-semibold hover:text-orange-400">What's included with a Fire Stick?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Every Fire Stick comes pre-configured and jailbroken with 1 Year of IPTV service included. Just plug it in and start streaming immediately!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border border-white/10 rounded-xl px-6 bg-white/5">
              <AccordionTrigger className="text-lg font-semibold hover:text-orange-400">How do I renew my subscription?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Simply come back to the site and purchase a renewal package. Your credentials will be updated instantly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border border-white/10 rounded-xl px-6 bg-white/5">
              <AccordionTrigger className="text-lg font-semibold hover:text-orange-400">Do you offer support?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Yes, we offer 24/7 support via email for all active subscribers. Contact us at reloadedfiretvteam@gmail.com
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border border-white/10 rounded-xl px-6 bg-white/5">
              <AccordionTrigger className="text-lg font-semibold hover:text-orange-400">What devices are supported?</AccordionTrigger>
              <AccordionContent className="text-gray-400">
                Our IPTV service works on Fire Sticks, Android boxes, Smart TVs, phones, tablets, and computers. Use up to 2 devices simultaneously!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="rounded-full w-14 h-14 shadow-lg bg-green-500 hover:bg-green-600 animate-pulse" data-testid="button-chat">
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 border-t border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-8 h-8 text-orange-500" />
                <span className="text-xl font-bold text-white">Inferno TV</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Premium IPTV streaming with 18,000+ channels and 60,000+ movies & series. Jailbroken Fire Sticks available.
              </p>
              <div className="flex gap-3">
                <a href="mailto:reloadedfiretvteam@gmail.com" className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-colors" data-testid="link-email">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
              <div className="mt-4">
                <a href="mailto:reloadedfiretvteam@gmail.com" className="text-sm text-orange-400 hover:text-orange-300">
                  reloadedfiretvteam@gmail.com
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:text-orange-400 transition-colors cursor-pointer">Home</a></li>
                <li><a href="#shop" className="hover:text-orange-400 transition-colors cursor-pointer">Shop All Products</a></li>
                <li><a href="#about" className="hover:text-orange-400 transition-colors cursor-pointer">About Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Payment Methods</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span>Cash App: $starevan11</span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-400" />
                  <span>Bitcoin: Accepted</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">FAQ</a></li>
                <li><a href="mailto:reloadedfiretvteam@gmail.com" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
                <li><a href="/admin" className="text-gray-600 hover:text-gray-500 transition-colors text-xs">Admin</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-gray-400">
                © {new Date().getFullYear()} Inferno TV. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-green-400 font-semibold">🔒 Secure Payment</span>
                <span className="text-orange-400 font-semibold">24/7 Support</span>
                <span className="text-blue-400 font-semibold">Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Exit Intent Popup */}
      <ExitPopup />

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />

      {/* Scroll to Top */}
      <ScrollToTopButton />
    </div>
  );
}
