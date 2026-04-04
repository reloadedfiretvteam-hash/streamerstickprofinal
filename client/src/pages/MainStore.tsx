import { useEffect, useState, useRef, useMemo } from "react";
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
import { SportsCarousel } from "@/components/SportsCarousel";
import { ExitPopup } from "@/components/ExitPopup";
import { DemoVideo } from "@/components/DemoVideo";
import { FreeTrial } from "@/components/FreeTrial";
import { TrustBadges, PaymentBadges, GuaranteeBadge } from "@/components/TrustBadges";
import { TrustStats } from "@/components/SocialProof";
import { ChannelLogos } from "@/components/ChannelLogos";
import { IPTVMediaPlayersSection } from "@/components/IPTVMediaPlayersSection";
import { SavingsCalculator } from "@/components/SavingsCalculator";
import { StickyMobileCTA, ScrollToTopButton } from "@/components/StickyMobileCTA";
import { SEOSchema, ServiceSchema, ItemListSchema } from "@/components/SEOSchema";
import { setPageMeta, shopProductUrl } from "@/lib/seo";
import { ProductQuickView } from "@/components/ProductQuickView";
import { QuickViewButton } from "@/components/QuickViewButton";
import { MobileNav } from "@/components/MobileNav";
import { ComparisonTable } from "@/components/ComparisonTable";
import { FloatingCTA } from "@/components/FloatingCTA";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import SupportMessageBox from "@/components/SupportMessageBox";
import { trackVpnClick } from "@/lib/vpn-tracking";
import { SitePromotionBanner } from "@/components/SitePromotionBanner";
import type { Product as StoreCartProduct } from "@/lib/store";

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
  "Stable streaming quality",
  "Regular Updates",
  "M3U Delivered Instantly",
  "24/7 Support"
];

