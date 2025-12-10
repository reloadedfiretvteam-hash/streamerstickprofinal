import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { apiCall } from "@/lib/api";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ShoppingCart, Flame, Check, Star, Zap, Mail, DollarSign, CreditCard, MessageCircle, Play, X, Gift, ChevronRight, Heart } from "lucide-react";
import { useCart, useWishlist } from "@/lib/store";
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
import { SEOSchema } from "@/components/SEOSchema";
import { ProductQuickView, QuickViewButton } from "@/components/ProductQuickView";
import { MobileNav } from "@/components/MobileNav";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ComparisonTable } from "@/components/ComparisonTable";
import { FloatingCTA } from "@/components/FloatingCTA";
import { AnimatedCounter } from "@/components/AnimatedCounter";

import firestickHdImg from "@assets/OIP_(11)99_1764978938773.jpg";
import firestick4kImg from "@assets/71+Pvh7WB6L._AC_SL1500__1764978938770.jpg";
import firestick4kMaxImg from "@assets/71E1te69hZL._AC_SL1500__1764978938773.jpg";
import iptvImg from "@assets/OIF_1764979270800.jpg";
import fallbackHeroImg from "@assets/stock_images/amazon_fire_tv_stick_cc445778.jpg";

const heroImg = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/hero-firestick-breakout.jpg";

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

interface IPTVPricing {
  duration: string;
  durationLabel: string;
  badge: string;
  popular?: boolean;
  description: string;
  features: string[];
  prices: { devices: number; price: number; productId: string }[];
}

