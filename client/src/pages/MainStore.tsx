import { useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { useLocation, Link } from "wouter";
import { apiCall } from "@/lib/api";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ShoppingCart, Flame, Check, Star, Zap, Mail, DollarSign, CreditCard, MessageCircle, Play, X, Gift, ChevronRight, Heart, ShieldCheck } from "lucide-react";
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
import { TrustBadges } from "@/components/TrustBadges";
import { SEOSchema, ServiceSchema, ItemListSchema } from "@/components/SEOSchema";
import { setPageMeta } from "@/lib/seo";
import { MobileNav } from "@/components/MobileNav";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { QuickViewButton } from "@/components/QuickViewButton";

const ProductQuickView = lazy(() => import("@/components/ProductQuickView").then((module) => ({ default: module.ProductQuickView })));
const SportsCarousel = lazy(() => import("@/components/SportsCarousel").then((module) => ({ default: module.SportsCarousel })));
const ExitPopup = lazy(() => import("@/components/ExitPopup").then((module) => ({ default: module.ExitPopup })));
const DemoVideo = lazy(() => import("@/components/DemoVideo").then((module) => ({ default: module.DemoVideo })));
const FreeTrial = lazy(() => import("@/components/FreeTrial").then((module) => ({ default: module.FreeTrial })));
const TrustStats = lazy(() => import("@/components/SocialProof").then((module) => ({ default: module.TrustStats })));
const ChannelLogos = lazy(() => import("@/components/ChannelLogos").then((module) => ({ default: module.ChannelLogos })));
const IPTVMediaPlayersSection = lazy(() => import("@/components/IPTVMediaPlayersSection").then((module) => ({ default: module.IPTVMediaPlayersSection })));
const SavingsCalculator = lazy(() => import("@/components/SavingsCalculator").then((module) => ({ default: module.SavingsCalculator })));
const FloatingCTA = lazy(() => import("@/components/FloatingCTA").then((module) => ({ default: module.FloatingCTA })));
const StickyMobileCTA = lazy(() => import("@/components/StickyMobileCTA").then((module) => ({ default: module.StickyMobileCTA })));
const ScrollToTopButton = lazy(() => import("@/components/StickyMobileCTA").then((module) => ({ default: module.ScrollToTopButton })));
const SupportMessageBox = lazy(() => import("@/components/SupportMessageBox"));

const SUPABASE_BASE = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges";
const firestickHdImg = `${SUPABASE_BASE}/firestick-original-jailbroken.jpg`;
const firestick4kImg = `${SUPABASE_BASE}/firestick-4k-jailbroken.jpg`;
const firestick4kMaxImg = `${SUPABASE_BASE}/firestick-4k-max-jailbroken.jpg`;
const onn4kImg = `${SUPABASE_BASE}/onn-4k-streaming.webp`;
const onn4kProImg = `${SUPABASE_BASE}/onn-4k-ultra-hd.webp`;
const iptvImg = `${SUPABASE_BASE}/iptv-subscription.jpg`;
const fallbackHeroImg = `${SUPABASE_BASE}/firestick-4k-jailbroken.jpg`;
const heroImg = `${SUPABASE_BASE}/hero-firestick-breakout.jpg`;
const productBenefitList = [
  "18,000 live channels worldwide",
  "+24k VODs and Series",
  "PPV Channels (UFC, NFL…)",
  "Stable streaming quality",
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
    description: "Premium Live TV streaming plan with 18,000+ live TV channels, 100,000+ movies & series, and comprehensive sports coverage.",
    features: productBenefitList,
    prices: [
      { devices: 1, price: 11, productId: "iptv-1mo-1d" },
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
    description: "Save more with 3 months! Premium Live TV plan with 18,000+ live TV channels, 100,000+ movies & series, and comprehensive sports coverage.",
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
    description: "10% OFF! 6-month premium Live TV streaming plan with 18,000+ live TV channels, 100,000+ movies & series, and comprehensive sports coverage.",
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
    price: 115,
    description: "Start in about 10 minutes. Plug in your Fire Stick, enter your credentials (sent instantly after purchase), and follow our quick setup video. You'll unlock 18,000+ live TV channels, 100,000+ movies & series, and comprehensive sports coverage including NFL, NBA, UFC, and live events. Includes a 1 Year Live TV plan, 24/7 customer support, tutorial videos, and shipping included.",
    features: productBenefitList,
    image: firestickHdImg,
    category: "firestick",
    badge: "STARTER"
  },
  {
    id: "firestick-4k",
    name: "StreamStick 4K Kit",
    price: 125,
    description: "Best-selling Fire Stick setup in about 10 minutes. Plug in, enter your instant credentials, follow our setup video, and you're streaming in 4K with Dolby Vision. Enjoy 18,000+ live TV channels, 100,000+ movies & series, and all major sports - NFL, NBA, UFC, and live events. Includes a 1 Year premium Live TV plan, 24/7 support, tutorial videos, and shipping included.",
    features: productBenefitList,
    image: firestick4kImg,
    category: "firestick",
    badge: "BEST VALUE",
    popular: true
  },
  {
    id: "firestick-4k-max",
    name: "StreamStick Max Kit",
    price: 135,
    description: "Ultimate 4K Max with Wi-Fi 6E setup in about 10 minutes. Plug in, use your instant credentials, follow our quick setup video, and experience breathtaking 4K with Dolby Atmos sound. Access 18,000+ live TV channels, 100,000+ movies & series, and all major sports. Includes a 1 Year premium Live TV plan, priority 24/7 support, tutorial videos, and shipping included.",
    features: productBenefitList,
    image: firestick4kMaxImg,
    category: "firestick",
    badge: "PREMIUM"
  },
  {
    id: "android-onn-4k",
    name: "ONN 4K Streaming Device Kit",
    price: 105,
    description: "Upgrade from Fire Stick to Android. The ONN 4K Streaming Device with Google TV delivers the same great features you love, plus built-in storage for live DVR recording. Setup takes about 10 minutes - plug in, enter your instant credentials, and access 18,000+ live TV channels, 100,000+ movies & series, and comprehensive sports coverage. Includes a 1 Year Live TV plan, 24/7 support, tutorial videos, and shipping included.",
    features: productBenefitList,
    image: onn4kImg,
    category: "firestick",
    badge: "ANDROID"
  },
  {
    id: "android-onn-pro",
    name: "ONN 4K Ultra HD Pro Kit",
    price: 115,
    description: "The ultimate Android streaming upgrade. ONN 4K Ultra HD Pro features expanded storage for extensive DVR recording, Google TV interface, and premium performance. Setup takes about 10 minutes - plug in, use your instant credentials, and experience crystal-clear 4K with Dolby Audio. Access 18,000+ live TV channels, 100,000+ movies & series, and all major sports. Includes a 1 Year premium Live TV plan, priority 24/7 support, tutorial videos, and shipping included.",
    features: productBenefitList,
    image: onn4kProImg,
    category: "firestick",
    badge: "ANDROID PRO"
  }
];