interface Product {
  id: string;
  name: string;
  /** What the customer pays (USD), after sale if active. */
  price: number;
  /** List price when on sale (USD), for strikethrough in UI. */
  regularListPrice?: number;
  /** Admin-set ribbon (per-product promo); separate from site-wide popup. */
  cardPromoLabel?: string | null;
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
    setPageMeta({
      title: "IPTV Subscriptions Loaded Firesticks Onn VPN | StreamStickPro",
      description:
        "StreamStickPro: IPTV subscriptions, loaded Firesticks, ONN Google TV, and Surfshark VPN for ISP throttling. 36-hour trial, 18K+ channels, McAfee Secure, 99.9% uptime.",
      path: "/",
      keywords:
        "IPTV subscription, loaded Firestick, Onn device, Surfshark VPN IPTV, ISP throttling VPN",
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

          const regularCents = parseInt(p.price?.toString() || '0', 10);
          const saleRaw = p.salePrice ?? p.sale_price;
          const saleCents =
            saleRaw != null && saleRaw !== ''
              ? parseInt(String(saleRaw), 10)
              : NaN;
          const onSale =
            Number.isFinite(saleCents) &&
            saleCents > 0 &&
            saleCents < regularCents;
          const effectiveCents = onSale ? saleCents : regularCents;
          const priceInDollars = effectiveCents / 100;

          return {
            id: p.id,
            name: p.name,
            price: priceInDollars,
            regularListPrice: onSale ? regularCents / 100 : undefined,
            cardPromoLabel: p.cardPromoLabel ?? p.card_promo_label ?? null,
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

  // WebSite + Organization schema: only in index.html to avoid duplicate structured data (GSC).

  // Schema-only description: never output "Real product mapped to..." (internal placeholder from DB/seed)
  const getSchemaDescription = (product: Product): string => {
    if (!product.description?.startsWith("Real product mapped to")) return product.description;
    if (product.category === "iptv") {
      return `Premium Live TV plan: ${product.name}. 18,000+ live channels, 100,000+ movies and series, sports and PPV. Multi-device options. StreamStickPro.`;
    }
    return `${product.name} with 1 year Live TV included, plus setup guidance and support. 18,000+ channels, 100,000+ movies and series. StreamStickPro.`;
  };

  const eliteHomeFaqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "IPTV subscription vs loaded device?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "IPTV = streaming service only. Device = hardware WITH 1-year Reloaded Fire TV included.",
        },
      },
      {
        "@type": "Question",
        name: "Firestick/Onn include subscription?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Every device ships with 1-year Reloaded Fire TV subscription.",
        },
      },
      {
        "@type": "Question",
        name: "Why Surfshark VPN?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your ISP detects IPTV streaming and throttles speed (buffering). VPN encrypts traffic so ISP can't throttle. Privacy bonus.",
        },
      },
      {
        "@type": "Question",
        name: "36hr trial details?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Full IPTV access. No card upfront. Cancel anytime.",
        },
      },
      {
        "@type": "Question",
        name: "Setup process?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "IPTV: 60 seconds login. Devices: plug & play. VPN: 2-minute app install.",
        },
      },
      {
        "@type": "Question",
        name: "Buffering common?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ISP throttling causes 90% of buffering. Surfshark VPN fixes it.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] via-[#12121a] to-[#1A1A22] text-white font-sans selection:bg-[#00D4FF] selection:text-[#0A0A0F] pb-32 md:pb-20 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `url(${heroImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(0,212,255,0.18) 0%, transparent 55%), linear-gradient(to bottom, #0A0A0F 0%, #1A1A22 100%)",
          }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eliteHomeFaqLd) }} />
      {/* Organization/WebSite/Store: index.html. One ItemList via ItemListSchema below (shop URLs). */}

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
        description="Fire Stick device options and IPTV subscription plans"
        items={products.slice(0, 6).map(p => ({
          name: p.name,
          description: getSchemaDescription(p),
          url: shopProductUrl(p.id),
          image: p.image,
          price: p.price
        }))}
      />
      
      {/* Navigation - Elite Glassmorphism Design */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0A0F]/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]" aria-label="Main navigation">
        <div className="container mx-auto px-4 h-16 md:h-[72px] flex items-center justify-between">
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
          
          <div className="flex items-center gap-2">
            <Link href="/iptv-services"><span className="hidden lg:inline px-2 py-1.5 text-sm text-[#B0B3B8] hover:text-[#00D4FF] hover:bg-white/5 rounded font-medium">IPTV</span></Link>
            <Link href="/vpn">
              <span
                className="hidden lg:inline px-2 py-1.5 text-sm text-[#0DD9D2] hover:text-white hover:bg-white/5 rounded font-medium"
                onClick={() => trackVpnClick({ source: "/", placement: "header_vpn_link" })}
              >
                VPN
              </span>
            </Link>
            <Link href="/iptv-firestick"><span className="hidden lg:inline px-2 py-1.5 text-sm text-[#B0B3B8] hover:text-white hover:bg-white/5 rounded font-medium">Firestick</span></Link>
            <Link href="/firestick-devices"><span className="hidden lg:inline px-2 py-1.5 text-sm text-[#B0B3B8] hover:text-white hover:bg-white/5 rounded font-medium">Devices</span></Link>
            <Link href="/iptv-media-players"><span className="hidden xl:inline px-2 py-1.5 text-sm text-[#B0B3B8] hover:text-white hover:bg-white/5 rounded font-medium">Media</span></Link>
            <Link href="/tutorials"><span className="hidden xl:inline px-2 py-1.5 text-sm text-[#B0B3B8] hover:text-white hover:bg-white/5 rounded font-medium">Tutorials</span></Link>
            <Link href="/locations"><span className="hidden xl:inline px-2 py-1.5 text-sm text-[#B0B3B8] hover:text-white hover:bg-white/5 rounded font-medium">Locations</span></Link>
            <Button variant="ghost" className="hidden md:flex text-[#B0B3B8] hover:text-white hover:bg-white/5 font-medium" onClick={scrollToAbout} data-testid="nav-how-it-works" aria-label="Scroll to How It Works section">How It Works</Button>
            <Button variant="ghost" className="hidden md:flex text-[#B0B3B8] hover:text-white hover:bg-white/5 font-medium" onClick={scrollToShop} data-testid="nav-shop" aria-label="Scroll to Shop section">Shop</Button>
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
      {/* Elite hero — full viewport, vision copy */}
      <section
        ref={heroRef}
        className="relative text-white overflow-hidden min-h-[100svh] flex flex-col justify-center z-10 py-16 md:py-24 lg:py-32"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9nPjwvc3ZnPg==')] opacity-30 pointer-events-none" aria-hidden />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-white mb-6"
            >
              StreamStickPro IPTV Subscriptions &amp; Loaded Devices
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-lg sm:text-xl md:text-2xl text-[#B0B3B8] font-semibold mb-4"
            >
              36 Hour Free Trial - 18K+ Channels Live Now
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-sm sm:text-base text-[#FAD02C]/90 font-medium mb-10 md:mb-12"
            >
              247K Users • 99.9% Uptime • McAfee Secure
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10"
            >
              <Link href="/36hr-trial">
                <span className="flex items-center justify-center min-h-[72px] rounded-2xl font-black text-base sm:text-lg text-[#0A0A0F] bg-[#00D4FF] hover:bg-[#33ddff] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-[#00D4FF]/50 cursor-pointer transition-transform hover:scale-[1.02]">
                  START 36HR IPTV TRIAL
                </span>
              </Link>
              <Link href="/devices">
                <span className="flex items-center justify-center min-h-[72px] rounded-2xl font-black text-base sm:text-lg text-[#0A0A0F] bg-[#FAD02C] hover:bg-[#fce35c] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-[#FAD02C]/40 cursor-pointer transition-transform hover:scale-[1.02]">
                  SHOP LOADED FIRESTICKS
                </span>
              </Link>
              <Link href="/onn">
                <span className="flex items-center justify-center min-h-[72px] rounded-2xl font-black text-base sm:text-lg text-white bg-[#7C3AED] hover:bg-[#8b4ff5] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-[#7C3AED]/50 cursor-pointer transition-transform hover:scale-[1.02]">
                  ONN GOOGLE TV DEVICES
                </span>
              </Link>
              <Link href="/vpn">
                <span
                  className="flex items-center justify-center min-h-[72px] rounded-2xl font-black text-base sm:text-lg text-[#0A0A0F] bg-[#0DD9D2] ring-2 ring-[#0DD9D2] ring-offset-2 ring-offset-[#0A0A0F] hover:bg-[#2ee8e0] shadow-[0_20px_60px_rgba(13,217,210,0.25)] cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => trackVpnClick({ source: "/", placement: "hero_vpn_cta" })}
                >
                  GET SURFSHARK VPN
                </span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-[#B0B3B8]"
            >
              {["Visa", "Mastercard", "Amex", "Discover", "Apple Pay", "Google Pay", "Link"].map((label) => (
                <span key={label} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 font-semibold">
                  {label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1A1A22] to-transparent pointer-events-none" aria-hidden />
      </section>

      {/* 4 product cards — 2×2 desktop */}
      <section className="py-16 md:py-24 lg:py-32 border-t border-white/5 bg-[#0A0A0F]/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            {/* Card 1 IPTV — cyan */}
            <div className="rounded-2xl p-8 border border-[#00D4FF]/35 bg-gradient-to-br from-[#00D4FF]/10 to-transparent shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col">
              <h2 className="text-2xl font-black text-[#00D4FF] mb-3">IPTV Subscriptions</h2>
              <p className="text-[#B0B3B8] leading-relaxed mb-6 flex-1">
                Get premium IPTV streaming service with 18K+ live channels, 60K+ movies, 15K+ series instantly.
              </p>
              <ul className="space-y-2 text-[#FFFFFF] text-sm mb-8">
                {["All-in-one app login", "Multi-device support", "36hr risk-free trial"].map((t) => (
                  <li key={t} className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/36hr-trial">
                <span className="inline-flex items-center justify-center w-full min-h-[56px] rounded-2xl bg-[#00D4FF] text-[#0A0A0F] font-black hover:bg-[#33ddff] cursor-pointer">
                  START 36HR IPTV TRIAL
                </span>
              </Link>
            </div>
            {/* Card 2 Firesticks — gold */}
            <div className="rounded-2xl p-8 border border-[#FAD02C]/35 bg-gradient-to-br from-[#FAD02C]/10 to-transparent shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col">
              <h2 className="text-2xl font-black text-[#FAD02C] mb-3">Loaded Firesticks</h2>
              <p className="text-[#B0B3B8] leading-relaxed mb-6 flex-1">
                Firestick 4K ships fully loaded and ready-to-use with 1-year Reloaded Fire TV subscription included.
              </p>
              <ul className="space-y-2 text-[#FFFFFF] text-sm mb-8">
                {["Pre-installed apps", "Zero setup required", "Perfect for beginners"].map((t) => (
                  <li key={t} className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-[#FAD02C] shrink-0 mt-0.5" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/devices">
                <span className="inline-flex items-center justify-center w-full min-h-[56px] rounded-2xl bg-[#FAD02C] text-[#0A0A0F] font-black hover:bg-[#fce35c] cursor-pointer">
                  SHOP LOADED FIRESTICKS
                </span>
              </Link>
            </div>
            {/* Card 3 ONN — violet */}
            <div className="rounded-2xl p-8 border border-[#7C3AED]/35 bg-gradient-to-br from-[#7C3AED]/12 to-transparent shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col">
              <h2 className="text-2xl font-black text-[#7C3AED] mb-3">Onn Google TV Devices</h2>
              <p className="text-[#B0B3B8] leading-relaxed mb-6 flex-1">
                Onn Google TV devices pre-configured for streaming. 1-year Reloaded Fire TV service included.
              </p>
              <ul className="space-y-2 text-[#FFFFFF] text-sm mb-8">
                {["Walmart Onn 4K ready", "Easy plug & play", "Budget streaming power"].map((t) => (
                  <li key={t} className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/onn">
                <span className="inline-flex items-center justify-center w-full min-h-[56px] rounded-2xl bg-[#7C3AED] text-white font-black hover:bg-[#8b4ff5] cursor-pointer">
                  ONN GOOGLE TV DEVICES
                </span>
              </Link>
            </div>
            {/* Card 4 VPN — teal */}
            <div className="rounded-2xl p-8 border-2 border-[#0DD9D2]/50 bg-gradient-to-br from-[#0DD9D2]/12 to-transparent shadow-[0_20px_60px_rgba(13,217,210,0.12)] flex flex-col ring-1 ring-[#0DD9D2]/20">
              <h2 className="text-2xl font-black text-[#0DD9D2] mb-3">Surfshark VPN Protection</h2>
              <p className="text-[#B0B3B8] leading-relaxed mb-6 flex-1">
                Essential VPN companion stops ISP throttling, fixes buffering, protects privacy.
              </p>
              <ul className="space-y-2 text-[#FFFFFF] text-sm mb-8">
                {["Hides IPTV from ISP", "Unthrottles 4K streams", "Encrypts all traffic", "Surfshark: Unlimited devices"].map((t) => (
                  <li key={t} className="flex gap-2 items-start">
                    <Check className="w-4 h-4 text-[#0DD9D2] shrink-0 mt-0.5" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/vpn">
                <span
                  className="inline-flex items-center justify-center w-full min-h-[56px] rounded-2xl bg-[#0DD9D2] text-[#0A0A0F] font-black hover:bg-[#2ee8e0] cursor-pointer"
                  onClick={() => trackVpnClick({ source: "/", placement: "product_grid_vpn_cta" })}
                >
                  GET SURFSHARK VPN
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Advantage proof — cyan highlight */}
      <section className="py-12 md:py-16 lg:py-24 border-y border-[#00D4FF]/25 bg-[rgba(0,212,255,0.06)]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-8">Clear Advantages</h2>
          <ul className="text-left max-w-2xl mx-auto space-y-4 text-[#B0B3B8]">
            {[
              "Beats IPTVStronger: 36hr trial (vs 24hr)",
              "Beats TroyPoint: Full Onn/Roku support",
              "Devices include 1-year service",
              "VPN prevents ISP buffering issues",
            ].map((line) => (
              <li key={line} className="flex gap-3 items-start text-base md:text-lg">
                <Check className="w-6 h-6 text-[#00D4FF] shrink-0" aria-hidden />
                <span className="text-white">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-8 md:py-10 bg-[#1A1A22]/80 border-b border-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm md:text-base text-[#FAD02C]/85 font-medium tracking-wide">
            247K users • 99.9% uptime • McAfee Secure • 18K+ channels live now
          </p>
        </div>
      </section>

      {/* Essential FAQ */}
      <section id="faq" className="py-16 md:py-24 lg:py-32 bg-[#0A0A0F]/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-10">Essential FAQ</h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="e1" className="border border-white/10 rounded-2xl px-4 md:px-6 bg-[#1A1A22]/50">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-white hover:text-[#00D4FF]">
                IPTV subscription vs loaded device?
              </AccordionTrigger>
              <AccordionContent className="text-[#B0B3B8] pb-4">
                IPTV = streaming service only. Device = hardware WITH 1-year Reloaded Fire TV included.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="e2" className="border border-white/10 rounded-2xl px-4 md:px-6 bg-[#1A1A22]/50">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-white hover:text-[#00D4FF]">
                Firestick/Onn include subscription?
              </AccordionTrigger>
              <AccordionContent className="text-[#B0B3B8] pb-4">
                Yes. Every device ships with 1-year Reloaded Fire TV subscription.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="e3" className="border border-white/10 rounded-2xl px-4 md:px-6 bg-[#1A1A22]/50">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-white hover:text-[#00D4FF]">
                Why Surfshark VPN?
              </AccordionTrigger>
              <AccordionContent className="text-[#B0B3B8] pb-4">
                Your ISP detects IPTV streaming and throttles speed (buffering). VPN encrypts traffic so ISP can&apos;t throttle. Privacy bonus.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="e4" className="border border-white/10 rounded-2xl px-4 md:px-6 bg-[#1A1A22]/50">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-white hover:text-[#00D4FF]">
                36hr trial details?
              </AccordionTrigger>
              <AccordionContent className="text-[#B0B3B8] pb-4">
                Full IPTV access. No card upfront. Cancel anytime.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="e5" className="border border-white/10 rounded-2xl px-4 md:px-6 bg-[#1A1A22]/50">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-white hover:text-[#00D4FF]">
                Setup process?
              </AccordionTrigger>
              <AccordionContent className="text-[#B0B3B8] pb-4">
                IPTV: 60 seconds login. Devices: plug &amp; play. VPN: 2-minute app install.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="e6" className="border border-white/10 rounded-2xl px-4 md:px-6 bg-[#1A1A22]/50">
              <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-white hover:text-[#00D4FF]">
                Buffering common?
              </AccordionTrigger>
              <AccordionContent className="text-[#B0B3B8] pb-4">
                ISP throttling causes 90% of buffering. Surfshark VPN fixes it.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Responsible disclaimer */}
      <section className="py-10 md:py-12 px-4 border-t border-white/5 bg-[#0A0A0F]">
        <div className="container mx-auto max-w-4xl">
          <p className="text-sm md:text-base text-[#B0B3B8]/90 leading-relaxed text-center">
            Optimal performance requires 25Mbps+ internet. ISP throttling common (VPN recommended). Devices include 1-year service only. Users responsible for local laws/platform compliance. Support available 24/7.
          </p>
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
            
            {/* Free Trial Box */}
            <FreeTrial />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {iptvPricingMatrix.map((plan, index) => {
                const deviceCount = selectedDevices[plan.duration];
                const selectedPrice = plan.prices.find(p => p.devices === deviceCount) || plan.prices[0];
                const iptvDb = products.find((pp) => pp.id === selectedPrice.productId);
                const linePriceDollars = iptvDb?.price ?? selectedPrice.price;
                const iptvRegular = iptvDb?.regularListPrice;
                const iptvPromo = iptvDb?.cardPromoLabel;
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
                        {iptvPromo ? (
                          <div className="absolute top-4 left-4 z-20 max-w-[min(180px,70%)] bg-amber-500 text-black px-2 py-1 rounded-full font-bold text-xs shadow-lg leading-tight">
                            {iptvPromo}
                          </div>
                        ) : null}
                        {(plan.duration === "6mo" || plan.duration === "1yr") && (
                          <div className={`absolute ${iptvPromo ? 'top-14' : 'top-4'} left-4 z-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full font-bold text-xs shadow-lg`}>
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
                          <div className="flex items-baseline gap-2 flex-wrap">
                            {iptvRegular != null ? (
                              <span className="text-lg text-gray-500 line-through decoration-gray-500">
                                ${iptvRegular.toFixed(2)}
                              </span>
                            ) : null}
                            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400" data-testid={`text-price-iptv-${plan.duration}`}>
                              ${linePriceDollars.toFixed(2)}
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
                            price: linePriceDollars,
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
                      {product.cardPromoLabel ? (
                        <div className="absolute top-4 left-4 z-20 max-w-[min(200px,55%)] bg-amber-500 text-black px-3 py-1 rounded-full font-bold text-xs shadow-lg leading-tight">
                          {product.cardPromoLabel}
                        </div>
                      ) : null}
                      {product.id === 'fs-4k' && (
                        <div className={`absolute ${product.cardPromoLabel ? 'top-14' : 'top-4'} left-4 z-20 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg`}>
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
                              <div className="flex items-baseline gap-2 flex-wrap">
                                {product.regularListPrice != null ? (
                                  <span className="text-xl text-gray-500 line-through decoration-gray-500">
                                    ${(product.regularListPrice * qty).toFixed(2)}
                                  </span>
                                ) : null}
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
          <SportsCarousel />
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
          <TrustStats />
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
      <IPTVMediaPlayersSection />

      {/* Tutorials: Adding IPTV Media Players to Your Devices */}
      <section id="tutorials" className="py-16 bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
              Adding IPTV Media Players to Your Devices
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Step-by-step video tutorials: install IPTV media player on Fire Stick and ONN Google TV.
            </p>
            <Link href="/tutorials">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg gap-2">
                <Play className="w-5 h-5" aria-hidden="true" />
                Watch Tutorials
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
                description: "Your device arrives with credentials and clear setup guidance so you can get started quickly.",
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
                description: "Clear setup guidance with no guesswork. Start quickly with step-by-step support.",
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

      {/* Customer Support Email Banner - Fixed at bottom - More Prominent */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 text-white py-4 px-4 z-[99] border-t-4 border-orange-300/50 shadow-2xl">
        <div className="container mx-auto flex items-center justify-center gap-4 flex-wrap">
          <Mail className="w-6 h-6 flex-shrink-0" />
          <span className="text-base md:text-lg font-semibold">Need Help? Contact us:</span>
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="font-bold text-white hover:text-orange-100 underline decoration-2 underline-offset-2 transition-colors text-base md:text-lg cursor-pointer bg-transparent border-none p-0 hover:bg-white/10 rounded px-2 py-1"
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
                <li>
                  <Link href="/vpn">
                    <span
                      className="hover:text-[#0DD9D2] transition-colors cursor-pointer"
                      onClick={() => trackVpnClick({ source: "/", placement: "footer_vpn_link" })}
                    >
                      Surfshark VPN
                    </span>
                  </Link>
                </li>
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

      <SitePromotionBanner
        variant="live"
        catalogProducts={products.map(
          (p): StoreCartProduct => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            category: p.category,
            description: p.description,
          })
        )}
        onClaim={(promo, p) => {
          addItemWithQuantity(p, 1, promo.displayPriceDollars, { sitePromotion: true });
          openCart();
        }}
      />

      {/* Exit Intent Popup */}
      <ExitPopup />

      {/* Floating CTA */}
      <FloatingCTA onContact={openSupport} onFreeTrial={scrollToFreeTrial} />

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
