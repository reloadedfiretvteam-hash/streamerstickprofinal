// Build timestamp: 2026-01-13T02:19:49.886Z
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { apiCall } from "@/lib/api";
import { motion } from "framer-motion";
import { ShoppingCart, Flame, Check, Star, Zap, Gift, DollarSign, Heart, X } from "lucide-react";
import { useCart, useWishlist } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { getStorageUrl } from "@/lib/supabase";
import { SportsCarousel } from "@/components/SportsCarousel";
import { DemoVideo } from "@/components/DemoVideo";
import { FreeTrial } from "@/components/FreeTrial";
import { QuickViewButton } from "@/components/QuickViewButton";
import { ComparisonTable } from "@/components/ComparisonTable";
import { setPageMeta } from "@/lib/seo";
import { SEOSchema, ItemListSchema } from "@/components/SEOSchema";

const ProductQuickView = lazy(() => import("@/components/ProductQuickView").then((module) => ({ default: module.ProductQuickView })));

const SUPABASE_BASE = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges";
const firestickHdImg = `${SUPABASE_BASE}/firestick-original-jailbroken.jpg`;
const firestick4kImg = `${SUPABASE_BASE}/firestick-4k-jailbroken.jpg`;
const firestick4kMaxImg = `${SUPABASE_BASE}/firestick-4k-max-jailbroken.jpg`;
const iptvImg = `${SUPABASE_BASE}/iptv-subscription.jpg`;

// Force new bundle - v2.0.$(date +%s)
const SHOP_VERSION = "2.0.1736762400";

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
    description: "Premium Live TV streaming with curated, working links—no dead Kodi lists, no endless broken app hunts.",
    features: ["18,000+ Live TV Channels", "100,000+ Movies & Series", "Comprehensive Sports Coverage", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "24/7 Customer Support (real humans)"],
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
    description: "Save more with 3 months. All-in-one Reloaded Fire TV—no dead-end apps, no Kodi maintenance, just working streams and faster ticket response.",
    features: ["Extensive Live Content Library", "Thousands of Movies & Shows", "Comprehensive Sports Coverage", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "Priority Customer Support (24/7)"],
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
    badge: "VALUE",
    description: "Best value 6-month Reloaded Fire TV with stable links and an all-in-one app flow—no random app installs or failing Kodi builds.",
    features: ["Extensive Live Content Library", "Thousands of Movies & Shows", "Comprehensive Sports Coverage", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "Priority Customer Support", "10% Savings"],
    prices: [
      { devices: 1, price: 45, productId: "iptv-6mo-1d" },
      { devices: 2, price: 75, productId: "iptv-6mo-2d" },
      { devices: 3, price: 105, productId: "iptv-6mo-3d" },
      { devices: 4, price: 125, productId: "iptv-6mo-4d" },
      { devices: 5, price: 145, productId: "iptv-6mo-5d" },
    ],
  },
  {
    duration: "1yr",
    durationLabel: "1 Year",
    badge: "BEST DEAL",
    description: "Ultimate value. One year of premium Reloaded Fire TV with curated, working streams—no dead Kodi builds, no broken apps, no scavenger hunts.",
    features: ["Extensive Live Content Library", "Thousands of Movies & Shows", "Comprehensive Sports Coverage", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "Priority Customer Support (24/7)", "Maximum Savings"],
    prices: [
      { devices: 1, price: 65, productId: "iptv-1yr-1d" },
      { devices: 2, price: 145, productId: "iptv-1yr-2d" },
      { devices: 3, price: 205, productId: "iptv-1yr-3d" },
      { devices: 4, price: 245, productId: "iptv-1yr-4d" },
      { devices: 5, price: 285, productId: "iptv-1yr-5d" },
    ],
  },
];