type BuyerProfile = "new" | "family" | "power";

const BUYER_PROFILE_CONFIG: Record<
  BuyerProfile,
  {
    label: string;
    planDuration: "1mo" | "3mo" | "6mo" | "1yr";
    streamCount: number;
    deviceTier: "hd" | "4k" | "max";
    deviceQty: number;
    note: string;
  }
> = {
  new: {
    label: "New User",
    planDuration: "1mo",
    streamCount: 1,
    deviceTier: "4k",
    deviceQty: 1,
    note: "Low-risk starter path",
  },
  family: {
    label: "Family",
    planDuration: "3mo",
    streamCount: 3,
    deviceTier: "4k",
    deviceQty: 2,
    note: "Best value for most homes",
  },
  power: {
    label: "Power User",
    planDuration: "1yr",
    streamCount: 5,
    deviceTier: "max",
    deviceQty: 1,
    note: "Maximum performance and value",
  },
};

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
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>("new");
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

  const iptvViewCounts = useMemo(() => ({
    "1mo": 127 + Math.floor(Math.random() * 110),
    "3mo": 164 + Math.floor(Math.random() * 130),
    "6mo": 148 + Math.floor(Math.random() * 105),
    "1yr": 193 + Math.floor(Math.random() * 145),
  }), []);

  const firestickViewCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    defaultProducts.forEach((p) => {
      counts[p.id] = 86 + Math.floor(Math.random() * 115);
    });
    return counts;
  }, []);

  const reviews = useMemo(() => [
    { name: "Marcus T.", text: "Setup was guided — no dead apps, streaming in minutes." },
    { name: "Elena R.", text: "Reloaded Fire TV saved me from the Kodi update grind." },
    { name: "Brian K.", text: "Stream Stick Pro gave me one workflow, instant credentials, and 24/7 chat that actually replied at midnight." },
    { name: "Danielle P.", text: "Streams are stable and support helped me on Wi-Fi tweaks fast." },
    { name: "Sergio M.", text: "Bought two devices — both worked day one. Support followed up to ensure channels were fine." },
    { name: "Kyle W.", text: "Switched from cable and saved $140/mo. Setup took maybe 8 minutes." },
    { name: "Andrea L.", text: "The tutorial video walked me through everything. Even my parents could do it." },
    { name: "Jamal C.", text: "Tried three other IPTV sites first — dead links everywhere. This one just worked." },
    { name: "Priya S.", text: "Love the sports coverage. UFC, NFL, Premier League — all in one place." },
    { name: "Devon M.", text: "Customer support answered at 2 AM on a Sunday. That sold me for good." },
    { name: "Lisa H.", text: "No buffering issues after they helped me optimize my router settings." },
    { name: "Carlos R.", text: "Got the ONN box for my bedroom TV. Same great experience as my Fire Stick." },
  ], []);

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
    setPageMeta({
      title: "Premium IPTV + Devices | 18K+ Channels | StreamStickPro",
      description: "IPTV-first experience with instant credentials, tutorial video, 24/7 support, and optional Fire Stick/ONN bundles with Reloaded Fire TV. 36-hour trial on subscriptions; devices include 1-year access.",
      path: "/",
    });
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

  const getDeviceTier = (id: string): "hd" | "4k" | "max" => {
    const k = id.toLowerCase();
    if (k.includes("max")) return "max";
    if (k.includes("4k")) return "4k";
    return "hd";
  };

  const getDeviceBestFor = (id: string): string => {
    const tier = getDeviceTier(id);
    if (tier === "hd") return "budget-friendly streaming on 1080p TVs";
    if (tier === "4k") return "most homes wanting 4K quality and best overall value";
    return "power users wanting peak speed and premium performance";
  };

  const getRecommendedDeviceElement = (tier: "hd" | "4k" | "max"): HTMLElement | null => {
    const idsByTier: Record<"hd" | "4k" | "max", string[]> = {
      hd: ["firestick-hd", "fs-hd"],
      "4k": ["firestick-4k", "fs-4k"],
      max: ["firestick-4k-max", "fs-max"],
    };
    for (const id of idsByTier[tier]) {
      const el = document.querySelector(`[data-testid="card-product-${id}"]`) as HTMLElement | null;
      if (el) return el;
    }
    return null;
  };

  const flashCardFocus = (el: HTMLElement | null) => {
    if (!el) return;
    const prevTransition = el.style.transition;
    const prevBoxShadow = el.style.boxShadow;
    el.style.transition = "box-shadow 180ms ease";
    el.style.boxShadow = "0 0 0 2px rgba(52, 211, 153, 0.95), 0 0 28px rgba(16, 185, 129, 0.35)";
    window.setTimeout(() => {
      el.style.boxShadow = prevBoxShadow;
      el.style.transition = prevTransition;
    }, 1900);
  };

  const focusRecommendedCards = (config: (typeof BUYER_PROFILE_CONFIG)[BuyerProfile]) => {
    window.setTimeout(() => {
      const planEl = document.querySelector(
        `[data-testid="card-product-iptv-${config.planDuration}"]`
      ) as HTMLElement | null;
      const deviceEl = getRecommendedDeviceElement(config.deviceTier);
      const targetEl = planEl || deviceEl;
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      flashCardFocus(planEl);
      flashCardFocus(deviceEl);
    }, 120);
  };

  const applyBuyerProfile = (profile: BuyerProfile) => {
    const config = BUYER_PROFILE_CONFIG[profile];
    setBuyerProfile(profile);

    setSelectedDevices({
      "1mo": config.streamCount,
      "3mo": config.streamCount,
      "6mo": config.streamCount,
      "1yr": config.streamCount,
    });

    setFirestickQuantities((prev) => ({
      ...prev,
      "firestick-hd": config.deviceTier === "hd" ? config.deviceQty : 1,
      "firestick-4k": config.deviceTier === "4k" ? config.deviceQty : 1,
      "firestick-4k-max": config.deviceTier === "max" ? config.deviceQty : 1,
      "fs-hd": config.deviceTier === "hd" ? config.deviceQty : 1,
      "fs-4k": config.deviceTier === "4k" ? config.deviceQty : 1,
      "fs-max": config.deviceTier === "max" ? config.deviceQty : 1,
      "android-onn-4k": 1,
      "android-onn-pro": 1,
    }));
    focusRecommendedCards(config);
  };

  // WebSite + Organization schema: only in index.html to avoid duplicate structured data (GSC).

  // Schema-only description: never output "Real product mapped to..." (internal placeholder from DB/seed)
  const getSchemaDescription = (product: Product): string => {
    if (!product.description?.startsWith("Real product mapped to")) return product.description;
    if (product.category === "iptv") {
      return `Premium Live TV plan: ${product.name}. 18,000+ live channels, 100,000+ movies and series, sports and PPV. Multi-device options. StreamStickPro.`;
    }
    return `${product.name} with 1 year Live TV included, plus setup guidance and support. 18,000+ channels, 100,000+ movies and series. StreamStickPro.`;
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
        "description": getSchemaDescription(product),
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
        }
      }
    }))
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans selection:bg-orange-500 selection:text-white pb-32 md:pb-20 relative">
      {/* Parallax Hero Background - Optimized with lazy loading and performance hints */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat bg-scroll md:bg-fixed"
        style={{
          backgroundImage: `url(${heroImg})`,
          willChange: "transform",
          contentVisibility: "auto",
        }}
      >
        {/* Stronger overlay on small screens for readability; lighter on desktop */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/45 to-black/55 md:from-black/35 md:via-black/25 md:to-black/45" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productListData) }} />
      {/* WebSite, Organization, FAQPage: index.html only. ItemList + ServiceSchema here for product/shop signal. */}

      {/* Service Schema for IPTV Service Offerings */}
      <ServiceSchema 
        name="Premium IPTV Streaming Service"
        description="Access 18,000+ live TV channels, 100,000+ movies and series, premium sports including NFL, NBA, MLB, UFC PPV. Multi-device streaming with instant credentials, setup tutorial, 24/7 human support, and optional Fire Stick / ONN bundles with Reloaded Fire TV."
        serviceType="IPTV Streaming Service"
        areaServed="Worldwide"
      />

      {/* ItemList Schema for Product Listings */}
      <ItemListSchema 
        name="StreamStickPro Products"
        description="Premium IPTV subscription plans and optional Fire Stick / ONN device bundles with Reloaded Fire TV"
        items={products.slice(0, 6).map(p => ({
          name: p.name,
          description: getSchemaDescription(p),
          url: `https://streamstickpro.com/#${p.id}`,
          image: p.image,
          price: p.price
        }))}
      />
      
      {/* Navigation - Elite Glassmorphism Design */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl shadow-2xl shadow-black/50" aria-label="Main navigation">
        <div className="container mx-auto px-4 h-16 md:h-[72px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MobileNav scrollToShop={scrollToShop} scrollToAbout={scrollToAbout} scrollToFaq={scrollToFaq} onSupportClick={openSupport} />
            <Link href="/">
              <span className="flex items-center gap-2 min-w-0 font-bold tracking-tighter cursor-pointer" aria-label="Go to Stream Stick Pro homepage">
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
                <span className="sm:hidden text-sm text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                  SSP
                </span>
                <span className="hidden sm:inline max-w-[140px] truncate whitespace-nowrap text-base sm:max-w-none sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                  Stream Stick Pro
                </span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/iptv-services"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">IPTV</span></Link>
            <Link href="/iptv-firestick"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">Firestick</span></Link>
            <Link href="/firestick-devices"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">Devices</span></Link>
            <Link href="/iptv-media-players"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">Media Players</span></Link>
            <Link href="/tutorials"><span className="hidden lg:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">How to Jailbreak Fire Stick</span></Link>
            <Link href="/36hr-trial"><span className="hidden lg:inline px-2 py-1.5 text-[13px] text-orange-200 hover:text-white hover:bg-orange-500/20 rounded font-semibold">Trial</span></Link>
            <Link href="/pricing"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">Pricing</span></Link>
            <Link href="/blog"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">Blog</span></Link>
            <Link href="/locations"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">Locations</span></Link>
            <Button variant="ghost" className="hidden md:flex text-gray-100 hover:text-white hover:bg-white/10 font-medium" onClick={scrollToAbout} data-testid="nav-how-it-works" aria-label="Scroll to How It Works section">How It Works</Button>
            <Button variant="ghost" className="hidden md:flex text-gray-100 hover:text-white hover:bg-white/10 font-medium" onClick={scrollToShop} data-testid="nav-shop" aria-label="Scroll to Shop section">Shop</Button>
            <Button 
              onClick={openSupport} 
              className="hidden md:flex bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105" 
              data-testid="button-contact-header"
              aria-label="Contact us - open support message box"
            >
              <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
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
      <section ref={heroRef} className="relative text-white overflow-hidden min-h-[620px] md:min-h-[780px] flex items-center z-10">

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-sm border-2 border-orange-400/50 rounded-full text-sm font-bold text-orange-200 animate-pulse shadow-lg shadow-orange-500/30">
                36-HOUR TRIAL FOR IPTV SUBSCRIPTIONS • Start in Minutes
              </span>
              <span className="ml-3 inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-green-300 font-bold">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                <AnimatedCounter end={2847} suffix=" active" className="text-green-300" />
              </span>
            </motion.div>

            {/* Hero Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 leading-[1.1] tracking-tight text-white"
            >
              Premium IPTV + Devices (Reloaded Fire TV Included)
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-red-500 mt-2">18K+ Live Channels • Instant Credentials • Tutorial + 24/7 Help</span>
            </motion.h1>

            {/* Trust above fold + geo for US/UK/CA impressions */}
            <div className="max-w-4xl mx-auto mb-6 rounded-2xl border border-white/15 bg-black/30 backdrop-blur-md px-4 py-4 sm:px-5 sm:py-5">
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-base sm:text-lg md:text-[1.15rem] leading-relaxed text-gray-100 mb-2"
              >
                IPTV-first experience with optional Fire Stick and ONN bundles. Secure checkout, instant email credentials, guided setup tutorial, and 24/7 human support.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="text-sm sm:text-base leading-relaxed text-gray-200 max-w-3xl mx-auto"
              >
                18,000+ live channels, 100,000+ movies & series, premium sports, and instant activation in <Link href="/iptv-services"><span className="text-orange-300 hover:text-orange-200 font-semibold">USA</span></Link>, <Link href="/iptv-services"><span className="text-orange-300 hover:text-orange-200 font-semibold">Canada</span></Link>, and <Link href="/iptv-services"><span className="text-orange-300 hover:text-orange-200 font-semibold">UK</span></Link>. Devices ship with Reloaded Fire TV all-in-one access—no dead apps or Kodi rebuilds.
              </motion.p>
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="mb-4">
              <Link href="/ultimate-iptv-catalog-2026">
                <span className="text-orange-300 hover:text-orange-200 font-semibold underline">Explore 93K Catalog →</span>
              </Link>
            </motion.p>

            {/* 3 Nuclear CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col lg:flex-row justify-center gap-3 sm:gap-4 mb-6 px-2 sm:px-4 max-w-4xl mx-auto"
            >
              <Link href="/36hr-trial">
                <motion.span
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-5 sm:py-6 min-h-[72px] bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-2xl font-black text-lg sm:text-xl text-white border-2 border-orange-300/50 shadow-xl shadow-orange-500/40 hover:shadow-2xl transition-all cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  role="button"
                >
                  <Gift className="w-6 h-6" aria-hidden="true" />
                  Start 36hr Trial
                </motion.span>
              </Link>
              <Link href="/firestick-devices">
                <motion.span
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-5 sm:py-6 min-h-[72px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-black text-lg sm:text-xl text-white border-2 border-purple-300/50 shadow-xl shadow-purple-500/40 hover:shadow-2xl transition-all cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  role="button"
                >
                  <ShoppingCart className="w-6 h-6" aria-hidden="true" />
                  Shop Devices (Fire Stick & ONN)
                </motion.span>
              </Link>
              <Link href="/onn-google-tv">
                <motion.span
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-5 sm:py-6 min-h-[72px] bg-gradient-to-br from-white/20 to-white/10 rounded-2xl font-black text-lg sm:text-xl text-white border-2 border-white/40 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  role="button"
                >
                  <Zap className="w-6 h-6" aria-hidden="true" />
                  View ONN Options
                </motion.span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="max-w-4xl mx-auto mb-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 sm:p-5"
            >
              <p className="text-white font-semibold text-sm sm:text-base mb-3">Not sure where to start?</p>
              <div className="grid sm:grid-cols-3 gap-2.5 text-left text-xs sm:text-sm">
                <Link href="/36hr-trial">
                  <span className="block rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 py-2.5 text-orange-200 hover:bg-orange-500/20 transition-colors">
                    <strong className="block text-orange-100">New customer</strong>
                    Start with the 36hr trial
                  </span>
                </Link>
                <Link href="/pricing">
                  <span className="block rounded-xl border border-blue-400/30 bg-blue-500/10 px-3 py-2.5 text-blue-200 hover:bg-blue-500/20 transition-colors">
                    <strong className="block text-blue-100">Comparing plans</strong>
                    View full pricing first
                  </span>
                </Link>
                <Link href="/tutorials">
                  <span className="block rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-emerald-200 hover:bg-emerald-500/20 transition-colors">
                    <strong className="block text-emerald-100">Need setup help?</strong>
                    Watch tutorial before buying
                  </span>
                </Link>
              </div>
            </motion.div>

            {/* Reassurance bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-2 max-w-4xl mx-auto text-left"
            >
              {[
                { icon: Zap, label: "Instant credentials via email" },
                { icon: Play, label: "Tutorial video included" },
                { icon: MessageCircle, label: "24/7 human support" },
                { icon: ShieldCheck, label: "No dead apps or Kodi rebuilds" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100">
                  <item.icon className="w-4 h-4 text-orange-300" />
                  <span className="leading-snug">{item.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Payment methods above the fold */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 text-xs sm:text-sm text-gray-100"
            >
              {[
                "Visa",
                "Mastercard",
                "Amex",
                "Discover",
                "Apple Pay",
                "Google Pay",
                "Link by Stripe",
              ].map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm font-semibold"
                >
                  {label}
                </span>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm md:text-base"
            >
              <motion.div className="bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent backdrop-blur-xl rounded-2xl px-6 py-5 border border-orange-400/20">
                <div className="text-orange-400 font-extrabold text-2xl md:text-3xl mb-1">
                  <AnimatedCounter end={18000} suffix="+" className="text-orange-400" />
                </div>
                <div className="text-blue-100 font-semibold">Live Channels</div>
              </motion.div>
              <motion.div className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent backdrop-blur-xl rounded-2xl px-6 py-5 border border-purple-400/20">
                <div className="text-purple-400 font-extrabold text-2xl md:text-3xl mb-1">
                  <AnimatedCounter end={100000} suffix="+" className="text-purple-400" />
                </div>
                <div className="text-blue-100 font-semibold">Movies & Series</div>
              </motion.div>
              <motion.div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent backdrop-blur-xl rounded-2xl px-6 py-5 border border-green-400/20">
                <div className="text-green-400 font-extrabold text-2xl md:text-3xl mb-1">99.9%</div>
                <div className="text-blue-100 font-semibold">Uptime</div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
      </section>

      {/* Elite Conversion Strip */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-900 to-gray-950 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-200 text-xs sm:text-sm font-semibold">
              Built for fast decisions on mobile and desktop
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Choose your streaming setup in under 30 seconds
            </h2>
            <p className="mt-3 text-gray-300 max-w-3xl mx-auto text-sm sm:text-base">
              Start with a subscription trial, choose a device bundle, or compare options before checkout. Every step is designed for clarity and easy access.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="rounded-2xl border border-orange-400/25 bg-gradient-to-br from-orange-500/15 to-orange-500/5 p-5 md:p-6">
              <p className="text-orange-300 text-xs font-semibold tracking-wide">STEP 1</p>
              <h3 className="text-white text-xl font-bold mt-2">Start 36-Hour Trial</h3>
              <p className="text-gray-300 text-sm mt-2">Trial applies to IPTV subscription plans only so you can check quality, speed, and setup flow before buying.</p>
              <Link href="/36hr-trial">
                <span className="mt-5 inline-flex items-center justify-center gap-2 w-full min-h-[72px] rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black transition-colors cursor-pointer">
                  Start Trial <ChevronRight className="w-5 h-5" />
                </span>
              </Link>
            </div>

            <div className="rounded-2xl border border-blue-400/25 bg-gradient-to-br from-blue-500/15 to-blue-500/5 p-5 md:p-6">
              <p className="text-blue-300 text-xs font-semibold tracking-wide">STEP 2</p>
              <h3 className="text-white text-xl font-bold mt-2">Choose Device or Plan</h3>
              <p className="text-gray-300 text-sm mt-2">Fire Stick and ONN options, plus multi-device IPTV plans.</p>
              <button
                onClick={scrollToShop}
                className="mt-5 inline-flex items-center justify-center gap-2 w-full min-h-[72px] rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black transition-colors"
                data-testid="button-jump-to-shop"
              >
                View Options <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 p-5 md:p-6">
              <p className="text-emerald-300 text-xs font-semibold tracking-wide">STEP 3</p>
              <h3 className="text-white text-xl font-bold mt-2">Checkout Securely</h3>
              <p className="text-gray-300 text-sm mt-2">Stripe checkout with card and wallet support in one flow.</p>
              <Link href="/checkout">
                <span className="mt-5 inline-flex items-center justify-center gap-2 w-full min-h-[72px] rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black transition-colors cursor-pointer">
                  Go to Checkout <ChevronRight className="w-5 h-5" />
                </span>
              </Link>
            </div>
          </div>
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
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Fire Stick Device Options & IPTV Plans</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Trusted by 2,700+ customers. 18,000+ channels, 100,000+ movies and series, and clear setup guidance for Fire Stick, ONN, and Android TV.
            </p>
          </motion.div>

          {/* Live TV Plans */}
          <div className="mt-6 mb-16">
            <h3 className="text-3xl font-bold mb-4 text-center flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-blue-500" />
              Live TV Plans & Subscription Trial
            </h3>
            <p className="text-center text-gray-200 mb-8 max-w-2xl mx-auto">
              Choose your subscription length and number of devices. The 36-hour trial is for subscription plans only. Multi-device plans let you stream on multiple TVs, phones, or tablets at the same time.
            </p>

            <div className="max-w-4xl mx-auto mb-8 rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white mb-3 text-center">Quick Compare: pick your setup style</p>
              <div className="grid sm:grid-cols-3 gap-2.5">
                {(Object.keys(BUYER_PROFILE_CONFIG) as BuyerProfile[]).map((profile) => {
                  const config = BUYER_PROFILE_CONFIG[profile];
                  const active = buyerProfile === profile;
                  return (
                    <button
                      key={profile}
                      type="button"
                      onClick={() => applyBuyerProfile(profile)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                        active
                          ? "border-orange-400 bg-orange-500/20 text-orange-100 shadow-lg shadow-orange-500/20"
                          : "border-white/15 bg-white/5 text-gray-200 hover:bg-white/10"
                      }`}
                      data-testid={`button-profile-${profile}`}
                    >
                      <div className="font-semibold text-sm">{config.label}</div>
                      <div className="text-[11px] opacity-90 mt-0.5">
                        {config.note} • {config.streamCount} stream{config.streamCount > 1 ? "s" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Free Trial Box */}
            <Suspense fallback={null}>
              <FreeTrial />
            </Suspense>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {iptvPricingMatrix.map((plan, index) => {
                const deviceCount = selectedDevices[plan.duration];
                const selectedPrice = plan.prices.find(p => p.devices === deviceCount) || plan.prices[0];
                const recommendedPlan = BUYER_PROFILE_CONFIG[buyerProfile].planDuration === plan.duration;
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
                        : recommendedPlan
                          ? 'ring-2 ring-orange-400 shadow-2xl shadow-orange-500/25'
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
                    {!plan.popular && recommendedPlan && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg text-xs">
                          BEST FOR {BUYER_PROFILE_CONFIG[buyerProfile].label.toUpperCase()}
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
                        <p className="text-gray-200 text-xs mb-3 line-clamp-2">{plan.description}</p>
                        <div className="mb-4 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] text-blue-100">
                          <span className="font-semibold text-white">Best for:</span>{" "}
                          {plan.duration === "1mo"
                            ? "new customers testing quality with lowest risk"
                            : plan.duration === "3mo"
                            ? "most customers who want best short-term value"
                            : plan.duration === "6mo"
                            ? "families or heavy users who want fewer renewals"
                            : "buyers who want the strongest yearly value per month"}
                        </div>

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

                        <div className="grid grid-cols-1 gap-2 mb-4 text-[11px] text-blue-100">
                          {[
                            "Instant email credentials",
                            "Setup tutorial included",
                            "24/7 human support",
                          ].map((line, idx) => (
                            <div key={idx} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
                              <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                              <span className="leading-tight">{line}</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1.5 mb-4">
                          {productBenefitList.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-blue-100 text-xs">{feature}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 text-[11px] text-amber-200 font-semibold mt-2">
                            <Star className="w-3 h-3" />
                            Viewed by {iptvViewCounts[plan.duration]} households today
                          </div>
                          <div className="text-[11px] text-gray-200 bg-white/5 border border-white/10 rounded-lg p-2 mt-2">
                            {(() => {
                              const r = reviews[["1mo","3mo","6mo","1yr"].indexOf(plan.duration) % reviews.length];
                              return `"${r.text}" — ${r.name}`;
                            })()}
                          </div>
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
                          aria-label={`Add ${plan.durationLabel} Live TV plan for ${deviceCount} device${deviceCount > 1 ? 's' : ''} to cart`}
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
          <Suspense fallback={null}>
            <DemoVideo />
          </Suspense>

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
                Be streaming in about 10 minutes. Each Stream Stick Pro device bundle includes Reloaded Fire TV all-in-one access, educational setup tutorials, a 1-year included plan, 24/7 support, and shipping included.
              </p>
            </div>
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 overflow-hidden" data-testid="tier-comparison-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left p-4 text-gray-200 font-medium">Features</th>
                    <th className="text-center p-4">
                      <div className="text-lg font-bold text-white">Starter Kit</div>
                      <div className="text-2xl font-bold text-orange-400">$115</div>
                      <div className="text-xs text-gray-200">1080p Full HD</div>
                    </th>
                    <th className="text-center p-4 bg-orange-500/10 relative">
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-b">BEST VALUE</div>
                      <div className="text-lg font-bold text-white pt-4">4K Kit</div>
                      <div className="text-2xl font-bold text-orange-400">$125</div>
                      <div className="text-xs text-gray-200">4K Ultra HD</div>
                    </th>
                    <th className="text-center p-4">
                      <div className="text-lg font-bold text-white">Max Kit</div>
                      <div className="text-2xl font-bold text-orange-400">$135</div>
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
                    <td className="p-4 text-gray-200">100,000+ Movies & Series</td>
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
                const recommendedDevice = getDeviceTier(product.id) === BUYER_PROFILE_CONFIG[buyerProfile].deviceTier;
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
                      : recommendedDevice
                        ? 'ring-2 ring-orange-400 shadow-2xl shadow-orange-500/25'
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
                  {!product.popular && recommendedDevice && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full font-bold shadow-lg text-xs">
                        BEST FOR {BUYER_PROFILE_CONFIG[buyerProfile].label.toUpperCase()}
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
                        aria-label={isInWishlist(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-8 relative">
                      <h4 className="text-2xl font-bold mb-3 text-white">{product.name}</h4>
                      <div className="mb-4 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11px] text-blue-100">
                        <span className="font-semibold text-white">Best for:</span>{" "}
                        {getDeviceBestFor(product.id)}
                      </div>

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

                      <div className="grid grid-cols-1 gap-2 mb-6 text-[11px] text-gray-100">
                        {[
                          "Reloaded Fire TV all-in-one flow",
                          "Educational tutorial included",
                          "1-year access + support",
                        ].map((line, idx) => (
                          <div key={idx} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            <span className="leading-tight">{line}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3 mb-6">
                        {productBenefitList.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-blue-100 text-sm">{feature}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 text-xs text-amber-200 font-semibold">
                          <Star className="w-4 h-4" />
                          Viewed by {firestickViewCounts[product.id] || 90} people today
                        </div>
                        <div className="text-xs text-gray-200 bg-white/5 border border-white/10 rounded-lg p-3">
                          {(() => {
                            const r = reviews[(index + 4) % reviews.length];
                            return `"${r.text}" — ${r.name}`;
                          })()}
                        </div>
                      </div>

                      <div className="flex gap-2 mb-6">
                        <button
                          onClick={() => {
                            const qty = firestickQuantities[product.id] || 1;
                            const { unitPrice } = calculateFirestickPrice(product.price, qty);
                            addItemWithQuantity(product as any, qty, unitPrice);
                          }}
                          aria-label={`Add ${product.name} to cart`}
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
                    Stream Stick Pro Fire Stick & ONN Device Experience
                  </h3>
                  <p className="text-gray-200 mb-4">
                    Say goodbye to cable bills and hello to faster, simpler streaming. With Stream Stick Pro device bundles (Fire Stick and ONN options), you get Reloaded Fire TV all-in-one access plus guided setup made for real households.
                  </p>
                  <p className="text-gray-200 mb-4">
                    You get extensive live channels, movies, series, sports, and events in one place without bouncing through dozens of broken app links. We focus on a clean, usable setup so customers spend time watching, not troubleshooting.
                  </p>
                  <p className="text-gray-200">
                    Every Fire Stick and ONN order includes educational tutorial videos, an easy setup path, a 1-year included access plan, and responsive support whenever you need help.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-orange-400 mb-4">
                    Why Reloaded Fire TV Stands Out
                  </h3>
                  <p className="text-gray-200 mb-6">
                    Many so-called jailbroken Fire Stick sites send customers into huge app lists, dead links, and long tutorials that still do not work. Stream Stick Pro is different: Reloaded Fire TV is designed as an all-in-one app workflow with practical, beginner-friendly setup guidance.
                  </p>
                  <h4 className="text-xl font-bold text-orange-400 mb-3">
                    Important Legal Notice
                  </h4>
                  <p className="text-gray-200">
                    Stream Stick Pro is not endorsed by or affiliated with Amazon. Devices are sold as hardware with educational setup guidance. Any third-party apps or external streams are controlled by their own providers, and customers are responsible for compliant use under local laws and service terms.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Reloaded Fire TV - Device Value Section */}
          <section className="py-10">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-center">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Reloaded Fire TV Device Bundles Built For Real Households
                </h3>
                <p className="text-gray-200 max-w-3xl mx-auto text-lg">
                  Stream Stick Pro bundles are made for easy setup, stable daily use, and less guesswork. You get guided onboarding, educational tutorials, and a 1-year included access plan with Fire Stick or ONN device options.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-500/10 to-red-500/5 p-6">
                  <h4 className="text-2xl font-bold text-orange-300 mb-4">What You Get With Every Device Order</h4>
                  <ul className="space-y-3 text-gray-100">
                    {[
                      "Fire Stick or ONN device option ready for guided setup",
                      "Reloaded Fire TV all-in-one app workflow",
                      "Educational tutorial videos for first-time users",
                      "1-year included access plan on device bundles",
                      "Instant login details and setup steps after purchase",
                      "24/7 support if you need help"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-6">
                  <h4 className="text-2xl font-bold text-blue-300 mb-4">Why Customers Switch To Stream Stick Pro</h4>
                  <ul className="space-y-3 text-gray-100">
                    {[
                      "No endless list of random apps to sort through",
                      "No dead links hunt every time you want to watch",
                      "Simple setup path designed for beginners",
                      "Cleaner all-in-one experience instead of fragmented apps",
                      "Consistent support team instead of 'figure it out' forums",
                      "Built to save time and reduce frustration"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div className="rounded-2xl bg-gray-900/70 border border-white/10 p-5">
                  <h5 className="text-lg font-bold text-white mb-2">Perfect For</h5>
                  <p className="text-gray-200 text-sm">Cord-cutters, families with multiple TVs, and customers who want fast setup without technical headaches.</p>
                </div>
                <div className="rounded-2xl bg-gray-900/70 border border-white/10 p-5">
                  <h5 className="text-lg font-bold text-white mb-2">Fast Start</h5>
                  <p className="text-gray-200 text-sm">Most customers are up and running in about 10 minutes using the included educational walkthrough.</p>
                </div>
                <div className="rounded-2xl bg-gray-900/70 border border-white/10 p-5">
                  <h5 className="text-lg font-bold text-white mb-2">Clear Value</h5>
                  <p className="text-gray-200 text-sm">One device bundle, one setup path, one support team - made to keep streaming straightforward.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Sports Carousel */}
          <Suspense fallback={null}>
            <SportsCarousel />
          </Suspense>
        </div>
      </section>



      {/* Section 2: Competitor Domination */}
      <section className="relative z-10 py-12 md:py-16 bg-gradient-to-b from-gray-900/80 to-gray-900 border-y border-white/10" aria-labelledby="competitor-domination">
        <div className="container mx-auto px-4">
          <h2 id="competitor-domination" className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Competitor Domination</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 text-lg text-gray-200">
            <p className="flex items-center gap-2"><Check className="w-6 h-6 text-green-400 shrink-0" /> Beats IPTVStronger — 36hr vs 24hr trial</p>
            <p className="flex items-center gap-2"><Check className="w-6 h-6 text-green-400 shrink-0" /> Beats TroyPoint — Onn/Roku native support</p>
            <p className="flex items-center gap-2"><Check className="w-6 h-6 text-green-400 shrink-0" /> More channels than ANY competitor — 18K+ live</p>
          </div>
          <p className="text-center mt-6">
            <Link href="/vs-iptvstronger"><span className="text-orange-400 hover:text-orange-300 font-semibold">Compare vs IPTVStronger →</span></Link>
            {" · "}
            <Link href="/vs-troypoint"><span className="text-orange-400 hover:text-orange-300 font-semibold">Compare vs TroyPoint →</span></Link>
          </p>
        </div>
      </section>

      {/* Section 3: Device Support */}
      <section className="relative z-10 py-12 md:py-16 bg-gray-900/60 border-b border-white/10" aria-labelledby="device-support">
        <div className="container mx-auto px-4">
          <h2 id="device-support" className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
            Device Support
          </h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium"><Check className="w-5 h-5 text-green-400" /> Onn Google TV</span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium"><Check className="w-5 h-5 text-green-400" /> Roku TVs</span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium"><Check className="w-5 h-5 text-green-400" /> Smart TVs</span>
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-medium"><Check className="w-5 h-5 text-green-400" /> Fire Stick</span>
            <Link href="/iptv-smarters-pro"><span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-200 font-medium hover:bg-orange-500/30">IPTV Smarters Pro</span></Link>
            <Link href="/tivimate"><span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-200 font-medium hover:bg-orange-500/30">TiviMate</span></Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Trust Stats */}
      <div className="py-8 bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 border-y border-white/10">
        <div className="container mx-auto px-4">
          <Suspense fallback={null}>
            <TrustStats />
          </Suspense>
        </div>
      </div>

      {/* Niche hub — IPTV, jailbroken Fire Sticks, media players, devices */}
      <div className="py-6 bg-gray-900/60 border-y border-white/10">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400 text-sm mb-4">Browse by topic</p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
            <Link href="/iptv-services"><span className="px-4 py-2 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/40 text-gray-200 hover:text-white font-medium transition-colors">IPTV Services</span></Link>
            <Link href="/iptv-firestick"><span className="px-4 py-2 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/40 text-gray-200 hover:text-white font-medium transition-colors">IPTV for Firestick</span></Link>
            <Link href="/iptv-media-players"><span className="px-4 py-2 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/40 text-gray-200 hover:text-white font-medium transition-colors">IPTV Media Players</span></Link>
            <Link href="/firestick-devices"><span className="px-4 py-2 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/40 text-gray-200 hover:text-white font-medium transition-colors">Fire Stick Devices</span></Link>
            <Link href="/jailbroken-fire-sticks"><span className="px-4 py-2 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/40 text-gray-200 hover:text-white font-medium transition-colors">Jailbroken Fire Sticks</span></Link>
            <Link href="/best-iptv-firestick"><span className="px-4 py-2 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-400/40 text-gray-200 hover:text-white font-medium transition-colors">Best IPTV Firestick</span></Link>
          </div>
        </div>
      </div>

      {/* IPTV Media Players Section */}
      <Suspense fallback={null}>
        <IPTVMediaPlayersSection />
      </Suspense>

      {/* Setup Tutorial Section */}
      <section id="tutorials" className="py-16 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              How to Set Up Fire Stick & ONN for IPTV
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-4">
              The same guided walkthrough every customer receives after purchase. Preview it here or watch during setup.
            </p>
            <p className="text-gray-400 text-sm max-w-xl mx-auto mb-8">
              No technical skills needed — just follow the video step by step. Most customers finish in under 10 minutes.
            </p>
            <Link href="/tutorials">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg gap-2">
                <Play className="w-5 h-5" aria-hidden="true" />
                Watch Setup Tutorial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Channel Logos */}
      <Suspense fallback={null}>
        <ChannelLogos />
      </Suspense>

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
                <h3 className="text-2xl font-bold text-green-400">Reloaded Fire TV + Stream Stick Pro</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Reloaded Fire TV all-in-one app flow - easy to use",
                  "Educational tutorials included with every device order",
                  "1-year included plan on Fire Stick and ONN bundles",
                  "No hunting through huge app lists to find working links",
                  "Fast setup path built for beginners and families",
                  "24/7 support when you need real help",
                  "Built for reliable daily viewing, not trial-and-error"
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
              <p className="text-gray-100 text-lg leading-relaxed">Access 18,000+ live TV channels, 100,000+ movies & series, and comprehensive sports coverage.</p>
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

      {/* Savings Calculator */}
      <Suspense fallback={null}>
        <SavingsCalculator />
      </Suspense>

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
                <h3 className="text-lg font-bold text-white mb-2">What Is a Streaming Device Setup?</h3>
                <p className="text-gray-200 text-sm mb-4">Learn how device setup works and how to start streaming in about 10 minutes.</p>
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

            <a href="/blog/best-live-tv-sports-streaming-2026" className="block" data-testid="blog-card-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-orange-500/50 transition-all cursor-pointer h-full"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Best Live TV Sports Streaming 2026</h3>
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
                description: "Select from Fire Stick HD, 4K, or 4K Max. All device options include clear setup guidance.",
                icon: "📱",
                image: firestick4kImg
              },
              { 
                step: "2", 
                title: "Add IPTV Subscription", 
                description: "Choose your Live TV plan - 1 month, 3 months, or save with longer plans. Multi-device options available.",
                icon: "📺",
                image: iptvImg
              },
              { 
                step: "3", 
                title: "We Ship & Setup", 
                description: "Your device arrives with credentials and clear setup guidance so you can get started quickly.",
                icon: "🚀",
                image: firestick4kMaxImg
              },
              { 
                step: "4", 
                title: "Start Streaming", 
                description: "Plug in, connect to WiFi, and start watching 18,000+ channels and 100,000+ movies instantly.",
                icon: "🎬",
                image: `${SUPABASE_BASE}/4k-live-iptv.jpg`
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
                <div className="mt-6 h-32 rounded-xl overflow-hidden border border-white/10">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
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
                description: "Clear setup guidance with no guesswork. Start quickly with step-by-step support.",
                visual: "💻",
                image: firestickHdImg,
                color: "from-green-500/15 to-emerald-500/5",
                border: "border-green-400/30"
              },
              {
                title: "Instant Access",
                description: "Your credentials arrive instantly via email. Start streaming in minutes, not days.",
                visual: "⚡",
                image: onn4kImg,
                color: "from-yellow-500/15 to-orange-500/5",
                border: "border-yellow-400/30"
              },
              {
                title: "All Premium Content",
                description: "18,000+ channels, 100,000+ movies, all sports including NFL, NBA, UFC PPV.",
                visual: "🎯",
                image: heroImg,
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
                <div className="h-40 rounded-xl overflow-hidden border border-white/10">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Indexing Signals */}
      <section className="py-14 bg-gradient-to-b from-gray-900 to-gray-950 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-3">Secure, indexed, ready to buy</h3>
              <p className="text-gray-300 text-base md:text-lg">
                We keep search engines happy and customers protected: clean redirects, fast pages, XML sitemaps, robots.txt, and Stripe-secured checkout with 24/7 support.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-200">
                {[
                  "Stripe secure checkout",
                  "Robots + XML sitemaps",
                  "Canonical + 301s",
                  "99.9% uptime",
                  "24/7 support",
                ].map((item) => (
                  <span key={item} className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white font-semibold">Payments & Wallets</p>
                  <p className="text-gray-400 text-sm">Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay, Link</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-white font-semibold">Fast crawl & serve</p>
                  <p className="text-gray-400 text-sm">Optimized metadata, canonical headers, and prebuilt sitemaps.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-white font-semibold">Always reachable</p>
                  <p className="text-gray-400 text-sm">24/7 human support at reloadedfiretvteam@gmail.com.</p>
                </div>
              </div>
            </div>
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
                Setup takes about 10 minutes. After purchase you'll receive login credentials instantly and an easy setup video. Each bundle includes 1 Year of Live TV, Movies, and Series, plus shipping included and 24/7 support.
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
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 text-white py-3 md:py-4 px-3 md:px-4 z-[99] border-t-4 border-orange-300/50 shadow-2xl">
        <div className="container mx-auto flex items-center justify-center gap-2 md:gap-4 flex-wrap pr-16 md:pr-0 text-center">
          <Mail className="w-6 h-6 flex-shrink-0" />
          <span className="text-sm sm:text-base md:text-lg font-semibold">Need Help? Contact us:</span>
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="font-bold text-white hover:text-orange-100 underline decoration-2 underline-offset-2 transition-colors text-sm sm:text-base md:text-lg cursor-pointer bg-transparent border-none p-0 hover:bg-white/10 rounded px-2 py-1 break-all sm:break-normal"
            data-testid="link-support-email"
            aria-label="Open contact support message box"
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
        className="fixed bottom-28 md:bottom-24 right-3 md:right-6 z-[100] group"
        data-testid="link-whatsapp"
        aria-label="Chat with us on WhatsApp"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
          <Button className="rounded-full w-14 h-14 md:w-16 md:h-16 shadow-2xl bg-green-500 hover:bg-green-600 border-4 border-white/30 relative z-10 transition-all transform hover:scale-110" data-testid="button-chat">
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </Button>
        </div>
        <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-xl opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-semibold pointer-events-none hidden md:block">
          Chat with us!
        </div>
      </a>

      {/* Footer */}
      <footer className="bg-gray-800/80 backdrop-blur-sm text-gray-200 border-t border-white/20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-8 h-8 text-orange-500" />
                <span className="text-xl font-bold text-white">StreamStickPro</span>
              </div>
              <p className="text-sm text-gray-200 mb-4">
                Premium Live TV streaming with 18,000+ channels and 100,000+ movies & series. Fire Stick and streaming device options available.
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
                <li><Link href="/"><span className="hover:text-orange-400 transition-colors cursor-pointer">Home</span></Link></li>
                <li><a href="#shop" className="hover:text-orange-400 transition-colors cursor-pointer">Shop All Products</a></li>
                <li><Link href="/blog"><span className="hover:text-orange-400 transition-colors cursor-pointer">Blog & Guides</span></Link></li>
                <li><Link href="/resources"><span className="hover:text-orange-400 transition-colors cursor-pointer">Resources & Channel Directory</span></Link></li>
                <li><a href="#about" className="hover:text-orange-400 transition-colors cursor-pointer">About Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Guides</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/iptv-services"><span className="hover:text-orange-400 transition-colors">IPTV Services</span></Link></li>
                <li><Link href="/iptv-firestick"><span className="hover:text-orange-400 transition-colors">IPTV for Firestick</span></Link></li>
                <li><Link href="/iptv-media-players"><span className="hover:text-orange-400 transition-colors">IPTV Media Players</span></Link></li>
                <li><Link href="/firestick-devices"><span className="hover:text-orange-400 transition-colors">Fire Stick Devices</span></Link></li>
                <li><Link href="/jailbroken-fire-sticks"><span className="hover:text-orange-400 transition-colors">Jailbroken Fire Sticks</span></Link></li>
                <li><Link href="/best-iptv-firestick"><span className="hover:text-orange-400 transition-colors">Best IPTV Firestick</span></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Payment Methods</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Visa",
                  "Mastercard",
                  "Amex",
                  "Discover",
                  "Apple Pay",
                  "Google Pay",
                  "Link by Stripe",
                ].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-xs font-semibold text-gray-100"
                  >
                    {method}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-400" />
                Secure checkout powered by Stripe.
              </p>
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
                © {new Date().getFullYear()} StreamStickPro. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                <span className="text-green-400 font-semibold">🔒 Secure Payment</span>
                <span className="text-orange-400 font-semibold">24/7 Support</span>
                <span className="text-blue-400 font-semibold">Money-Back Guarantee</span>
                <span className="text-gray-300 font-medium">250K+ users served</span>
                <span className="text-gray-300 font-medium">99.999% uptime</span>
                <span className="text-gray-300 font-medium">Privacy compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </main>

      {/* Exit Intent Popup */}
      <Suspense fallback={null}>
        <ExitPopup />
      </Suspense>

      {/* Floating CTA */}
      <Suspense fallback={null}>
        <FloatingCTA onContact={openSupport} onFreeTrial={scrollToFreeTrial} />
      </Suspense>

      {/* Sticky Mobile CTA */}
      <Suspense fallback={null}>
        <StickyMobileCTA onContact={openSupport} />
      </Suspense>

      {/* Scroll to Top */}
      <Suspense fallback={null}>
        <ScrollToTopButton />
      </Suspense>

      {/* Product Quick View Modal */}
      <Suspense fallback={null}>
        <ProductQuickView 
          product={quickViewProduct} 
          isOpen={isQuickViewOpen} 
          onClose={closeQuickView} 
        />
      </Suspense>

      {/* Support Message Box */}
      <Suspense fallback={null}>
        <SupportMessageBox 
          isOpen={isSupportOpen} 
          onClose={() => setIsSupportOpen(false)} 
        />
      </Suspense>
      </div>
    </div>
  );
}
