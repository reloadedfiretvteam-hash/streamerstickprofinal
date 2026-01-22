// Build timestamp: 2026-01-13T02:19:49.886Z
import { useEffect, useState } from "react";
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
import { ProductQuickView, QuickViewButton } from "@/components/ProductQuickView";
import { ComparisonTable } from "@/components/ComparisonTable";

const SUPABASE_BASE = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges";
const firestickHdImg = `${SUPABASE_BASE}/OIP_(11)99_1764978938773.jpg`;
const firestick4kImg = `${SUPABASE_BASE}/71+Pvh7WB6L._AC_SL1500__1764978938770.jpg`;
const firestick4kMaxImg = `${SUPABASE_BASE}/71E1te69hZL._AC_SL1500__1764978938773.jpg`;
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
    description: "Premium Live TV streaming plan with 18,000+ live TV channels, 100,000+ movies & series, and comprehensive sports coverage.",
    features: ["18,000+ Live TV Channels", "100,000+ Movies & Series", "Comprehensive Sports Coverage", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "24/7 Customer Support"],
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
    features: ["Extensive Live Content Library", "Thousands of Movies & Shows", "Comprehensive Sports Coverage", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "Priority Customer Support"],
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
    description: "Best value! 6 months of premium Live TV with extensive content library, thousands of movies & shows, and comprehensive sports coverage.",
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
    description: "Ultimate value! Full year of premium Live TV with extensive content library, thousands of movies & shows, and comprehensive sports coverage.",
    features: ["Extensive Live Content Library", "Thousands of Movies & Shows", "Comprehensive Sports Coverage", "4K/HD Quality Streaming", "Works on All Devices", "Instant Email Delivery", "Priority Customer Support", "Maximum Savings"],
    prices: [
      { devices: 1, price: 85, productId: "iptv-1yr-1d" },
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
    price: 130,
    description: 'Full HD streaming device with 1 Year Live TV Plan included. Perfect entry-level option for crystal-clear streaming.',
    features: ['1080p Full HD', '1 Year Live TV Included', '18,000+ Live TV Channels', '100,000+ Movies & Series', 'Comprehensive Sports Coverage', '24/7 Customer Support'],
    image: firestickHdImg,
    category: 'firestick',
    badge: 'STARTER'
  },
  {
    id: 'fs-4k',
    name: 'Fire Stick 4K',
    price: 140,
    description: '4K Ultra HD streaming device with 1 Year Live TV Plan included. Experience stunning picture quality with HDR support.',
    features: ['4K Ultra HD', 'HDR Support', 'Dolby Vision & Atmos', '1 Year Live TV Included', '18,000+ Live TV Channels', '100,000+ Movies & Series', 'Comprehensive Sports Coverage', '24/7 Customer Support'],
    image: firestick4kImg,
    category: 'firestick',
    badge: 'POPULAR',
    popular: true
  },
  {
    id: 'fs-max',
    name: 'Fire Stick 4K Max',
    price: 150,
    description: 'The ultimate streaming experience! 4K Max with Wi-Fi 6E and 1 Year Live TV Plan included. Fastest streaming available.',
    features: ['4K Ultra HD', 'Wi-Fi 6E (Fastest)', 'HDR Support', 'Dolby Vision & Atmos', '1 Year Live TV Included', 'Extensive Content Library', 'Thousands of Movies & Shows', 'Comprehensive Sports Coverage', '24/7 Customer Support'],
    image: firestick4kMaxImg,
    category: 'firestick',
    badge: 'PREMIUM'
  },
];

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
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
    document.title = "Shop - StreamStickPro | Premium Streaming Devices & Live TV Plans";
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

  return (
    <div className="min-h-screen bg-gray-900">
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Premium Products</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Browse our complete collection of pre-configured streaming devices and Live TV plans
            </p>
          </motion.div>

          {/* IPTV Live TV Plans - DISPLAYED FIRST (Most Popular) */}
          <div className="mb-20">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-center flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-blue-500" />
              Premium Live TV Subscriptions
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
                        <p className="text-gray-200 text-xs mb-4 line-clamp-2">{plan.description}</p>

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

          {/* Fire Stick Tier Comparison Table */}
          <div className="mt-16 mb-12">
            <ComparisonTable />
          </div>

          {/* Pre-Loaded Fire Stick Devices - DISPLAYED SECOND */}
          <div className="mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-center flex items-center justify-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              Pre-Loaded Fire Stick Devices
            </h3>
            <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
              Each device comes pre-configured with 1 Year of Live TV service included. Just plug in and start streaming!
            </p>
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

        </div>
      </section>

      {isQuickViewOpen && quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={closeQuickView}
        />
      )}
    </div>
  );
}