const defaultProducts: Product[] = [
  {
    id: 'fs-hd',
    name: 'Fire Stick HD',
    price: 125,
    description: 'Entry-level Stream Stick Pro device bundle with Reloaded Fire TV all-in-one setup flow, educational tutorials, and 1-year included access.',
    features: ['1080p Full HD', 'Reloaded Fire TV All-in-One Access', 'Educational Setup Tutorial Included', '1 Year Included Access', '18,000+ Live TV Channels', '24/7 Customer Support'],
    image: firestickHdImg,
    category: 'firestick',
    badge: 'STARTER'
  },
  {
    id: 'fs-4k',
    name: 'Fire Stick 4K',
    price: 135,
    description: 'Most popular Stream Stick Pro Fire Stick bundle with Reloaded Fire TV all-in-one access, guided setup, and 1-year included access.',
    features: ['4K Ultra HD', 'HDR Support', 'Dolby Vision & Atmos', 'Reloaded Fire TV All-in-One Access', 'Educational Setup Tutorial Included', '1 Year Included Access', '24/7 Customer Support'],
    image: firestick4kImg,
    category: 'firestick',
    badge: 'POPULAR',
    popular: true
  },
  {
    id: 'fs-max',
    name: 'Fire Stick 4K Max',
    price: 145,
    description: 'Performance-first Stream Stick Pro Fire Stick Max bundle with Reloaded Fire TV all-in-one access, educational setup, and 1-year included access.',
    features: ['4K Ultra HD', 'Wi-Fi 6E (Fastest)', 'HDR Support', 'Dolby Vision & Atmos', 'Reloaded Fire TV All-in-One Access', 'Educational Setup Tutorial Included', '1 Year Included Access', '24/7 Customer Support'],
    image: firestick4kMaxImg,
    category: 'firestick',
    badge: 'PREMIUM'
  },
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

export default function Shop() {
  const [, setLocation] = useLocation();
  const { addItem, addItemWithQuantity } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [firestickQuantities, setFirestickQuantities] = useState<Record<string, number>>({});
  const [selectedDevices, setSelectedDevices] = useState<Record<string, number>>({
    "1mo": 1,
    "3mo": 1,
    "6mo": 1,
    "1yr": 1,
  });
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>("new");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const hashText = (value: string): number => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  };

  const socialProofSeed = useMemo(() => {
    const timeBucket = Math.floor(Date.now() / (1000 * 60 * 20)); // refreshes every 20 min
    let sessionSalt = 71;
    if (typeof window !== "undefined") {
      const key = "ssp-social-proof-salt";
      const existing = window.sessionStorage.getItem(key);
      if (existing) {
        sessionSalt = Number(existing) || sessionSalt;
      } else {
        sessionSalt = 100 + Math.floor(Math.random() * 900);
        window.sessionStorage.setItem(key, String(sessionSalt));
      }
    }
    return timeBucket + sessionSalt;
  }, []);

  const countForKey = (key: string, base: number, spread: number) =>
    base + (hashText(`${key}-${socialProofSeed}`) % spread);

  // Stable for session bucket while still rotating realistically
  const iptvViewCounts = useMemo(() => ({
    "1mo": countForKey("iptv-1mo", 18, 19),
    "3mo": countForKey("iptv-3mo", 22, 21),
    "6mo": countForKey("iptv-6mo", 20, 18),
    "1yr": countForKey("iptv-1yr", 24, 24),
  }), [socialProofSeed]);

  const firestickViewCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    defaultProducts.forEach((p, idx) => {
      counts[p.id] = countForKey(`device-${p.id}-${idx}`, 12, 28);
    });
    return counts;
  }, [socialProofSeed]);

  const reviews = useMemo(() => [
    { name: "Marcus T.", text: "Setup was guided — no dead apps, streaming in minutes." },
    { name: "Elena R.", text: "Reloaded Fire TV saved me from the Kodi update grind." },
    { name: "Brian K.", text: "Stream Stick Pro gave me one workflow, instant credentials, and 24/7 chat that actually replied at midnight." },
    { name: "Danielle P.", text: "Streams are stable and support helped me on Wi-Fi tweaks fast." },
    { name: "Sergio M.", text: "Bought two devices — both worked day one. Support followed up to ensure channels were fine." },
    { name: "Kyle W.", text: "Switched from cable and saved $140/mo. Setup took maybe 8 minutes." },
    { name: "Andrea L.", text: "The tutorial video walked me through everything. Even my parents could do it." },
    { name: "Jamal C.", text: "Tried three other live TV sites first — dead links everywhere. This one just worked." },
    { name: "Priya S.", text: "Love the sports coverage. UFC, NFL, Premier League — all in one place." },
    { name: "Devon M.", text: "Customer support answered at 2 AM on a Sunday. That sold me for good." },
    { name: "Lisa H.", text: "No buffering issues after they helped me optimize my router settings." },
    { name: "Carlos R.", text: "Got the ONN box for my bedroom TV. Same great experience as my Fire Stick." },
  ], []);

  const reviewOffset = socialProofSeed % reviews.length;
  const pickReview = (key: string, fallbackIndex = 0) =>
    reviews[(reviewOffset + fallbackIndex + (hashText(key) % reviews.length)) % reviews.length];

  useEffect(() => {
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
    setPageMeta({
      title: "Reloaded Fire TV Subscription Plans 2026 | Fire Stick & Devices | StreamStick Pro",
      description: "Shop Reloaded Fire TV plans from $11/mo and Fire Stick device options. 18K+ channels, 4K, and 99.9% uptime. Start a 36-hour subscription trial or buy now with StreamStick Pro.",
      path: "/shop",
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
          const defaultDescription = defaultProducts.find(dp => dp.id === p.id)?.description || '';

          const priceInCents = parseInt(p.price?.toString() || '0', 10);
          let priceInDollars = priceInCents / 100;
          // Temporary guard: ensure 1-year / 1-device reflects correct 65 price even if backend lags.
          if (p.id === 'iptv-1yr-1d') {
            priceInDollars = 65;
          }

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

  const firestickProducts = products.filter(p => p.category === 'firestick');

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
    }));
    focusRecommendedCards(config);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <SEOSchema faq={[
        { question: "How much does StreamStickPro Reloaded Fire TV cost?", answer: "Reloaded Fire TV plans start at $11/month for 1 device. Multi-device plans and 3-month, 6-month, and 1-year options offer deeper savings — the 1-year plan is $65 per device." },
        { question: "What devices work with StreamStickPro Reloaded Fire TV?", answer: "StreamStickPro works on Amazon Fire Stick (HD, 4K, 4K Max), ONN Google TV (4K, 4K Pro), Android phones/tablets, iOS via Smarters, Smart TVs, and TiviMate on any Android-based device." },
        { question: "Is there a free trial before I buy?", answer: "Yes — every Reloaded Fire TV subscription plan includes a free 36-hour trial so you can test channel quality, speed, and the setup process before committing." },
        { question: "How do I get my Reloaded Fire TV credentials after purchase?", answer: "Credentials are delivered instantly to your email after checkout. You also receive a step-by-step setup tutorial video and have access to 24/7 human support if you need help." },
        { question: "What payment methods do you accept?", answer: "We accept Visa, Mastercard, Amex, Discover, Apple Pay, Google Pay, Cash App, Affirm (buy now pay later), Klarna, and Stripe Link for one-click checkout." },
      ]} />
      <ItemListSchema
        name="StreamStickPro Reloaded Fire TV Plans & Devices"
        description="Premium Reloaded Fire TV subscription plans and optional Fire Stick / ONN streaming device bundles"
        items={products.map(p => ({
          name: p.name,
          description: p.description,
          url: `https://streamstickpro.com/shop#${p.id}`,
          image: p.image,
          price: p.price,
        }))}
      />
      {/* Shop Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-6 py-2 mb-6">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
              <span className="text-sm font-medium text-orange-300">SHOP ALL PRODUCTS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Premium Products</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Browse our complete collection of streaming device options and Live TV plans
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto mb-10 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 sm:p-5">
            <p className="text-white font-semibold text-sm sm:text-base mb-3">Fast decision path for new buyers</p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-orange-400/30 bg-orange-500/10 p-3">
                <div className="flex items-center gap-2 text-orange-200 font-semibold text-sm mb-1">
                  <Gift className="w-4 h-4" /> Try first
                </div>
                <p className="text-gray-200 text-xs sm:text-sm">Start with the 36-hour trial to validate stream quality before committing.</p>
              </div>
              <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-3">
                <div className="flex items-center gap-2 text-blue-200 font-semibold text-sm mb-1">
                  <DollarSign className="w-4 h-4" /> Best value
                </div>
                <p className="text-gray-200 text-xs sm:text-sm">Monthly starts at $11; yearly plan is $65 for strongest long-term value.</p>
              </div>
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold text-sm mb-1">
                  <Check className="w-4 h-4" /> Risk reduction
                </div>
                <p className="text-gray-200 text-xs sm:text-sm">Instant credentials, setup tutorial, and 24/7 support included after checkout.</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] sm:text-xs">
              {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "Cash App", "Affirm", "Klarna", "Link"].map((pm) => (
                <span key={pm} className="px-2 py-1 rounded-full border border-white/15 bg-white/5 text-gray-200 font-semibold">{pm}</span>
              ))}
            </div>
          </div>

          {/* Reloaded Fire TV live TV plans - DISPLAYED FIRST (Most Popular) */}
          <div className="mb-20">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-center flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-blue-500" />
              Premium Live TV Subscriptions
            </h3>
            <p className="text-center text-gray-200 mb-8 max-w-2xl mx-auto">
              Choose your subscription length and number of devices. No “preloaded” claims—just curated, working Reloaded Fire TV with an all-in-one app, no Kodi rebuilds, and no dead-end app lists. Instant login credentials + tutorial video + 24/7 support. 36-hour trial applies to Reloaded Fire TV plans. Multi-device plans stream on multiple TVs, phones, or tablets at once.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 max-w-4xl mx-auto text-left">
              {[
                "Instant credentials via email",
                "Tutorial video included",
                "24/7 human support",
                "No dead apps / no Kodi rebuilds",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100">
                  <Check className="w-4 h-4 text-green-300" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>

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
            <FreeTrial />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {iptvPricingMatrix.map((plan, index) => {
                const deviceCount = selectedDevices[plan.duration];
                const selectedPrice = plan.prices.find(p => p.devices === deviceCount) || plan.prices[0];
                const recommendedPlan = BUYER_PROFILE_CONFIG[buyerProfile].planDuration === plan.duration;
                const durationKey = plan.duration as keyof typeof iptvViewCounts;
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
                        : recommendedPlan
                          ? 'ring-2 ring-orange-400 shadow-2xl shadow-orange-500/25'
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
                            <span className="text-gray-300 text-sm">
                              / {plan.durationLabel.toLowerCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 mt-1">
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

                        <div className="space-y-1.5">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Check className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                              <span className="text-blue-100 text-xs">{feature}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 text-[11px] text-amber-200 font-semibold mt-2">
                            <Star className="w-3 h-3" />
                            {iptvViewCounts[durationKey]} households just viewed this plan
                          </div>
                          <div className="text-[11px] text-gray-200 bg-white/5 border border-white/10 rounded-lg p-2 mt-2">
                            {(() => {
                              const r = pickReview(`iptv-${plan.duration}`, index);
                              return `“${r.text}” — ${r.name}`;
                            })()}
                          </div>
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

          {/* After checkout reassurance */}
          <div className="mt-10 mb-14 max-w-5xl mx-auto bg-gradient-to-r from-gray-900/70 via-gray-900/50 to-gray-900/70 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h4 className="text-xl font-bold text-white mb-2">What happens after checkout</h4>
            <div className="grid md:grid-cols-2 gap-3 text-gray-100 text-sm">
              {[
                "Instant email with your credentials",
                "Separate setup tutorial video emailed after purchase",
                "All-in-one app flow—no dead-end app lists or Kodi rebuilds",
                "24/7 human support if anything blocks playback",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-300 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fire Stick Tier Comparison Table */}
          <div className="mt-16 mb-12">
            <ComparisonTable />
          </div>

          {/* Fire Stick device options - DISPLAYED SECOND */}
          <div className="mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-center flex items-center justify-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              Fire Stick Device Options
            </h3>
            <p className="text-center text-gray-300 mb-4 max-w-2xl mx-auto">
              Each device includes 1 year of Live TV access, an educational tutorial video, and 24/7 setup help—no Kodi rebuilds, no dead-end app lists, no broken APK scavenger hunts.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 max-w-4xl mx-auto text-left">
              {[
                "Reloaded Fire TV all-in-one flow",
                "Instant credentials + tutorial",
                "1-year access included",
                "24/7 support if you get stuck",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-100">
                  <Check className="w-4 h-4 text-orange-300" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
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
                  className={`relative rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 group ${
                    product.popular 
                      ? 'ring-4 ring-orange-500 scale-105 shadow-2xl shadow-orange-500/50' 
                      : recommendedDevice
                        ? 'ring-2 ring-orange-400 shadow-2xl shadow-orange-500/25'
                      : `hover:shadow-2xl ${glowColors[index]}`
                  }`}
                  data-testid={`card-product-${product.id}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${cardGradients[index]}`} />
                  
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                  }} />
                  
                  <div className={`absolute inset-0 bg-gradient-to-b ${accentGradients[index]} opacity-80`} />
                  
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/15 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full" />
                  
                  <div className={`absolute inset-0 border-2 ${borderColors[index]} rounded-2xl transition-all duration-500 group-hover:shadow-[inset_0_0_20px_rgba(249,115,22,0.1)]`} />
                  
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
                        aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
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
                                  <span className="text-sm text-gray-300">
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
                          {firestickQuantities[product.id] > 1
                            ? `Add ${firestickQuantities[product.id]} to Cart`
                            : 'Add to Cart'}
                        </button>
                      </div>

                      <div className="space-y-3">
                        {product.features.slice(0, 6).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-blue-100 text-sm">{feature}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 text-xs text-amber-200 font-semibold">
                          <Star className="w-4 h-4" />
                          {firestickViewCounts[product.id] || 90} people just viewed this product
                        </div>
                        <div className="text-xs text-gray-200 bg-white/5 border border-white/10 rounded-lg p-3">
                          {(() => {
                            const r = pickReview(`device-${product.id}`, index + 4);
                            return `“${r.text}” — ${r.name}`;
                          })()}
                        </div>
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

      {isQuickViewOpen && quickViewProduct && (
        <Suspense fallback={null}>
          <ProductQuickView
            product={quickViewProduct}
            isOpen={isQuickViewOpen}
            onClose={closeQuickView}
          />
        </Suspense>
      )}
    </div>
  );
}
