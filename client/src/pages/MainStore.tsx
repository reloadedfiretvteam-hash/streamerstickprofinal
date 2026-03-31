import { useEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { useLocation, Link } from "wouter";
import { apiCall } from "@/lib/api";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ShoppingCart, Flame, Check, Star, Zap, Mail, DollarSign, CreditCard, MessageCircle, X, Gift, ChevronRight, Heart } from "lucide-react";
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
import { SEOSchema, ServiceSchema, ItemListSchema } from "@/components/SEOSchema";
import { setPageMeta } from "@/lib/seo";
import { MobileNav } from "@/components/MobileNav";
import { QuickViewButton } from "@/components/QuickViewButton";
import { playCtaClick } from "@/lib/ctaSound";

const ProductQuickView = lazy(() => import("@/components/ProductQuickView").then((module) => ({ default: module.ProductQuickView })));
const ExitPopup = lazy(() => import("@/components/ExitPopup").then((module) => ({ default: module.ExitPopup })));
const DemoVideo = lazy(() => import("@/components/DemoVideo").then((module) => ({ default: module.DemoVideo })));
const FreeTrial = lazy(() => import("@/components/FreeTrial").then((module) => ({ default: module.FreeTrial })));
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
  "60,000+ movies (on-demand)",
  "15,000+ TV series",
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
    description: "Premium Live TV streaming plan with 18,000+ live TV channels, 60,000+ movies, 15,000+ series, and comprehensive sports coverage.",
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
    description: "Save more with 3 months! Premium Live TV plan with 18,000+ live TV channels, 60,000+ movies, 15,000+ series, and comprehensive sports coverage.",
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
    description: "10% OFF! 6-month premium Live TV streaming plan with 18,000+ live TV channels, 60,000+ movies, 15,000+ series, and comprehensive sports coverage.",
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
    price: 125,
    description: "Start in about 10 minutes. Plug in your Fire Stick, enter your credentials sent instantly after purchase, and follow the device-specific tutorial emailed with your order. You'll unlock 18,000+ live TV channels, 60,000+ movies, 15,000+ series, and comprehensive sports coverage including NFL, NBA, UFC, and live events. Includes a 1 Year Live TV plan, 24/7 customer support, setup guidance, and shipping included.",
    features: productBenefitList,
    image: firestickHdImg,
    category: "firestick",
    badge: "STARTER"
  },
  {
    id: "firestick-4k",
    name: "StreamStick 4K Kit",
    price: 135,
    description: "Best-selling Fire Stick setup in about 10 minutes. Plug in, enter your instant credentials, follow the device-specific tutorial emailed with your order, and you're streaming in 4K with Dolby Vision. Enjoy 18,000+ live TV channels, 60,000+ movies, 15,000+ series, and all major sports - NFL, NBA, UFC, and live events. Includes a 1 Year premium Live TV plan, 24/7 support, setup guidance, and shipping included.",
    features: productBenefitList,
    image: firestick4kImg,
    category: "firestick",
    badge: "BEST VALUE",
    popular: true
  },
  {
    id: "firestick-4k-max",
    name: "StreamStick Max Kit",
    price: 145,
    description: "Ultimate 4K Max with Wi-Fi 6E setup in about 10 minutes. Plug in, use your instant credentials, follow the device-specific tutorial emailed with your order, and experience breathtaking 4K with Dolby Atmos sound. Access 18,000+ live TV channels, 60,000+ movies, 15,000+ series, and all major sports. Includes a 1 Year premium Live TV plan, priority 24/7 support, setup guidance, and shipping included.",
    features: productBenefitList,
    image: firestick4kMaxImg,
    category: "firestick",
    badge: "PREMIUM"
  },
  {
    id: "android-onn-4k",
    name: "ONN 4K Streaming Device Kit",
    price: 115,
    description: "Upgrade from Fire Stick to Android. The ONN 4K Streaming Device with Google TV delivers the same great features you love, plus built-in storage for live DVR recording. Setup takes about 10 minutes - plug in, enter your instant credentials, and follow the device-specific tutorial emailed with your order. Access 18,000+ live TV channels, 60,000+ movies, 15,000+ series, and comprehensive sports coverage. Includes a 1 Year Live TV plan, 24/7 support, setup guidance, and shipping included.",
    features: productBenefitList,
    image: onn4kImg,
    category: "firestick",
    badge: "ANDROID"
  },
  {
    id: "android-onn-pro",
    name: "ONN 4K Ultra HD Pro Kit",
    price: 125,
    description: "The ultimate Android streaming upgrade. ONN 4K Ultra HD Pro features expanded storage for extensive DVR recording, Google TV interface, and premium performance. Setup takes about 10 minutes - plug in, use your instant credentials, and follow the device-specific tutorial emailed with your order. Access 18,000+ live TV channels, 60,000+ movies, 15,000+ series, and all major sports. Includes a 1 Year premium Live TV plan, priority 24/7 support, setup guidance, and shipping included.",
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

const HOMEPAGE_FAQ = [
  {
    question: "IPTV vs Device - What's the difference?",
    answer: "IPTV is the service-only path that gives you streaming access through supported apps. Devices are hardware options that ship ready-to-use and include 1-year Reloaded Fire TV subscription access.",
  },
  {
    question: "Does every device include 1-year subscription?",
    answer: "Yes. Fully loaded device messaging is built around hardware plus 1-year Reloaded Fire TV subscription included.",
  },
  {
    question: "Firestick, Onn, Roku - which works best?",
    answer: "Fire TV Stick and Onn Google TV are the primary ready-to-use options. Roku compatibility depends on the supported app path you choose.",
  },
  {
    question: "Is setup technical or beginner-friendly?",
    answer: "It is designed to be beginner-friendly with one clear path, setup guidance, and support when needed.",
  },
  {
    question: "What if apps update and break?",
    answer: "Third-party app behavior can change over time, but guided setup, ongoing support, and simpler all-in-one workflows reduce maintenance compared with DIY setups.",
  },
  {
    question: "36hr trial - any catch?",
    answer: "The 36-hour trial is the try-before-you-buy option for IPTV subscription access so you can test quality and fit before committing.",
  },
  {
    question: "International channels available?",
    answer: "Yes. IPTV access includes sports, news, and international channel options across supported applications.",
  },
  {
    question: "Cancel anytime?",
    answer: "Yes. Subscription customers can choose the plan length that fits them best without being locked into cable-style contracts.",
  },
];

export default function MainStore() {
  const [location, setLocation] = useLocation();
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

  const iptvViewCounts = useMemo(() => ({
    "1mo": countForKey("iptv-1mo", 122, 112),
    "3mo": countForKey("iptv-3mo", 155, 126),
    "6mo": countForKey("iptv-6mo", 142, 118),
    "1yr": countForKey("iptv-1yr", 178, 137),
  }), [socialProofSeed]);

  const firestickViewCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    defaultProducts.forEach((p, idx) => {
      counts[p.id] = countForKey(`device-${p.id}-${idx}`, 82, 121);
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
    { name: "Jamal C.", text: "Tried three other IPTV sites first — dead links everywhere. This one just worked." },
    { name: "Priya S.", text: "Love the sports coverage. UFC, NFL, Premier League — all in one place." },
    { name: "Devon M.", text: "Customer support answered at 2 AM on a Sunday. That sold me for good." },
    { name: "Lisa H.", text: "No buffering issues after they helped me optimize my router settings." },
    { name: "Carlos R.", text: "Got the ONN box for my bedroom TV. Same great experience as my Fire Stick." },
  ], []);

  const reviewOffset = socialProofSeed % reviews.length;
  const pickReview = (key: string, fallbackIndex = 0) =>
    reviews[(reviewOffset + fallbackIndex + (hashText(key) % reviews.length)) % reviews.length];

  const heroRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
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
      title: "IPTV Subscriptions & Streaming Devices | StreamStickPro",
      description: "Access IPTV subscriptions with thousands of live channels, movies, and series, or choose ready-to-use streaming devices with simple setup.",
      path: "/",
    });
    loadProducts();
  }, []);

  useEffect(() => {
    if (location === "/faq") {
      setTimeout(() => {
        document.getElementById("faq")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [location]);

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
  const scrollToFaq = () => navigateToSection('faq');
  const openSupport = () => setIsSupportOpen(true);
  const scrollToFreeTrial = () => setLocation("/36hr-trial");

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
      return `Premium Live TV plan: ${product.name}. 18,000+ live channels, 60,000+ movies, 15,000+ series, sports and PPV. Multi-device options. StreamStickPro.`;
    }
    return `${product.name} with 1 year Live TV included, plus setup guidance and support. 18,000+ channels, 60,000+ movies, and 15,000+ series. StreamStickPro.`;
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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans selection:bg-[#00D4FF] selection:text-[#0A0A0F] pb-32 md:pb-20 relative">
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

      <SEOSchema faq={HOMEPAGE_FAQ} />

      {/* Service Schema for IPTV Service Offerings */}
      <ServiceSchema 
        name="Premium IPTV Streaming Service"
        description="Access 18,000+ live TV channels, 60,000+ movies, and 15,000+ series, plus premium sports including NFL, NBA, MLB, UFC PPV. Multi-device streaming with instant credentials, setup tutorial, 24/7 human support, and optional Fire Stick / ONN bundles with Reloaded Fire TV."
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
            <MobileNav scrollToShop={scrollToShop} scrollToFaq={scrollToFaq} onSupportClick={openSupport} />
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
                  <Flame className="w-7 h-7 text-[#00D4FF]" />
                </motion.div>
                <span className="sm:hidden text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]">
                  SSP
                </span>
                <span className="hidden sm:inline max-w-[140px] truncate whitespace-nowrap text-base sm:max-w-none sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]">
                  Stream Stick Pro
                </span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/iptv"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">IPTV</span></Link>
            <Link href="/devices"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">Devices</span></Link>
            <Link href="/bundles"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">Bundles</span></Link>
            <Link href="/setup"><span className="hidden md:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">Setup</span></Link>
            <Link href="/faq"><span className="hidden lg:inline px-2 py-1.5 text-[13px] text-gray-100 hover:text-white hover:bg-white/10 rounded font-semibold">FAQ</span></Link>
            <Button 
              onClick={openSupport} 
              className="hidden md:flex bg-[#00D4FF] hover:bg-[#10F7BE] text-[#0A0A0F] font-semibold px-4 py-2 rounded-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105" 
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
              className="relative bg-white/5 hover:bg-white/10 border border-[#2A2A33] text-white shadow-lg"
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
      {/* Section 1 — Hero */}
      <section ref={heroRef} className="relative z-10 overflow-hidden border-b border-[#2A2A33] bg-gradient-to-b from-[#0A0A0F] to-[#1A1A22] py-20 md:min-h-[92vh] md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center text-center">
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              StreamStickPro: IPTV + Devices with Reloaded Fire TV
            </h1>
            <p className="mt-6 max-w-4xl text-base md:text-xl text-[#B0B3B8]">
              18K+ live channels • 60K+ movies • 15K+ series across all your devices
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["247K Users", "99.9% Uptime", "McAfee Secure", "36hr Free Trial"].map((item) => (
                <span key={item} className="rounded-full border border-[#2A2A33] bg-white/5 px-3 py-1 text-xs font-semibold text-white">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex w-full max-w-xl flex-col gap-3">
              <Link href="/36hr-trial">
                <span
                  onClick={() => playCtaClick()}
                  className="inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-xl bg-[#00D4FF] px-8 py-4 text-base font-semibold text-[#0A0A0F] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:bg-[#10F7BE]"
                >
                  START IPTV TRIAL
                </span>
              </Link>
              <Link href="/devices">
                <span
                  onClick={() => playCtaClick()}
                  className="inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-xl border border-[#00D4FF] bg-transparent px-8 py-4 text-base font-semibold text-[#00D4FF] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all hover:border-[#10F7BE] hover:text-[#10F7BE]"
                >
                  SHOP RELOADED FIRE TV
                </span>
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-[#B0B3B8]">
              <Link href="/iptv"><span className="cursor-pointer rounded-full border border-[#2A2A33] bg-white/5 px-3 py-1.5 hover:text-white hover:border-[#00D4FF]">Explore IPTV Plans</span></Link>
              <Link href="/devices"><span className="cursor-pointer rounded-full border border-[#2A2A33] bg-white/5 px-3 py-1.5 hover:text-white hover:border-[#00D4FF]">Shop Reloaded Fire TV Devices</span></Link>
              <Link href="/bundles"><span className="cursor-pointer rounded-full border border-[#2A2A33] bg-white/5 px-3 py-1.5 hover:text-white hover:border-[#00D4FF]">View Bundles</span></Link>
              <Link href="/setup"><span className="cursor-pointer rounded-full border border-[#2A2A33] bg-white/5 px-3 py-1.5 hover:text-white hover:border-[#00D4FF]">Setup Guides</span></Link>
              <Link href="/faq"><span className="cursor-pointer rounded-full border border-[#2A2A33] bg-white/5 px-3 py-1.5 hover:text-white hover:border-[#00D4FF]">FAQ</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Path Section */}
      <section className="border-b border-[#2A2A33] bg-[#1A1A22] py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <div className="rounded-xl border border-[#2A2A33] bg-[#0A0A0F] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <h2 className="text-white text-3xl md:text-4xl font-bold">IPTV Subscription</h2>
              <p className="mt-4 text-[#B0B3B8]">
                All-in-one streaming app. One login. No app juggling. Works on Fire TV Stick, Onn Google TV, Roku, Android.
              </p>
              <ul className="mt-5 space-y-3 text-white">
                {[
                  "18,000+ live channels",
                  "60,000+ movies",
                  "15,000+ series",
                  "Sports • News • International • 99% uptime",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10F7BE]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/36hr-trial">
                <span
                  onClick={() => playCtaClick()}
                  className="mt-6 inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-xl bg-[#00D4FF] px-6 py-4 text-base font-semibold text-[#0A0A0F] transition-all hover:bg-[#10F7BE]"
                >
                  START 36HR FREE TRIAL
                </span>
              </Link>
            </div>
            <div className="rounded-xl border border-[#2A2A33] bg-[#0A0A0F] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <h2 className="text-white text-3xl md:text-4xl font-bold">Reloaded Fire TV Devices</h2>
              <p className="mt-4 text-[#B0B3B8]">
                Fire Stick, Onn, and Android device options with Reloaded Fire TV included for a clearer, faster setup path.
              </p>
              <ul className="mt-5 space-y-3 text-white">
                {[
                  "Fire TV Stick 4K • Onn Google TV • Android boxes",
                  "Zero setup required • 1-year service included",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10F7BE]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/devices">
                <span
                  onClick={() => playCtaClick()}
                  className="mt-6 inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-xl bg-[#00D4FF] px-6 py-4 text-base font-semibold text-[#0A0A0F] transition-all hover:bg-[#10F7BE]"
                >
                  SHOP RELOADED FIRE TV
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="border-b border-[#2A2A33] bg-[#0A0A0F] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-white text-3xl md:text-4xl font-bold">Why StreamStickPro Beats DIY Setups</h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              ["SIMPLE", "One app vs 10+ apps, addons, sideloading"],
              ["RELIABLE", "No constant updates/repairs vs Kodi breakage"],
              ["COMPLETE", "Devices ship with 1-year service vs empty hardware"],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl border border-[#2A2A33] bg-[#1A1A22] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <h3 className="text-white text-2xl font-bold">{title}</h3>
                <p className="mt-3 text-[#B0B3B8]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-b border-[#2A2A33] bg-[#1A1A22] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl md:text-4xl font-bold text-white">StreamStickPro vs Other Jailbreak Sites</h2>
            <div className="mt-8 overflow-hidden rounded-xl border border-[#2A2A33] bg-[#0A0A0F] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="hidden md:grid md:grid-cols-3 border-b border-[#2A2A33] bg-white/5">
                <div className="p-4 font-semibold text-white">Feature</div>
                <div className="p-4 font-semibold text-white">Us</div>
                <div className="p-4 font-semibold text-white">Other Jailbreak Sites</div>
              </div>
              {[
                ["Setup Time", "60 seconds", "30+ minutes"],
                ["Apps Needed", "1 all-in-one app", "5-15 apps to juggle"],
                ["Maintenance", "Automatic", "Constant fixes"],
                ["Device Bundle", "1-year included", "None"],
                ["Support", "Direct support", "Forums or trial-and-error"],
                ["Mobile Friendly", "Yes", "No"],
              ].map(([feature, ours, theirs]) => (
                <div key={feature} className="grid gap-2 border-t border-[#2A2A33] p-4 md:grid-cols-3">
                  <div className="font-semibold text-white">{feature}</div>
                  <div className="text-[#10F7BE]">{ours}</div>
                  <div className="text-[#B0B3B8]">{theirs}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  playCtaClick();
                  scrollToShop();
                }}
                className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-[#00D4FF] px-8 py-4 text-base font-semibold text-[#0A0A0F] transition-all hover:bg-[#10F7BE]"
                data-testid="button-choose-your-path"
              >
                CHOOSE YOUR PATH
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-[#2A2A33] bg-[#0A0A0F] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl md:text-4xl font-bold text-white">Works in 3 Steps</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                "Choose IPTV, Device, or Bundle",
                "Checkout securely",
                "Start streaming instantly",
              ].map((label, index) => (
                <div key={label} className="rounded-xl border border-[#2A2A33] bg-[#1A1A22] p-6 text-center">
                  <p className="text-sm font-semibold text-[#00D4FF]">STEP {index + 1}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-[#0A0A0F] py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-xl border border-[#2A2A33] bg-[#1A1A22] p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Important Information</h2>
            <p className="mt-4 text-sm md:text-base text-[#B0B3B8] leading-relaxed">
              Performance depends on your internet speed (10Mbps+ recommended), device model, and third-party app updates.
              StreamStickPro provides access credentials - content availability may vary.
              We cannot guarantee 100% uptime or compatibility with future device updates.
              Users are responsible for complying with local laws and platform policies.
            </p>
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
            <div className="inline-flex items-center gap-2 bg-[#00D4FF]/10 backdrop-blur-sm border border-[#00D4FF]/30 rounded-full px-6 py-2 mb-6">
              <Flame className="w-5 h-5 text-[#00D4FF] animate-pulse" />
              <span className="text-sm font-medium text-[#B8F5FF]">SHOP ALL PRODUCTS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]">Device Kits, IPTV Plans, and Clear Next Steps</span>
            </h2>
            <p className="text-xl text-[#B0B3B8] max-w-3xl mx-auto">
                Choose the path that fits how you stream: IPTV access, devices with Reloaded Fire TV, or a bundle with guided setup and support.
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
                          ? "border-[#00D4FF] bg-[#00D4FF]/15 text-white shadow-lg shadow-cyan-500/20"
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
                    className={`relative rounded-2xl overflow-hidden transition-all duration-300 group ${
                      plan.popular 
                        ? 'ring-2 ring-blue-400 shadow-2xl shadow-blue-500/40' 
                        : recommendedPlan
                          ? 'ring-2 ring-[#7C3AED] shadow-2xl shadow-violet-500/25'
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
                        <div className="bg-gradient-to-r from-[#7C3AED] to-[#00D4FF] text-white px-4 py-2 rounded-full font-bold shadow-lg text-xs">
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
                              : 'bg-[#7C3AED] text-white'
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
                            {iptvViewCounts[durationKey]} households just viewed this plan
                          </div>
                          <div className="text-[11px] text-gray-200 bg-white/5 border border-white/10 rounded-lg p-2 mt-2">
                            {(() => {
                              const r = pickReview(`iptv-${plan.duration}`, ["1mo", "3mo", "6mo", "1yr"].indexOf(plan.duration));
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
                <Flame className="w-8 h-8 text-[#00D4FF]" />
                Compare Loaded Device Kits
              </h3>
              <p className="text-[#B0B3B8] max-w-2xl mx-auto">
                Compare performance tiers, choose the hardware that fits your home, and keep the same guided setup flow across device options.
              </p>
            </div>
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 overflow-hidden" data-testid="tier-comparison-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left p-4 text-gray-200 font-medium">Features</th>
                    <th className="text-center p-4">
                      <div className="text-lg font-bold text-white">Starter Kit</div>
                      <div className="text-2xl font-bold text-[#00D4FF]">$125</div>
                      <div className="text-xs text-gray-200">1080p Full HD</div>
                    </th>
                    <th className="text-center p-4 bg-[#00D4FF]/10 relative">
                      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 bg-[#00D4FF] text-[#0A0A0F] text-xs font-bold px-2 py-0.5 rounded-b">BEST VALUE</div>
                      <div className="text-lg font-bold text-white pt-4">4K Kit</div>
                      <div className="text-2xl font-bold text-[#00D4FF]">$135</div>
                      <div className="text-xs text-gray-200">4K Ultra HD</div>
                    </th>
                    <th className="text-center p-4">
                      <div className="text-lg font-bold text-white">Max Kit</div>
                      <div className="text-2xl font-bold text-[#00D4FF]">$145</div>
                      <div className="text-xs text-gray-200">4K + Wi-Fi 6E</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Resolution</td>
                    <td className="text-center p-4 text-white">1080p Full HD</td>
                    <td className="text-center p-4 text-white bg-[#00D4FF]/5">4K Ultra HD</td>
                    <td className="text-center p-4 text-white">4K Ultra HD</td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">HDR Support</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-200 mx-auto" /></td>
                    <td className="text-center p-4 bg-[#00D4FF]/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Dolby Vision & Atmos</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-200 mx-auto" /></td>
                    <td className="text-center p-4 bg-[#00D4FF]/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Wi-Fi 6E (Fastest)</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-gray-200 mx-auto" /></td>
                    <td className="text-center p-4 bg-[#00D4FF]/5"><X className="w-5 h-5 text-gray-200 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">1 Year Live TV Included</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-[#00D4FF]/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Extensive Live Content</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-[#00D4FF]/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">60,000+ Movies &amp; 15,000+ Series</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-[#00D4FF]/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  </tr>
                  <tr className="border-b border-slate-700/30">
                    <td className="p-4 text-gray-200">Comprehensive Sports Coverage</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                    <td className="text-center p-4 bg-[#00D4FF]/5"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
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
                    <div className="text-[#00D4FF] font-semibold mt-2">Regular Price</div>
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
              <Flame className="w-8 h-8 text-[#00D4FF]" />
              Reloaded Fire TV Device Kits
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {firestickProducts.map((product, index) => {
                const recommendedDevice = getDeviceTier(product.id) === BUYER_PROFILE_CONFIG[buyerProfile].deviceTier;
                const cardGradients = [
                  'from-slate-800 via-slate-900 to-gray-900',
                  'from-violet-950/60 via-slate-900 to-gray-900',
                  'from-indigo-950/60 via-slate-900 to-gray-900'
                ];
                const borderColors = [
                  'border-slate-600/60 hover:border-[#00D4FF]/70',
                  'border-[#7C3AED]/40 hover:border-[#7C3AED]',
                  'border-indigo-500/40 hover:border-indigo-400'
                ];
                const glowColors = [
                  'shadow-slate-500/20',
                  'shadow-violet-500/40',
                  'shadow-indigo-500/30'
                ];
                const accentGradients = [
                  'from-slate-400/20 via-slate-500/10 to-transparent',
                  'from-[#7C3AED]/30 via-[#00D4FF]/15 to-transparent',
                  'from-indigo-400/25 via-purple-500/15 to-transparent'
                ];
                
                return (
                <div
                  key={product.id}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 group ${
                    product.popular 
                      ? 'ring-2 ring-[#00D4FF] shadow-2xl shadow-cyan-500/40' 
                      : recommendedDevice
                        ? 'ring-2 ring-[#7C3AED] shadow-2xl shadow-violet-500/25'
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
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00D4FF]/15 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Corner accent decorations */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#7C3AED]/10 to-transparent rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-tr-full" />
                  
                  {/* Animated border glow on hover */}
                  <div className={`absolute inset-0 border ${borderColors[index]} rounded-2xl transition-all duration-300 group-hover:shadow-[inset_0_0_16px_rgba(0,212,255,0.08)]`} />
                  
                  {product.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce">
                        <Star className="w-4 h-4 fill-current" />
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  {!product.popular && recommendedDevice && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-[#7C3AED] to-[#00D4FF] text-white px-5 py-2 rounded-full font-bold shadow-lg text-xs">
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
                            ? 'bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] text-white'
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
                                    ? 'bg-[#00D4FF] text-[#0A0A0F] shadow-lg shadow-cyan-500/30'
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
                                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]" data-testid={`text-price-${product.id}`}>
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
                          {firestickViewCounts[product.id] || 90} people just viewed this product
                        </div>
                        <div className="text-xs text-gray-200 bg-white/5 border border-white/10 rounded-lg p-3">
                          {(() => {
                            const r = pickReview(`device-${product.id}`, index + 4);
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
                              ? 'bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] hover:from-[#10F7BE] hover:to-[#00D4FF] shadow-lg shadow-cyan-500/40'
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

        </div>
      </section>



      <section className="border-b border-[#2A2A33] bg-[#0A0A0F] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="rounded-2xl border border-[#2A2A33] bg-[#1A1A22] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00D4FF]">Compatibility and Setup</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">Built to feel simple, clear, and ready to use</h2>
              <p className="mt-4 max-w-3xl text-[#B0B3B8]">
                StreamStickPro is designed for buyers who want fewer moving parts, faster setup, and clearer next steps. Choose service only, choose a device with Reloaded Fire TV, or choose a bundle and follow one guided path.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["Fire TV Stick", "Onn Google TV", "Android boxes", "Roku app path", "Smart TV support"].map((item) => (
                  <span key={item} className="rounded-full border border-[#2A2A33] bg-white/5 px-4 py-2 text-sm font-medium text-white">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/setup">
                  <span className="inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-xl bg-[#00D4FF] px-6 py-3 text-sm font-semibold text-[#0A0A0F] transition-all hover:bg-[#10F7BE]">
                    View Setup Guides
                  </span>
                </Link>
                <Link href="/iptv">
                  <span className="inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-xl border border-[#00D4FF] px-6 py-3 text-sm font-semibold text-[#00D4FF] transition-all hover:border-[#10F7BE] hover:text-[#10F7BE]">
                    Explore IPTV Access
                  </span>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-[#2A2A33] bg-[#1A1A22] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#10F7BE]">Support Promise</p>
              <div className="mt-4 space-y-4">
                {[
                  "Instant credentials and clear next-step guidance after checkout",
                  "Beginner-friendly tutorial flow instead of scattered DIY instructions",
                  "Cleaner all-in-one experience instead of bouncing between random apps",
                  "Responsive support path when customers need help",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10F7BE]" />
                    <p className="text-[#B0B3B8]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-[#2A2A33] bg-[#0A0A0F] p-4">
                <p className="text-sm font-semibold text-white">Related guides</p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <Link href="/bundles"><span className="cursor-pointer text-[#00D4FF] hover:text-[#10F7BE]">Device + IPTV bundles</span></Link>
                  <span className="text-[#2A2A33]">|</span>
                  <Link href="/setup-firestick"><span className="cursor-pointer text-[#00D4FF] hover:text-[#10F7BE]">Firestick setup</span></Link>
                  <span className="text-[#2A2A33]">|</span>
                  <Link href="/setup-onn"><span className="cursor-pointer text-[#00D4FF] hover:text-[#10F7BE]">Onn setup</span></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* From Our Blog Section */}
      <section className="border-b border-[#2A2A33] bg-gradient-to-b from-[#0A0A0F] to-[#1A1A22] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]">Learn More</span>
            </h2>
            <p className="text-[#B0B3B8] text-lg">Helpful guides that support setup, buying confidence, and smarter streaming decisions.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <a href="/blog/what-is-fully-loaded-streaming-device" className="block" data-testid="blog-card-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-[#1A1A22] border border-[#2A2A33] rounded-2xl p-6 hover:border-[#00D4FF]/50 transition-all cursor-pointer h-full"
              >
                <div className="w-12 h-12 bg-[#00D4FF]/15 rounded-xl flex items-center justify-center mb-4">
                  <Flame className="w-6 h-6 text-[#00D4FF]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">What Is a Streaming Device Setup?</h3>
                <p className="text-gray-200 text-sm mb-4">Learn how device setup works and how to start streaming in about 10 minutes.</p>
                <span className="text-[#00D4FF] text-sm font-semibold flex items-center gap-1">
                  Read More <ChevronRight className="w-4 h-4" />
                </span>
              </motion.div>
            </a>

            <a href="/blog/streaming-vs-cable-cost-comparison" className="block" data-testid="blog-card-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-[#1A1A22] border border-[#2A2A33] rounded-2xl p-6 hover:border-[#00D4FF]/50 transition-all cursor-pointer h-full"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Streaming vs Cable: Complete Cost Guide</h3>
                <p className="text-gray-200 text-sm mb-4">See how much you can save by switching from cable TV to streaming.</p>
                <span className="text-[#00D4FF] text-sm font-semibold flex items-center gap-1">
                  Read More <ChevronRight className="w-4 h-4" />
                </span>
              </motion.div>
            </a>

            <a href="/blog/best-live-tv-sports-streaming-2026" className="block" data-testid="blog-card-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-[#1A1A22] border border-[#2A2A33] rounded-2xl p-6 hover:border-[#00D4FF]/50 transition-all cursor-pointer h-full"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Best Live TV Sports Streaming 2026</h3>
                <p className="text-gray-200 text-sm mb-4">Discover comprehensive sports coverage including NFL, NBA, UFC, and more.</p>
                <span className="text-[#00D4FF] text-sm font-semibold flex items-center gap-1">
                  Read More <ChevronRight className="w-4 h-4" />
                </span>
              </motion.div>
            </a>
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setLocation("/blog")}
              className="border-[#00D4FF]/50 text-[#00D4FF] hover:bg-[#00D4FF]/10"
              data-testid="button-view-all-articles"
            >
              View All Articles <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-white/10 bg-[#1A1A22] py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-white mb-8">Trust StreamStickPro</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 md:justify-center">
            {["247K users trust us", "99.9% uptime", "McAfee Secure", "36hr risk-free trial"].map((item) => (
              <div key={item} className="shrink-0 rounded-full border border-[#2A2A33] bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-800/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {HOMEPAGE_FAQ.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index + 1}`} className="border border-[#2A2A33] rounded-xl px-6 bg-white/5">
                <AccordionTrigger className="text-lg font-semibold text-white hover:text-[#00D4FF]">{item.question}</AccordionTrigger>
                <AccordionContent className="text-[#B0B3B8]">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* WhatsApp Chat Widget - More Prominent */}
      <a 
        href="https://wa.me/15853037381" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 md:bottom-24 right-3 md:right-6 z-[100] group"
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
      <footer className="bg-[#0A0A0F]/95 backdrop-blur-sm text-gray-200 border-t border-[#2A2A33]">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-8 h-8 text-[#00D4FF]" />
                <span className="text-xl font-bold text-white">StreamStickPro</span>
              </div>
              <p className="text-sm text-gray-200 mb-4">
                Premium IPTV subscriptions, devices with Reloaded Fire TV, and cleaner streaming paths built for customers who want clarity, speed, and support.
              </p>
              <div className="flex gap-3">
                <a href="mailto:reloadedfiretvteam@gmail.com" className="w-10 h-10 bg-white/5 hover:bg-[#00D4FF]/15 rounded-lg flex items-center justify-center transition-colors border border-[#2A2A33]" data-testid="link-email" aria-label="Email us">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </a>
              </div>
              <div className="mt-4">
                <a href="mailto:reloadedfiretvteam@gmail.com" className="text-sm text-[#00D4FF] hover:text-[#10F7BE]">
                  reloadedfiretvteam@gmail.com
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/homepage"><span className="hover:text-[#00D4FF] transition-colors cursor-pointer">Home</span></Link></li>
                <li><Link href="/iptv"><span className="hover:text-[#00D4FF] transition-colors cursor-pointer">IPTV</span></Link></li>
                <li><Link href="/devices"><span className="hover:text-[#00D4FF] transition-colors cursor-pointer">Devices</span></Link></li>
                <li><Link href="/bundles"><span className="hover:text-[#00D4FF] transition-colors cursor-pointer">Bundles</span></Link></li>
                <li><Link href="/setup"><span className="hover:text-[#00D4FF] transition-colors cursor-pointer">Setup</span></Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Guides</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/iptv"><span className="hover:text-[#00D4FF] transition-colors">IPTV Subscription</span></Link></li>
                <li><Link href="/devices"><span className="hover:text-[#00D4FF] transition-colors">Reloaded Fire TV Devices</span></Link></li>
                <li><Link href="/bundles"><span className="hover:text-[#00D4FF] transition-colors">Bundles</span></Link></li>
                <li><Link href="/setup"><span className="hover:text-[#00D4FF] transition-colors">Setup Guides</span></Link></li>
                <li><Link href="/faq"><span className="hover:text-[#00D4FF] transition-colors">FAQ</span></Link></li>
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
                <CreditCard className="w-4 h-4 text-[#00D4FF]" />
                Secure checkout powered by Stripe.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Support & Policies</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq"><span className="hover:text-[#00D4FF] transition-colors">FAQ</span></Link></li>
                <li><a href="mailto:reloadedfiretvteam@gmail.com" className="hover:text-[#00D4FF] transition-colors">Contact Us</a></li>
                <li><a href="/terms" className="hover:text-[#00D4FF] transition-colors">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-[#00D4FF] transition-colors">Privacy Policy</a></li>
                <li><a href="/refund" className="hover:text-[#00D4FF] transition-colors">Refund Policy</a></li>
                <li><a href="/admin" className="text-gray-600 hover:text-gray-200 transition-colors text-xs">Admin</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2A2A33] pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-gray-200">
                © {new Date().getFullYear()} StreamStickPro. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                <span className="text-[#10F7BE] font-semibold">SSL Secure</span>
                <span className="text-[#00D4FF] font-semibold">247K Users</span>
                <span className="text-violet-400 font-semibold">McAfee Secure</span>
                <span className="text-gray-300 font-medium">99.9% uptime</span>
                <span className="text-gray-300 font-medium">Professional support</span>
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
