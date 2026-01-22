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
// Social proof components removed per user request
import { ChannelLogos } from "@/components/ChannelLogos";
import { SavingsCalculator } from "@/components/SavingsCalculator";
import { StickyMobileCTA, ScrollToTopButton } from "@/components/StickyMobileCTA";
import { SEOSchema, QASchema, ServiceSchema, ItemListSchema } from "@/components/SEOSchema";
import { ProductQuickView, QuickViewButton } from "@/components/ProductQuickView";
import { MobileNav } from "@/components/MobileNav";
import { ComparisonTable } from "@/components/ComparisonTable";
import { FloatingCTA } from "@/components/FloatingCTA";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import SupportMessageBox from "@/components/SupportMessageBox";

const SUPABASE_BASE = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges";
const firestickHdImg = `${SUPABASE_BASE}/OIP_(11)99_1764978938773.jpg`;
const firestick4kImg = `${SUPABASE_BASE}/71+Pvh7WB6L._AC_SL1500__1764978938770.jpg`;
const firestick4kMaxImg = `${SUPABASE_BASE}/71E1te69hZL._AC_SL1500__1764978938773.jpg`;
const onn4kImg = `${SUPABASE_BASE}/s-l1600onnbok_1766008738774.webp`;
const onn4kProImg = `${SUPABASE_BASE}/OIPonnbox4k_1766008832103.webp`;
const iptvImg = `${SUPABASE_BASE}/iptv-subscription.jpg`;
const fallbackHeroImg = `${SUPABASE_BASE}/stock_images/amazon_fire_tv_stick_cc445778.jpg`;
const heroImg = `${SUPABASE_BASE}/hero-firestick-breakout.jpg`;
const productBenefitList = [
  "18,000 live channels worldwide",
  "+24k VODs and Series",
  "PPV Channels (UFC, NFL…)",
  "No Freezing",
  "Regular Updates",
  "M3U Delivered Instantly",
  "24/7 Support"
];

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
    description: "Premium Live TV streaming plan with extensive content library, thousands of movies & TV shows, and comprehensive sports coverage.",
    features: productBenefitList,
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
    description: "Save more with 3 months! Premium Live TV plan with extensive content library, thousands of movies & shows, and comprehensive sports coverage.",
    features: productBenefitList,
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
    description: "10% OFF! 6-month premium Live TV streaming plan with extensive content library, thousands of movies & shows, and comprehensive sports coverage.",
    features: productBenefitList,
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
    description: "Best deal - Full year premium Live TV plan with extensive content library, thousands of movies & shows, and comprehensive sports coverage!",
    features: productBenefitList,
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
    id: "firestick-hd",
    name: "StreamStick Starter Kit",
    price: 130,
    description: "Get fully loaded in just 10 minutes! Your Fire Stick arrives ready - simply plug in, enter your credentials (sent instantly after purchase), and follow our quick setup video. You'll unlock an extensive live content library, thousands of movies & TV shows, and comprehensive sports coverage including NFL, NBA, UFC, and live events. Includes 1 Year Live TV plan and 24/7 customer support.",
    features: productBenefitList,
    image: firestickHdImg,
    category: "firestick",
    badge: "STARTER"
  },
  {
    id: "firestick-4k",
    name: "StreamStick 4K Kit",
    price: 140,
    description: "Best-selling Fire Stick - get fully loaded in 10 minutes! Plug in, enter your instant credentials, follow our setup video, and you're streaming in 4K with Dolby Vision. Enjoy an extensive live content library, thousands of movies & TV shows, and all major sports - NFL, NBA, UFC, and live events. Includes 1 Year premium Live TV plan and 24/7 support.",
    features: productBenefitList,
    image: firestick4kImg,
    category: "firestick",
    badge: "BEST VALUE",
    popular: true
  },
  {
    id: "firestick-4k-max",
    name: "StreamStick Max Kit",
    price: 150,
    description: "Ultimate 4K Max with Wi-Fi 6E - get fully loaded in just 10 minutes! Your device arrives ready. Plug in, use your instant credentials, follow our quick setup video, and experience breathtaking 4K with Dolby Atmos sound. Access an extensive live content library, thousands of movies & shows, and all major sports. Includes 1 Year premium Live TV plan and priority 24/7 support.",
    features: productBenefitList,
    image: firestick4kMaxImg,
    category: "firestick",
    badge: "PREMIUM"
  },
  {
    id: "android-onn-4k",
    name: "ONN 4K Streaming Device Kit",
    price: 140,
    description: "Upgrade from Fire Stick to Android! The ONN 4K Streaming Device with Google TV delivers the same great features you love, plus built-in storage for live DVR recording. Get fully loaded in 10 minutes - plug in, enter your instant credentials, and access an extensive live content library, thousands of movies & shows, and comprehensive sports coverage. Includes 1 Year Live TV plan and 24/7 support.",
    features: productBenefitList,
    image: onn4kImg,
    category: "firestick",
    badge: "ANDROID"
  },
  {
    id: "android-onn-pro",
    name: "ONN 4K Ultra HD Pro Kit",
    price: 160,
    description: "The ultimate Android streaming upgrade! ONN 4K Ultra HD Pro features expanded storage for extensive DVR recording, Google TV interface, and premium performance. Get fully loaded in 10 minutes - plug in, use your instant credentials, and experience crystal-clear 4K with Dolby Audio. Access an extensive live content library, thousands of movies & shows, and all major sports. Includes 1 Year premium Live TV plan and priority 24/7 support.",
    features: productBenefitList,
    image: onn4kProImg,
    category: "firestick",
    badge: "ANDROID PRO"
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
    "firestick-hd": 1,
    "firestick-4k": 1,
    "firestick-4k-max": 1,
    "android-onn-4k": 1,
    "android-onn-pro": 1,
  });
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

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
    const handleScroll = () => {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section) {
        setTimeout(() => {
          document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
          window.history.replaceState({}, '', '/');
        }, 300);
      }
    };
    
    // Run on mount
    handleScroll();
    
    // Also listen for popstate (back/forward nav) and custom event for internal nav
    window.addEventListener('popstate', handleScroll);
    window.addEventListener('scrollToSection', handleScroll);
    
    return () => {
      window.removeEventListener('popstate', handleScroll);
      window.removeEventListener('scrollToSection', handleScroll);
    };
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
    document.title = "StreamStickPro - Premium Streaming Devices & Live TV Plans";
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
  const openSupport = () => setIsSupportOpen(true);
  const scrollToHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const scrollToFreeTrial = () => navigateToSection('shop');

  const firestickProducts = products.filter(p => p.category === 'firestick');
  const iptvProducts = products.filter(p => p.category === 'iptv');

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StreamStickPro",
    "url": "https://streamstickpro.com/",
    "description": "Premium pre-configured streaming devices with Live TV plans - extensive content library, thousands of movies, comprehensive sports coverage",
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
          "url": `https://streamstickpro.com/#${product.id}`,
          "price": product.price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans selection:bg-orange-500 selection:text-white pb-32 md:pb-20 relative">
      {/* Parallax Hero Background - Scrolls across entire website with lighter overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/25 to-black/45" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productListData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }} />
      
      {/* Q&A Schema for Answer Engine Optimization (AEO) */}
      <QASchema questions={[
        {
          question: "What is IPTV and how does it work?",
          answer: "IPTV (Internet Protocol Television) is a streaming service that delivers live TV channels and on-demand content over the internet. Unlike traditional cable, IPTV works on any internet-connected device including Fire Sticks, Smart TVs, phones, and tablets. You receive login credentials that allow you to access 18,000+ live channels, 100,000+ movies and series instantly.",
          dateCreated: new Date().toISOString()
        },
        {
          question: "How do I set up IPTV on Fire Stick?",
          answer: "Setting up IPTV on Fire Stick is simple. Purchase a pre-configured Fire Stick from StreamStickPro and it arrives ready to stream. You'll receive instant login credentials and setup video tutorials. Just plug in your Fire Stick, connect to WiFi, and follow the 10-minute tutorial to start streaming thousands of channels immediately.",
          dateCreated: new Date().toISOString()
        },
        {
          question: "What channels are included with IPTV service?",
          answer: "Our IPTV service includes 18,000+ live TV channels worldwide covering all major categories: sports (NFL, NBA, MLB, UFC, boxing PPV), movies, news, entertainment, kids channels, international channels, and premium networks. Plus access to 100,000+ movies and TV series on-demand with regular updates.",
          dateCreated: new Date().toISOString()
        },
        {
          question: "Do I need a credit card for the free trial?",
          answer: "No credit card required for our 36-hour free trial. Simply sign up with your email address to get instant access to all 18,000+ live channels and the complete content library. Experience the service risk-free before making any purchase commitment.",
          dateCreated: new Date().toISOString()
        },
        {
          question: "How much does IPTV cost compared to cable?",
          answer: "IPTV is significantly cheaper than cable TV. Our plans start at just $15/month compared to cable which typically costs $100-200/month. With IPTV you get more channels, on-demand content, multi-device streaming, and save $1,000+ per year while accessing more entertainment options.",
          dateCreated: new Date().toISOString()
        }
      ]} />

      {/* Service Schema for IPTV Service Offerings */}
      <ServiceSchema 
        name="Premium IPTV Streaming Service"
        description="Access 18,000+ live TV channels, 100,000+ movies and series, all premium sports including NFL, NBA, MLB, UFC PPV events. Multi-device streaming with 24/7 support."
        serviceType="IPTV Streaming Service"
        areaServed="Worldwide"
      />

      {/* ItemList Schema for Product Listings */}
      <ItemListSchema 
        name="StreamStickPro Products"
        description="Pre-configured Fire Sticks and IPTV subscription plans"
        items={products.slice(0, 6).map(p => ({
          name: p.name,
          description: p.description,
          url: `https://streamstickpro.com#${p.id}`,
          image: p.image,
          price: p.price
        }))}
      />
      
      {/* Navigation - Elite Glassmorphism Design */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl shadow-2xl shadow-black/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MobileNav scrollToShop={scrollToShop} scrollToAbout={scrollToAbout} scrollToFaq={scrollToFaq} onSupportClick={openSupport} />
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              <motion.div
                animate={{
                  scale: [1, 1.1, 0.95, 1.05, 1],
                  opacity: [1, 0.8, 1, 0.9, 1],
                  filter: [
                    "brightness(1)",
                    "brightness(1.3)",
                    "brightness(1.1)",
                    "brightness(1.2)",
                    "brightness(1)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Flame className="w-7 h-7 text-orange-500" />
              </motion.div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Stream Stick Pro</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:flex text-gray-100 hover:text-white hover:bg-white/10 font-medium" onClick={scrollToAbout} data-testid="nav-how-it-works">How It Works</Button>
            <Button variant="ghost" className="hidden md:flex text-gray-100 hover:text-white hover:bg-white/10 font-medium" onClick={scrollToShop} data-testid="nav-shop">Shop</Button>
            <Button 
              onClick={openSupport} 
              className="hidden md:flex bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105" 
              data-testid="button-contact-header"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
            <Button 
              onClick={openWishlist} 
              variant="ghost"
              className="relative text-gray-200 hover:text-white hover:bg-white/10"
              data-testid="button-wishlist"
              aria-label={`Wishlist${wishlistItems.length > 0 ? `, ${wishlistItems.length} items` : ''}`}
            >
              <Heart className={`w-5 h-5 ${wishlistItems.length > 0 ? 'fill-red-500 text-red-500' : ''}`} aria-hidden="true" />
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
              aria-label={`Shopping cart${items.length > 0 ? `, ${items.length} items` : ''}`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" aria-hidden="true" />
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

      {/* Main Content */}
      <main id="main-content" role="main">
      {/* Hero Section */}
      {/* Elite Hero Section - Enhanced Visuals */}
      <section ref={heroRef} className="relative text-white overflow-hidden min-h-[700px] md:min-h-[800px] flex items-center z-10">

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-sm border-2 border-orange-400/50 rounded-full text-sm font-bold text-orange-200 animate-pulse shadow-lg shadow-orange-500/30">
                ⚡ Instant Setup • 🎯 Plug & Play • 🚀 Ready in Minutes
              </span>
            </motion.div>

            {/* Elite Bold Typography */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[1.1] tracking-tight"
            >
              <span className="block text-white drop-shadow-2xl mb-2">Save $1,000+</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 via-orange-400 to-red-500 bg-[length:200%_100%] animate-gradient bg-clip-text mb-2">
                Per Year vs Cable
              </span>
              <span className="block text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-white mt-4 font-bold">18,000+ Live Channels</span>
              <span className="block text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-blue-200 mt-2 font-bold">100,000+ Movies & Series</span>
            </motion.h1>

            {/* Elite Glassmorphism Answer Block for AEO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-5xl mx-auto px-4 mb-6"
            >
              <div className="bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent backdrop-blur-2xl rounded-3xl border-2 border-blue-400/30 shadow-2xl shadow-blue-500/20 p-8 md:p-10">
                <p className="text-lg sm:text-xl md:text-2xl text-white leading-relaxed font-medium">
                  <strong className="text-2xl md:text-3xl font-black text-blue-200 block mb-3">What is StreamStickPro?</strong>
                  <span className="text-gray-50">StreamStickPro is a premium IPTV streaming service that delivers <strong className="text-white font-bold">18,000+ live TV channels</strong> and <strong className="text-white font-bold">100,000+ movies and series</strong> over the internet to any device. Unlike cable TV, StreamStickPro works on Fire Sticks, Smart TVs, phones, and tablets, providing instant access to premium content including all major sports, PPV events, and on-demand entertainment for a fraction of cable costs.</span>
                </p>
              </div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white mb-2 md:mb-4 max-w-3xl mx-auto px-4 font-bold"
            >
              Cut Cable Forever • Unlimited Streaming • All Premium Content Included
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8 max-w-3xl mx-auto px-4 leading-relaxed"
            >
              <span className="font-semibold text-orange-300">✅ Fully Pre-Configured</span> • Devices arrive ready to stream • 
              <span className="font-semibold text-green-300"> All Sports Channels</span> • UFC, NFL, NBA, MLB included • 
              <span className="font-semibold text-blue-300"> Zero Hidden Fees</span> • One simple price, everything included
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 md:mb-8 px-4"
            >
              {/* Elite Glassmorphism CTAs */}
              <motion.button
                onClick={scrollToShop}
                className="group px-12 py-6 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-[length:200%_100%] hover:bg-[position:100%_0] rounded-2xl font-black text-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-2xl shadow-orange-500/60 inline-flex items-center justify-center gap-4 text-white border-2 border-orange-300/50"
                data-testid="button-shop-now"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-7 h-7 group-hover:animate-bounce" />
                Get Started Now
                <span className="bg-white/40 backdrop-blur-sm rounded-full px-5 py-2 text-base font-black border border-white/50">Starting at $15/mo</span>
              </motion.button>
              <motion.button
                onClick={openSupport}
                className="px-12 py-6 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl hover:from-white/25 hover:via-white/15 hover:to-white/10 border-2 border-white/40 hover:border-white/60 rounded-2xl font-black text-2xl transition-all duration-300 inline-flex items-center justify-center gap-3 text-white shadow-xl shadow-white/10 hover:shadow-2xl hover:shadow-white/20"
                data-testid="button-contact-hero"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-7 h-7" />
                Questions? Ask Us
              </motion.button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm md:text-base"
            >
              {/* Elite Glassmorphism Cards */}
              <motion.div 
                className="bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent backdrop-blur-xl rounded-2xl px-6 py-5 border border-orange-400/20 shadow-xl shadow-orange-500/10"
                whileHover={{ scale: 1.08, borderColor: "rgba(249, 115, 22, 0.6)", boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)" }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="text-orange-400 font-extrabold text-2xl md:text-3xl mb-1">
                  <AnimatedCounter end={18000} suffix="+" className="text-orange-400 font-extrabold text-2xl md:text-3xl" />
                </div>
                <div className="text-blue-100 font-semibold text-sm md:text-base">Live TV Channels</div>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent backdrop-blur-xl rounded-2xl px-6 py-5 border border-purple-400/20 shadow-xl shadow-purple-500/10"
                whileHover={{ scale: 1.08, borderColor: "rgba(168, 85, 247, 0.6)", boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)" }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="text-purple-400 font-extrabold text-2xl md:text-3xl mb-1">
                  <AnimatedCounter end={100000} suffix="+" className="text-purple-400 font-extrabold text-2xl md:text-3xl" />
                </div>
                <div className="text-blue-100 font-semibold text-sm md:text-base">Movies & Series</div>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent backdrop-blur-xl rounded-2xl px-6 py-5 border border-green-400/20 shadow-xl shadow-green-500/10"
                whileHover={{ scale: 1.08, borderColor: "rgba(34, 197, 94, 0.6)", boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)" }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="text-green-400 font-extrabold text-2xl md:text-3xl mb-1">
                  <AnimatedCounter end={1000} suffix="+" className="text-green-400 font-extrabold text-2xl md:text-3xl" />
                </div>
                <div className="text-blue-100 font-semibold text-sm md:text-base">Dollars Saved vs Cable</div>
              </motion.div>
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
            <p className="text-gray-200 text-lg">See why customers choose us over the competition</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Elite Glassmorphism Comparison - Competitors */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-red-950/40 via-red-900/20 to-transparent backdrop-blur-2xl border-2 border-red-500/40 rounded-3xl p-10 shadow-2xl shadow-red-500/20"
              data-testid="comparison-competitors"
              whileHover={{ scale: 1.02, borderColor: "rgba(239, 68, 68, 0.6)" }}
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
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Elite Glassmorphism Comparison - StreamStickPro */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-green-950/40 via-emerald-900/20 to-transparent backdrop-blur-2xl border-2 border-green-500/40 rounded-3xl p-10 shadow-2xl shadow-green-500/20 ring-2 ring-green-400/30"
              data-testid="comparison-streamstickpro"
              whileHover={{ scale: 1.02, borderColor: "rgba(34, 197, 94, 0.6)", boxShadow: "0 25px 50px rgba(34, 197, 94, 0.3)" }}
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
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className="py-24 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm">
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
            {/* Elite Glassmorphism Feature Cards */}
            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-orange-500/15 via-red-500/5 to-transparent backdrop-blur-2xl rounded-3xl p-10 border-2 border-orange-400/30 shadow-2xl shadow-orange-500/20 hover:border-orange-400/60 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/40"
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/50">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white">Be Streaming in 10 Minutes</h3>
              <p className="text-gray-100 text-lg leading-relaxed">Your StreamStick comes with instant login credentials and an easy 10-minute setup video. Start watching Live TV, Movies, Series & Sports today with 24/7 support ready when you need it.</p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-blue-500/15 via-cyan-500/5 to-transparent backdrop-blur-2xl rounded-3xl p-10 border-2 border-blue-400/30 shadow-2xl shadow-blue-500/20 hover:border-blue-400/60 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40"
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white">Premium Content</h3>
              <p className="text-gray-100 text-lg leading-relaxed">Access an extensive live content library, thousands of movies, and comprehensive sports coverage.</p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-green-500/15 via-emerald-500/5 to-transparent backdrop-blur-2xl rounded-3xl p-10 border-2 border-green-400/30 shadow-2xl shadow-green-500/20 hover:border-green-400/60 transition-all duration-300 hover:scale-105 hover:shadow-green-500/40"
              whileHover={{ y: -5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/50">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white">24/7 Support</h3>
              <p className="text-gray-100 text-lg leading-relaxed">Our dedicated team is always available to help you with any questions or issues.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" ref={shopRef} className="py-24 bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
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
              Browse our complete collection of pre-configured streaming devices and Live TV plans
            </p>
          </motion.div>

          {/* Live TV Plans */}
          <div className="mt-6 mb-16">
            <h3 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-blue-500" />
              Live TV Plans & Free Trial
            </h3>
            <p className="text-center text-gray-200 mb-8 max-w-2xl mx-auto">
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
                    className={`relative rounded-2xl overflow-hidden transition-all duration-300 group ${
                      plan.popular 
                        ? 'ring-2 ring-blue-400 shadow-2xl shadow-blue-500/40' 
                        : 'hover:shadow-xl hover:shadow-blue-500/20'
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
                          alt={`Live TV ${plan.durationLabel} Plan`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                          width={300}
                          height={160}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== fallbackHeroImg) {
                              target.src = fallbackHeroImg;
                            }
                          }}
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
                        <h4 className="text-xl font-bold mb-2 text-white">{plan.durationLabel} Live TV</h4>
                        <p className="text-gray-200 text-xs mb-4 line-clamp-2">{plan.description}</p>

                        <div className="mb-4">
                          <label className="text-sm text-gray-200 mb-2 block">Number of Devices:</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                onClick={() => setSelectedDevices(prev => ({ ...prev, [plan.duration]: num }))}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                  deviceCount === num
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                                }`}
                                data-testid={`button-device-${plan.duration}-${num}`}
                                aria-label={`Select ${num} device${num > 1 ? 's' : ''}`}
                                aria-pressed={deviceCount === num}
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
                            <span className="text-gray-200 text-sm">
                              / {plan.durationLabel.toLowerCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-200 mt-1">
                            {deviceCount} device{deviceCount > 1 ? 's' : ''} included
                          </p>
                        </div>

                        <div className="space-y-1.5 mb-4">
                          {productBenefitList.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-blue-100 text-xs">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => addItem({
                            id: selectedPrice.productId,
                            name: `Live TV ${plan.durationLabel} - ${deviceCount} Device${deviceCount > 1 ? 's' : ''}`,
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What You Get Video */}
          <DemoVideo />

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
              <p className="text-gray-200 max-w-2xl mx-auto">
                Be streaming in 10 minutes! Your StreamStick includes 1 Year Live TV Plan, instant login credentials, a quick setup video, and 24/7 support. Live TV, Movies, Series & Sports await!
              </p>
            </div>
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 overflow-hidden" data-testid="tier-comparison-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left p-4 text-gray-200 font-medium">Features</th>
                    <th className="text-center p-4">
                      <div className="text-lg font-bold text-white">Starter Kit</div>
                      <div className="text-2xl font-bold text-orange-400">$130</div>
                      <div className="text-xs text-gray-200">1080p Full HD</div>
                    </th>
                    <th className="text-center p-4 bg-orange-500/10 relative">
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-b">BEST VALUE</div>
                      <div className="text-lg font-bold text-white pt-4">4K Kit</div>
                      <div className="text-2xl font-bold text-orange-400">$140</div>
                      <div className="text-xs text-gray-200">4K Ultra HD</div>
                    </th>
                    <th className="text-center p-4">
                      <div className="text-lg font-bold text-white">Max Kit</div>
                      <div className="text-2xl font-bold text-orange-400">$150</div>
                      <div className="text-xs text-gray-200">4K + Wi-Fi 6E</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Resolution</td>
                    <td className="text-center p-4 text-white">1080p Full HD</td>
                    <td className="text-center p-4 text-white bg-orange-500/5">4K Ultra HD</td>
                    <td className="text-center p-4 text-white">4K Ultra HD</td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">HDR Support</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-200 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Dolby Vision & Atmos</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-200 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Wi-Fi 6E (Fastest)</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-200 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><X className="w-5 h-5 text-gray-200 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">1 Year Live TV Included</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Extensive Live Content</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Thousands of Movies & Shows</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Comprehensive Sports Coverage</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-orange-500/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 text-gray-200">24/7 Customer Support</td>
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
                    <div className="text-gray-200 text-sm">Fire Stick</div>
                    <div className="text-orange-400 font-semibold mt-2">Regular Price</div>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30 transform hover:scale-105 transition-transform">
                    <div className="text-2xl font-bold text-white">2+</div>
                    <div className="text-gray-200 text-sm">Fire Sticks</div>
                    <div className="text-green-400 font-bold mt-2">SAVE 10%</div>
                  </div>
                  <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/50 ring-2 ring-green-500/30 transform hover:scale-105 transition-transform">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold hidden md:block">BEST DEAL</div>
                    <div className="text-2xl font-bold text-white">3+</div>
                    <div className="text-gray-200 text-sm">Fire Sticks</div>
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
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 group ${
                    product.popular 
                      ? 'ring-2 ring-orange-400 shadow-2xl shadow-orange-500/40' 
                      : `hover:shadow-xl ${glowColors[index]}`
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
                  <div className={`absolute inset-0 border ${borderColors[index]} rounded-2xl transition-all duration-300 group-hover:shadow-[inset_0_0_16px_rgba(249,115,22,0.08)]`} />
                  
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
                        <label className="text-sm text-gray-200 mb-2 block">Quantity (Buy More & Save!):</label>
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
                                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                                }`}
                                data-testid={`button-qty-${product.id}-${qty}`}
                                aria-label={`Select quantity ${qty}`}
                                aria-pressed={firestickQuantities[product.id] === qty}
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
                                  <span className="text-sm text-gray-200">
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
                                Each includes 1 Year Live TV Plan
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      <div className="space-y-3 mb-6">
                        {productBenefitList.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-blue-100 text-sm">{feature}</span>
                          </div>
                        ))}
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
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Fire Stick Details */}
          <section className="py-10">
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-orange-400 mb-4">
                    Unleash Endless Entertainment w/ the Amazon Fire Stick
                  </h3>
                  <p className="text-gray-200 mb-4">
                    Experience a world of endless entertainment possibilities with the Amazon Fire Stick, available exclusively on our website. This powerful device transforms any TV into a smart TV, giving you access to your favorite streaming services, apps, games, and more—all from the comfort of your home.
                  </p>
                  <p className="text-gray-200 mb-4">
                    These home cinema style platforms will give you a truckload of Movies & TV Shows. Classics & new releases searchable by “most popular, in theaters, top rated, horror, family, comedy, adventure and more!
                  </p>
                  <p className="text-gray-200">
                    We have done all the hard work ahead of time and made screen recorded tutorial videos for the most common requests from customers! Anytime you may need assistance, we offer lifetime customer support with the purchase of our devices.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-orange-400 mb-4">
                    Exclusive Educational Videos
                  </h3>
                  <p className="text-gray-200 mb-6">
                    When you purchase the Fire Stick from us, you will also receive access to a series of educational videos that demonstrate how to maximize your device's potential. These videos provide step-by-step instructions on how to customize your Fire Stick experience.
                  </p>
                  <h4 className="text-xl font-bold text-orange-400 mb-3">
                    Important Legal Notice
                  </h4>
                  <p className="text-gray-200">
                    Please be aware that while our educational videos are designed to help you make the most of your device, we cannot verify the legality of any 3rd party applications mentioned. These apps are developed and maintained by independent entities over which we have no control. It is crucial that you conduct your own research and due diligence before downloading, installing, and using any 3rd party applications to ensure that they comply with all applicable laws and regulations.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sports Carousel */}
          <SportsCarousel />
        </div>
      </section>

      {/* Savings Calculator */}
      <SavingsCalculator />

      {/* From Our Blog Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Learn More</span>
            </h2>
            <p className="text-gray-200 text-lg">Helpful guides to get the most out of your streaming experience</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <a href="/blog/what-is-fully-loaded-streaming-device" className="block" data-testid="blog-card-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all cursor-pointer h-full"
              >
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">What is a Fully Loaded Streaming Device?</h3>
                <p className="text-gray-200 text-sm mb-4">Learn how to get fully loaded with streaming content in just 10 minutes.</p>
                <span className="text-orange-400 text-sm font-semibold flex items-center gap-1">
                  Read More <ChevronRight className="w-4 h-4" />
                </span>
              </motion.div>
            </a>

            <a href="/blog/streaming-vs-cable-cost-comparison" className="block" data-testid="blog-card-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all cursor-pointer h-full"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Streaming vs Cable: Complete Cost Guide</h3>
                <p className="text-gray-200 text-sm mb-4">See how much you can save by switching from cable TV to streaming.</p>
                <span className="text-orange-400 text-sm font-semibold flex items-center gap-1">
                  Read More <ChevronRight className="w-4 h-4" />
                </span>
              </motion.div>
            </a>

            <a href="/blog/best-live-tv-sports-streaming-2025" className="block" data-testid="blog-card-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all cursor-pointer h-full"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Best Live TV Sports Streaming 2025</h3>
                <p className="text-gray-200 text-sm mb-4">Discover comprehensive sports coverage including NFL, NBA, UFC, and more.</p>
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

      {/* How It Works Section - NEW with Visual Elements */}
      <section className="py-24 bg-gradient-to-b from-gray-800/80 to-gray-900/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-2 mb-6">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">SIMPLE PROCESS</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">How It Works</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Get started in minutes with our simple 4-step process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { 
                step: "1", 
                title: "Choose Your Device", 
                description: "Select from Fire Stick HD, 4K, or 4K Max. All devices come pre-configured and ready to use.",
                icon: "📱",
                image: "firestick-device-selection.jpg"
              },
              { 
                step: "2", 
                title: "Add IPTV Subscription", 
                description: "Choose your Live TV plan - 1 month, 3 months, or save with longer plans. Multi-device options available.",
                icon: "📺",
                image: "iptv-subscription-selection.jpg"
              },
              { 
                step: "3", 
                title: "We Ship & Setup", 
                description: "Your device arrives ready to use. All apps pre-installed, credentials included, zero configuration needed.",
                icon: "🚀",
                image: "device-setup-ready.jpg"
              },
              { 
                step: "4", 
                title: "Start Streaming", 
                description: "Plug in, connect to WiFi, and start watching 18,000+ channels and 100,000+ movies instantly.",
                icon: "🎬",
                image: "streaming-content.jpg"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent backdrop-blur-2xl rounded-3xl p-8 border-2 border-blue-400/20 shadow-2xl shadow-blue-500/10 hover:border-blue-400/40 transition-all"
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                <p className="text-gray-200 leading-relaxed">{item.description}</p>
                {/* Image loads from Supabase when uploaded */}
                <div className="mt-6 h-32 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl flex items-center justify-center border border-gray-600/30 overflow-hidden">
                  <img 
                    src={`https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/${item.image}`}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = `<span class="text-gray-400 text-xs text-center px-4">Upload image: ${item.image}</span>`;
                      }
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Benefits Section - NEW */}
      <section className="py-24 bg-gradient-to-b from-gray-900/80 to-gray-800/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Why StreamStickPro?</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              The most comprehensive streaming solution available
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "No Tech Skills Required",
                description: "Everything pre-configured. No tutorials, no confusion. Plug and play.",
                visual: "💻",
                image: "no-tech-skills.jpg",
                color: "from-green-500/15 to-emerald-500/5",
                border: "border-green-400/30"
              },
              {
                title: "Instant Access",
                description: "Your credentials arrive instantly via email. Start streaming in minutes, not days.",
                visual: "⚡",
                image: "instant-access.jpg",
                color: "from-yellow-500/15 to-orange-500/5",
                border: "border-yellow-400/30"
              },
              {
                title: "All Premium Content",
                description: "18,000+ channels, 100,000+ movies, all sports including NFL, NBA, UFC PPV.",
                visual: "🎯",
                image: "premium-content.jpg",
                color: "from-purple-500/15 to-pink-500/5",
                border: "border-purple-400/30"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`bg-gradient-to-br ${item.color} backdrop-blur-2xl rounded-3xl p-8 border-2 ${item.border} shadow-2xl hover:scale-105 transition-all`}
              >
                <div className="text-7xl mb-6">{item.visual}</div>
                <h3 className="text-2xl font-black text-white mb-4">{item.title}</h3>
                <p className="text-gray-200 text-lg leading-relaxed mb-6">{item.description}</p>
                {/* Image loads from Supabase when uploaded */}
                <div className="h-40 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl flex items-center justify-center border border-gray-600/30 overflow-hidden">
                  <img 
                    src={getStorageUrl('images', item.image)} 
                    alt={item.title}
                    className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-gray-400 text-xs text-center px-4">Upload image: ${item.image}</span>`;
                    }}
                  />
                </div>
              </motion.div>
            ))}
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
              <AccordionTrigger className="text-lg font-semibold hover:text-orange-400">What's included with a StreamStick?</AccordionTrigger>
              <AccordionContent className="text-gray-200">
                Get fully loaded in just 10 minutes! Your StreamStick arrives ready - after purchase you'll receive your login credentials instantly and an easy setup video. Follow the quick tutorial and unlock 1 Year of Live TV, Movies, Series & Sports!
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border border-white/10 rounded-xl px-6 bg-white/5">
              <AccordionTrigger className="text-lg font-semibold hover:text-orange-400">How do I renew my subscription?</AccordionTrigger>
              <AccordionContent className="text-gray-200">
                Simply come back to the site and purchase a renewal package. Your credentials will be updated instantly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border border-white/10 rounded-xl px-6 bg-white/5">
              <AccordionTrigger className="text-lg font-semibold hover:text-orange-400">Do you offer support?</AccordionTrigger>
              <AccordionContent className="text-gray-200">
                Yes, we offer 24/7 support via email for all active subscribers. Contact us at reloadedfiretvteam@gmail.com
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border border-white/10 rounded-xl px-6 bg-white/5">
              <AccordionTrigger className="text-lg font-semibold hover:text-orange-400">What devices are supported?</AccordionTrigger>
              <AccordionContent className="text-gray-200">
                Our Live TV service works on streaming devices, Android boxes, Smart TVs, phones, tablets, and computers. Use up to 2 devices simultaneously!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Customer Support Email Banner - Fixed at bottom - More Prominent */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 text-white py-4 px-4 z-[99] border-t-4 border-orange-300/50 shadow-2xl">
        <div className="container mx-auto flex items-center justify-center gap-4 flex-wrap">
          <Mail className="w-6 h-6 flex-shrink-0" />
          <span className="text-base md:text-lg font-semibold">Need Help? Contact us:</span>
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="font-bold text-white hover:text-orange-100 underline decoration-2 underline-offset-2 transition-colors text-base md:text-lg cursor-pointer bg-transparent border-none p-0 hover:bg-white/10 rounded px-2 py-1"
            data-testid="link-support-email"
          >
            reloadedfiretvteam@gmail.com
          </button>
          <span className="hidden md:inline text-base font-medium">• 24/7 Support Available</span>
        </div>
      </div>

      {/* WhatsApp Chat Widget - More Prominent */}
      <a 
        href="https://wa.me/15853037381" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-24 right-6 z-[100] group"
        data-testid="link-whatsapp"
        aria-label="Chat with us on WhatsApp"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
          <Button className="rounded-full w-16 h-16 shadow-2xl bg-green-500 hover:bg-green-600 border-4 border-white/30 relative z-10 transition-all transform hover:scale-110" data-testid="button-chat">
            <MessageCircle className="w-7 h-7 text-white" />
          </Button>
        </div>
        <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-semibold pointer-events-none">
          Chat with us!
        </div>
      </a>

      {/* Footer */}
      <footer className="bg-gray-800/80 backdrop-blur-sm text-gray-200 border-t border-white/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-8 h-8 text-orange-500" />
                <span className="text-xl font-bold text-white">Inferno TV</span>
              </div>
              <p className="text-sm text-gray-200 mb-4">
                Premium Live TV streaming with extensive content library and thousands of movies & series. Pre-configured streaming devices available.
              </p>
              <div className="flex gap-3">
                <a href="mailto:reloadedfiretvteam@gmail.com" className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-colors" data-testid="link-email" aria-label="Email us">
                  <Mail className="w-5 h-5" aria-hidden="true" />
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
              <h3 className="text-white font-semibold mb-4">Support & Policies</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-orange-400 transition-colors">FAQ</a></li>
                <li><a href="mailto:reloadedfiretvteam@gmail.com" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/refund" className="hover:text-orange-400 transition-colors">Refund Policy</a></li>
                <li><a href="/admin" className="text-gray-600 hover:text-gray-200 transition-colors text-xs">Admin</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-gray-200">
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
      </main>

      {/* Exit Intent Popup */}
      <ExitPopup />

      {/* Floating CTA */}
      <FloatingCTA onContact={openSupport} />

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA onContact={openSupport} />

      {/* Scroll to Top */}
      <ScrollToTopButton />

      {/* Product Quick View Modal */}
      <ProductQuickView 
        product={quickViewProduct} 
        isOpen={isQuickViewOpen} 
        onClose={closeQuickView} 
      />

      {/* Support Message Box */}
      <SupportMessageBox 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
      />
      </div>
    </div>
  );
}