const iptvPricingMatrix: IPTVPricing[] = [
  {
    duration: "1mo",
    durationLabel: "1 Month",
    badge: "STARTER",
    description: "Premium IPTV subscription with 18,000+ live TV channels, 60,000+ movies & TV shows, all sports leagues & PPV events.",
    features: ["18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "24/7 Customer Support"],
    prices: [
      { devices: 1, price: 15, productId: "iptv-1mo-1d" },
      { devices: 2, price: 25, productId: "iptv-1mo-2d" },
      { devices: 3, price: 35, productId: "iptv-1mo-3d" },
      { devices: 4, price: 40, productId: "iptv-1mo-4d" },
      { devices: 5, price: 45, productId: "iptv-1mo-5d" },
    ],
  },
  {
    duration: "3mo",
    durationLabel: "3 Months",
    badge: "POPULAR",
    popular: true,
    description: "Save more with 3 months! Premium IPTV with 18,000+ live channels, 60,000+ movies & shows, all sports & PPV events.",
    features: ["18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "Priority Customer Support"],
    prices: [
      { devices: 1, price: 25, productId: "iptv-3mo-1d" },
      { devices: 2, price: 40, productId: "iptv-3mo-2d" },
      { devices: 3, price: 55, productId: "iptv-3mo-3d" },
      { devices: 4, price: 65, productId: "iptv-3mo-4d" },
      { devices: 5, price: 75, productId: "iptv-3mo-5d" },
    ],
  },
  {
    duration: "6mo",
    durationLabel: "6 Months",
    badge: "GREAT VALUE",
    description: "10% OFF! 6-month premium IPTV subscription with 18,000+ live TV channels, 60,000+ movies & shows, all sports & PPV.",
    features: ["18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "VIP Customer Support"],
    prices: [
      { devices: 1, price: 40, productId: "iptv-6mo-1d" },
      { devices: 2, price: 65, productId: "iptv-6mo-2d" },
      { devices: 3, price: 85, productId: "iptv-6mo-3d" },
      { devices: 4, price: 100, productId: "iptv-6mo-4d" },
      { devices: 5, price: 125, productId: "iptv-6mo-5d" },
    ],
  },
  {
    duration: "1yr",
    durationLabel: "1 Year",
    badge: "BEST VALUE",
    description: "Best deal - Full year premium IPTV with 18,000+ live channels, 60,000+ movies & shows, all sports & PPV events!",
    features: ["18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "Premium VIP Support", "Free Setup Assistance"],
    prices: [
      { devices: 1, price: 65, productId: "iptv-1yr-1d" },
      { devices: 2, price: 100, productId: "iptv-1yr-2d" },
      { devices: 3, price: 140, productId: "iptv-1yr-3d" },
      { devices: 4, price: 190, productId: "iptv-1yr-4d" },
      { devices: 5, price: 220, productId: "iptv-1yr-5d" },
    ],
  },
];

const defaultProducts: Product[] = [
  {
    id: "fs-hd",
    name: "Fire Stick HD - Jailbroken & Ready",
    price: 119,
    description: "Premium jailbroken Fire Stick HD with 1 Year IPTV included. Get instant access to 18,000+ live TV channels, 60,000+ movies & TV shows, and all sports leagues including NFL, NBA, UFC, and PPV events. Fully configured & ready to use - you'll receive your login credentials, an easy 10-minute setup tutorial, and 24/7 customer support.",
    features: ["1080p Full HD Resolution", "18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "4K/HD Quality Streaming", "Works on Multiple Devices", "Instant Credential Delivery", "10-Minute Easy Setup", "Fully Pre-Configured & Ready", "24/7 Customer Support"],
    image: firestickHdImg,
    category: "firestick",
    badge: "STARTER"
  },
  {
    id: "fs-4k",
    name: "Fire Stick 4K - Jailbroken & Ready",
    price: 127.50,
    description: "Best-selling jailbroken Fire Stick 4K with Dolby Vision & 1 Year premium IPTV subscription included. Enjoy 18,000+ live TV channels, 60,000+ movies & TV shows in stunning 4K quality. Watch all major sports - NFL, NBA, UFC, and PPV events. Fully configured & ready to use with instant credentials, easy setup, and 24/7 support.",
    features: ["4K Ultra HD Resolution", "Dolby Vision & HDR10+", "18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "Premium IPTV Included", "Works on Multiple Devices", "Instant Credential Delivery", "10-Minute Easy Setup", "24/7 Customer Support"],
    image: firestick4kImg,
    category: "firestick",
    badge: "BEST VALUE",
    popular: true
  },
  {
    id: "fs-max",
    name: "Fire Stick 4K Max - Jailbroken & Ready",
    price: 136,
    description: "Ultimate jailbroken Fire Stick 4K Max with Wi-Fi 6E and 1 Year premium IPTV subscription. Experience 18,000+ live TV channels, 60,000+ movies & TV shows, and all major sports in breathtaking 4K with Dolby Atmos sound. Fully configured & ready to use - includes login credentials, quick setup guide, and priority 24/7 customer support.",
    features: ["4K Ultra HD with Wi-Fi 6E", "Dolby Vision, Atmos & HDR10+", "18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "Premium IPTV Included", "Works on Multiple Devices", "Instant Credential Delivery", "10-Minute Easy Setup", "Priority 24/7 Support"],
    image: firestick4kMaxImg,
    category: "firestick",
    badge: "PREMIUM"
  }
];

export default function MainStore() {
  const [, setLocation] = useLocation();
  const { addItem, addItemWithQuantity, items, openCart } = useCart();
  const { items: wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, openWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [selectedDevices, setSelectedDevices] = useState<Record<string, number>>({
    "1mo": 1,
    "3mo": 1,
    "6mo": 1,
    "1yr": 1,
  });
  const [firestickQuantities, setFirestickQuantities] = useState<Record<string, number>>({
    "fs-hd": 1,
    "fs-4k": 1,
    "fs-max": 1,
  });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const isAboutInView = useInView(aboutRef, { once: true, margin: "-100px" });
  const isShopInView = useInView(shopRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section) {
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState({}, '', '/');
      }, 300);
    }
  }, []);

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" as any } 
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.4, ease: "easeOut" as any } 
    }
  };

  const toggleWishlistItem = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        description: product.description,
      });
    }
  };

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  useEffect(() => {
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
    document.title = "StreamStickPro - Jailbroken Fire Sticks & IPTV | 18,000+ Channels";
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await apiCall('/api/products');
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

  const getFirestickDiscount = (quantity: number): { discount: number; label: string } => {
    if (quantity >= 3) return { discount: 0.15, label: "15% OFF" };
    if (quantity >= 2) return { discount: 0.10, label: "10% OFF" };
    return { discount: 0, label: "" };
  };

  const calculateFirestickPrice = (basePrice: number, quantity: number): { unitPrice: number; totalPrice: number; savings: number } => {
    const { discount } = getFirestickDiscount(quantity);
    const discountedUnitPrice = basePrice * (1 - discount);
    const totalPrice = discountedUnitPrice * quantity;
    const savings = (basePrice * quantity) - totalPrice;
    return { unitPrice: discountedUnitPrice, totalPrice, savings };
  };

  const navigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  const scrollToShop = () => navigateToSection('shop');
  const scrollToAbout = () => navigateToSection('about');
  const scrollToFaq = () => navigateToSection('faq');

  const firestickProducts = products.filter(p => p.category === 'firestick');
  const iptvProducts = products.filter(p => p.category === 'iptv');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StreamStickPro",
    "url": "https://streamstickpro.com/",
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
    "url": "https://streamstickpro.com/",
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
      
      {/* Sticky Sale Banner */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 text-white py-2 px-4 text-center font-bold animate-pulse" data-testid="banner-sale">
        <div className="container mx-auto flex items-center justify-center gap-3 flex-wrap">
          <Gift className="w-5 h-5" />
          <span className="text-sm md:text-base">🔥 LIMITED TIME SALE: Buy 2+ Fire Sticks Save 10% • Buy 3+ Save 15%! 🔥</span>
          <button 
            onClick={scrollToShop}
            className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-green-100 transition-colors"
            data-testid="button-shop-sale"
          >
            Shop Now →
          </button>
        </div>
      </div>

      <SEOSchema 
        faq={[
          { question: "What's included with a Fire Stick?", answer: "Every Fire Stick comes fully configured and ready to use with 1 Year of IPTV service included. You'll receive your login credentials instantly, a quick setup tutorial (10 minutes), and access to 24/7 customer support whenever you need assistance. Just plug it in and start streaming!" },
          { question: "How do I renew my subscription?", answer: "Simply come back to the site and purchase a renewal package. Your credentials will be updated instantly." },
          { question: "Do you offer support?", answer: "Yes, we offer 24/7 support via email for all active subscribers. Contact us at reloadedfiretvteam@gmail.com" },
          { question: "What devices are supported?", answer: "Our IPTV service works on Fire Sticks, Android boxes, Smart TVs, phones, tablets, and computers. Use up to 2 devices simultaneously!" }
        ]}
      />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-gray-900/95 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileNav scrollToShop={scrollToShop} scrollToAbout={scrollToAbout} scrollToFaq={scrollToFaq} />
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              <Flame className="w-7 h-7 text-orange-500" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Stream Stick Pro</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:flex text-gray-300 hover:text-white hover:bg-white/10" onClick={scrollToAbout} data-testid="nav-how-it-works">How It Works</Button>
            <Button variant="ghost" className="hidden md:flex text-gray-300 hover:text-white hover:bg-white/10" onClick={scrollToShop} data-testid="nav-shop">Shop</Button>
            <Button variant="ghost" className="hidden md:flex text-gray-300 hover:text-white hover:bg-white/10" onClick={() => setLocation("/blog")} data-testid="button-blog">Blog</Button>
            <Button variant="ghost" className="hidden md:flex text-gray-300 hover:text-white hover:bg-white/10" onClick={scrollToFaq} data-testid="button-support">Support</Button>
            <Button 
              onClick={openWishlist} 
              variant="ghost"
              className="relative text-gray-300 hover:text-white hover:bg-white/10"
              data-testid="button-wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistItems.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlistItems.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0" data-testid="text-wishlist-count">
                  {wishlistItems.length}
                </Badge>
              )}
            </Button>
            <Button 
              onClick={openCart} 
              className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Cart</span>
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
      <section ref={heroRef} className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden min-h-[600px] flex items-center">
        <motion.div 
          className="absolute inset-0 overflow-hidden"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <img
            src={heroImg}
            alt="Best Jailbroken Fire Stick 2025 - Premium IPTV Streaming Device"
            className="w-full h-full object-cover object-center"
            loading="eager"
            width={1920}
            height={600}
            fetchPriority="high"
            decoding="async"
            style={{ transform: 'scale(1.25)', transformOrigin: 'center center', contentVisibility: 'auto' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== fallbackHeroImg) {
                target.src = fallbackHeroImg;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
        </motion.div>

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
              <motion.div 
                className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10"
                whileHover={{ scale: 1.05, borderColor: "rgba(249, 115, 22, 0.5)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-orange-400 font-bold text-lg" data-testid="text-customers">
                  <AnimatedCounter end={2700} suffix="+" className="text-orange-400 font-bold text-lg" />
                </div>
                <div className="text-blue-200">Happy Customers</div>
              </motion.div>
              <motion.div 
                className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10"
                whileHover={{ scale: 1.05, borderColor: "rgba(249, 115, 22, 0.5)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-orange-400 font-bold text-lg" data-testid="text-rating">
                  <AnimatedCounter end={4.9} duration={1.5} decimals={1} className="text-orange-400 font-bold text-lg" />/5 ⭐
                </div>
                <div className="text-blue-200">Customer Rating</div>
              </motion.div>
              <motion.div 
                className="bg-white/5 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10"
                whileHover={{ scale: 1.05, borderColor: "rgba(249, 115, 22, 0.5)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-orange-400 font-bold text-lg">
                  <AnimatedCounter end={18000} suffix="+" className="text-orange-400 font-bold text-lg" />
                </div>
                <div className="text-blue-200">Channels Available</div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
      </section>

      {/* Countdown Timer */}
      <CountdownTimer />

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
      <section id="about" ref={aboutRef} className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isAboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
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
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate={isAboutInView ? "visible" : "hidden"}
          >
            <motion.div 
              variants={fadeInUp}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/10"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Be Streaming in 10 Minutes</h3>
              <p className="text-gray-400">Your Fire Stick comes with instant login credentials and an easy 10-minute setup video. Start watching Live TV, Movies, Series, Sports & PPV today with 24/7 support ready when you need it.</p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Premium Content</h3>
              <p className="text-gray-400">Access 18,000+ live channels, 60,000+ movies, and all sports & PPV events.</p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/10"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <Check className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">24/7 Support</h3>
              <p className="text-gray-400">Our dedicated team is always available to help you with any questions or issues.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" ref={shopRef} className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isShopInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
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
          </motion.div>

          {/* Fire Stick Tier Comparison Table */}
          <motion.div 
            className="mb-12 overflow-x-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                <Flame className="w-8 h-8 text-orange-500" />
                Fire Stick Comparison
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Be streaming in 10 minutes! Your Fire Stick includes 1 Year IPTV, instant login credentials, a quick setup video, and 24/7 support. Live TV, Movies, Series, Sports & PPV await!
              </p>
            </div>
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 overflow-hidden" data-testid="tier-comparison-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left p-4 text-gray-400 font-medium">Features</th>
                    <th className="text-center p-4">
                      <div className="text-lg font-bold text-white">HD</div>
                      <div className="text-2xl font-bold text-orange-400">$119</div>
                      <div className="text-xs text-gray-400 line-through">$140</div>
                    </th>
                    <th className="text-center p-4 bg-orange-500/10 relative">
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-b">BEST VALUE</div>
                      <div className="text-lg font-bold text-white pt-4">4K</div>
                      <div className="text-2xl font-bold text-orange-400">$127.50</div>
                      <div className="text-xs text-gray-400 line-through">$150</div>
                    </th>
                    <th className="text-center p-4">
                      <div className="text-lg font-bold text-white">4K Max</div>
                      <div className="text-2xl font-bold text-orange-400">$136</div>
                      <div className="text-xs text-gray-400 line-through">$160</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-300">Resolution</td>
                    <td className="text-center p-4 text-white">1080p Full HD</td>
                    <td className="text-center p-4 text-white bg-orange-500/5">4K Ultra HD</td>
                    <td className="text-center p-4 text-white">4K Ultra HD</td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-300">HDR Support</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-500 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-300">Dolby Vision & Atmos</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-500 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-300">Wi-Fi 6E (Fastest)</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-500 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><X className="w-5 h-5 text-gray-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-300">1 Year IPTV Included</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-300">18,000+ Live Channels</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-300">60,000+ Movies & Shows</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-300">All Sports & PPV Events</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-300">24/7 Customer Support</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Quantity Discount Tiers */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-2xl p-6 border border-green-500/30" data-testid="discount-tiers">
                <h4 className="text-xl font-bold text-center mb-4 text-green-400 flex items-center justify-center gap-2">
                  <Gift className="w-6 h-6" />
                  Multi-Buy Discount Tiers
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-white">1</div>
                    <div className="text-gray-400 text-sm">Fire Stick</div>
                    <div className="text-orange-400 font-semibold mt-2">Regular Price</div>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30 transform hover:scale-105 transition-transform">
                    <div className="text-2xl font-bold text-white">2+</div>
                    <div className="text-gray-400 text-sm">Fire Sticks</div>
                    <div className="text-green-400 font-bold mt-2">SAVE 10%</div>
                  </div>
                  <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/50 ring-2 ring-green-500/30 transform hover:scale-105 transition-transform">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold hidden md:block">BEST DEAL</div>
                    <div className="text-2xl font-bold text-white">3+</div>
                    <div className="text-gray-400 text-sm">Fire Sticks</div>
                    <div className="text-green-400 font-bold mt-2">SAVE 15%</div>
                  </div>
                </div>
                <p className="text-center text-green-300 mt-4 text-sm">
                  Perfect for families! Get Fire Sticks for multiple TVs and save big.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Fire Sticks */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              Choose Your Fire Stick
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {firestickProducts.map((product, index) => {
                const cardGradients = [
                  'from-slate-800 via-slate-900 to-gray-900',
                  'from-orange-950/60 via-slate-900 to-gray-900',
                  'from-indigo-950/60 via-slate-900 to-gray-900'
                ];
                const borderColors = [
                  'border-slate-600/60 hover:border-orange-500/70',
                  'border-orange-500/40 hover:border-orange-400',
                  'border-indigo-500/40 hover:border-indigo-400'
                ];
                const glowColors = [
                  'shadow-slate-500/20',
                  'shadow-orange-500/40',
                  'shadow-indigo-500/30'
                ];
                const accentGradients = [
                  'from-slate-400/20 via-slate-500/10 to-transparent',
                  'from-orange-400/30 via-amber-500/15 to-transparent',
                  'from-indigo-400/25 via-purple-500/15 to-transparent'
                ];
                
                return (
                <div
                  key={product.id}
                  className={`relative rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 group ${
                    product.popular 
                      ? 'ring-4 ring-orange-500 scale-105 shadow-2xl shadow-orange-500/50' 
                      : `hover:shadow-2xl ${glowColors[index]}`
                  }`}
                  data-testid={`card-product-${product.id}`}
                >
                  {/* Multi-layer background for depth */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${cardGradients[index]}`} />
                  
                  {/* Decorative tech grid pattern */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }} />
                  
                  {/* Accent glow at top */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${accentGradients[index]} opacity-80`} />
                  
                  {/* Radial highlight effect */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/15 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Corner accent decorations */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full" />
                  
                  {/* Animated border glow on hover */}
                  <div className={`absolute inset-0 border-2 ${borderColors[index]} rounded-2xl transition-all duration-500 group-hover:shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]`} />
                  
                  {product.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce">
                        <Star className="w-4 h-4 fill-current" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="relative h-56 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10 opacity-60" />
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                        width={400}
                        height={224}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== firestick4kImg) {
                            target.src = firestick4kImg;
                          }
                        }}
                      />
                      <div className={`absolute top-4 right-4 z-20 px-4 py-2 rounded-full font-bold text-sm shadow-lg ${
                        product.id === 'fs-max' 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                          : product.popular 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                            : 'bg-blue-500 text-white'
                      }`}>
                        {product.badge}
                      </div>
                      {product.id === 'fs-4k' && (
                        <div className="absolute top-4 left-4 z-20 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg">
                          1 YEAR INCLUDED
                        </div>
                      )}
                      <QuickViewButton onClick={() => openQuickView(product)} />
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlistItem(product); }}
                        className={`absolute bottom-4 left-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isInWishlist(product.id) 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                            : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                        }`}
                        data-testid={`button-wishlist-${product.id}`}
                        aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-8 relative">
                      <h4 className="text-2xl font-bold mb-4 text-white">{product.name}</h4>

                      {/* Quantity Selector */}
                      <div className="mb-4">
                        <label className="text-sm text-gray-300 mb-2 block">Quantity (Buy More & Save!):</label>
                        <div className="flex gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((qty) => {
                            const discountInfo = getFirestickDiscount(qty);
                            return (
                              <button
                                key={qty}
                                onClick={() => setFirestickQuantities(prev => ({ ...prev, [product.id]: qty }))}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all relative ${
                                  firestickQuantities[product.id] === qty
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                                data-testid={`button-qty-${product.id}-${qty}`}
                              >
                                {qty}
                                {discountInfo.label && (
                                  <span className="absolute -top-2 -right-1 bg-green-500 text-white text-[8px] px-1 rounded">
                                    {discountInfo.label}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-green-400 flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Buy 2+ save 10% • Buy 3+ save 15%
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="mb-6">
                        {(() => {
                          const qty = firestickQuantities[product.id] || 1;
                          const { unitPrice, totalPrice, savings } = calculateFirestickPrice(product.price, qty);
                          const discountInfo = getFirestickDiscount(qty);
                          return (
                            <>
                              <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400" data-testid={`text-price-${product.id}`}>
                                  ${totalPrice.toFixed(2)}
                                </span>
                                {qty > 1 && (
                                  <span className="text-sm text-gray-400">
                                    (${unitPrice.toFixed(2)} each)
                                  </span>
                                )}
                              </div>
                              {savings > 0 && (
                                <p className="text-green-400 text-sm mt-1 font-semibold flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  You save ${savings.toFixed(2)} with {discountInfo.label}!
                                </p>
                              )}
                              <p className="text-blue-200 text-sm mt-2 flex items-center gap-2">
                                <Gift className="w-4 h-4 text-green-400" />
                                Each includes 1 Year IPTV Subscription
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      <div className="flex gap-2 mb-6">
                        <button
                          onClick={() => {
                            const qty = firestickQuantities[product.id] || 1;
                            const { unitPrice } = calculateFirestickPrice(product.price, qty);
                            addItemWithQuantity(product as any, qty, unitPrice);
                          }}
                          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                            product.popular
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/50'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg'
                          }`}
                          data-testid={`button-add-${product.id}`}
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Add {firestickQuantities[product.id] > 1 ? `${firestickQuantities[product.id]} ` : ''}to Cart
                        </button>
                      </div>

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
                </div>
                );
              })}
            </div>
          </div>

          {/* Sports Carousel */}
          <SportsCarousel />

          {/* Demo Video */}
          <DemoVideo />

          {/* IPTV Subscriptions */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-blue-500" />
              IPTV Subscriptions Only
            </h3>
            <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto">
              Choose your subscription length and number of devices. Multi-device plans let you stream on multiple TVs, phones, or tablets at the same time!
            </p>
            
            {/* Free Trial Box */}
            <FreeTrial />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {iptvPricingMatrix.map((plan, index) => {
                const deviceCount = selectedDevices[plan.duration];
                const selectedPrice = plan.prices.find(p => p.devices === deviceCount) || plan.prices[0];
                const cardGradients = [
                  'from-slate-800 via-slate-900 to-gray-900',
                  'from-blue-950/50 via-slate-900 to-gray-900',
                  'from-cyan-950/50 via-slate-900 to-gray-900',
                  'from-emerald-950/50 via-slate-900 to-gray-900'
                ];
                
                return (
                  <div
                    key={plan.duration}
                    className={`relative rounded-2xl overflow-hidden transform transition-all duration-300 group ${
                      plan.popular 
                        ? 'ring-4 ring-blue-500 shadow-2xl shadow-blue-500/50 scale-105' 
                        : 'hover:shadow-2xl hover:shadow-blue-500/20'
                    }`}
                    data-testid={`card-product-iptv-${plan.duration}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-b ${cardGradients[index]} opacity-95`} />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50" />
                    <div className={`absolute inset-0 border-2 ${
                      plan.popular 
                        ? 'border-blue-500/50' 
                        : plan.duration === '1yr' 
                          ? 'border-green-500/30 hover:border-green-500/60' 
                          : 'border-slate-700/50 hover:border-blue-500/50'
                    } rounded-2xl transition-colors duration-300`} />
                    
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce text-sm">
                          <Star className="w-4 h-4 fill-current" />
                          POPULAR
                        </div>
                      </div>
                    )}

                    <div className="relative z-10">
                      <div className="relative h-40 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10 opacity-60" />
                        <img
                          src={iptvImg}
                          alt={`IPTV ${plan.durationLabel} Subscription`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                          width={300}
                          height={160}
                        />
                        <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full font-bold text-xs shadow-lg ${
                          plan.duration === '1yr' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                            : plan.popular 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'bg-orange-500 text-white'
                        }`}>
                          {plan.badge}
                        </div>
                        {(plan.duration === "6mo" || plan.duration === "1yr") && (
                          <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full font-bold text-xs shadow-lg">
                            SAVE 10%
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h4 className="text-xl font-bold mb-2 text-white">{plan.durationLabel} IPTV</h4>
                        <p className="text-gray-400 text-xs mb-4 line-clamp-2">{plan.description}</p>

                        <div className="mb-4">
                          <label className="text-sm text-gray-300 mb-2 block">Number of Devices:</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                onClick={() => setSelectedDevices(prev => ({ ...prev, [plan.duration]: num }))}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                  deviceCount === num
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                                data-testid={`button-device-${plan.duration}-${num}`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400" data-testid={`text-price-iptv-${plan.duration}`}>
                              ${selectedPrice.price}
                            </span>
                            <span className="text-gray-400 text-sm">
                              / {plan.durationLabel.toLowerCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {deviceCount} device{deviceCount > 1 ? 's' : ''} included
                          </p>
                        </div>

                        <button
                          onClick={() => addItem({
                            id: selectedPrice.productId,
                            name: `IPTV ${plan.durationLabel} - ${deviceCount} Device${deviceCount > 1 ? 's' : ''}`,
                            price: selectedPrice.price,
                            image: iptvImg,
                            description: plan.description,
                            features: plan.features,
                            category: 'iptv',
                            badge: plan.badge,
                          } as Product)}
                          className="w-full py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30"
                          data-testid={`button-add-iptv-${plan.duration}`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Subscribe Now
                        </button>

                        <div className="space-y-1.5">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-blue-100 text-xs">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* Savings Calculator */}
      <SavingsCalculator />

      {/* From Our Blog Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Learn More</span>
            </h2>
            <p className="text-gray-400 text-lg">Helpful guides to get the most out of your streaming experience</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <a href="/blog/what-is-jailbroken-fire-stick" className="block" data-testid="blog-card-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all cursor-pointer h-full"
              >
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">What is a Jailbroken Fire Stick?</h3>
                <p className="text-gray-400 text-sm mb-4">Learn everything about jailbroken Fire Sticks, how they work, and what you can stream.</p>
                <span className="text-orange-400 text-sm font-semibold flex items-center gap-1">
                  Read More <ChevronRight className="w-4 h-4" />
                </span>
              </motion.div>
            </a>

            <a href="/blog/fire-stick-vs-cable-cost-comparison" className="block" data-testid="blog-card-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all cursor-pointer h-full"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Fire Stick vs Cable: Cost Comparison</h3>
                <p className="text-gray-400 text-sm mb-4">See how much you can save by switching from cable TV to streaming with IPTV.</p>
                <span className="text-orange-400 text-sm font-semibold flex items-center gap-1">
                  Read More <ChevronRight className="w-4 h-4" />
                </span>
              </motion.div>
            </a>

            <a href="/blog/best-iptv-sports-channels-2025" className="block" data-testid="blog-card-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all cursor-pointer h-full"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Best IPTV Sports Channels 2025</h3>
                <p className="text-gray-400 text-sm mb-4">Discover all the sports channels available including NFL, NBA, UFC, and more.</p>
                <span className="text-orange-400 text-sm font-semibold flex items-center gap-1">
                  Read More <ChevronRight className="w-4 h-4" />
                </span>
              </motion.div>
            </a>
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setLocation("/blog")}
              className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              data-testid="button-view-all-articles"
            >
              View All Articles <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

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
                Be streaming in 10 minutes! Every Fire Stick comes with 1 Year IPTV included, your login credentials, and an easy setup video. Live TV, Movies, Series, Sports & PPV - all waiting for you!
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

      {/* WhatsApp Chat Widget - Higher z-index to stay above all CTAs */}
      <a 
        href="https://wa.me/15853037381" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-6 z-[100]"
        data-testid="link-whatsapp"
      >
        <Button className="rounded-full w-14 h-14 shadow-2xl bg-green-500 hover:bg-green-600 animate-pulse border-2 border-white/20" data-testid="button-chat">
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      </a>

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
                <li><a href="/blog" className="hover:text-orange-400 transition-colors cursor-pointer">Blog & Guides</a></li>
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

      {/* Floating CTA */}
      <FloatingCTA />

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />

      {/* Scroll to Top */}
      <ScrollToTopButton />

      {/* Product Quick View Modal */}
      <ProductQuickView 
        product={quickViewProduct} 
        isOpen={isQuickViewOpen} 
        onClose={closeQuickView} 
      />
    </div>
  );
}
