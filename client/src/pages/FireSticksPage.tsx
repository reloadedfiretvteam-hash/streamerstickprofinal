import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShoppingCart, Flame, Check, Star, Gift, DollarSign, Heart, ArrowLeft } from "lucide-react";
import { useCart, useWishlist } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOSchema } from "@/components/SEOSchema";

import firestickHdImg from "@assets/OIP_(11)99_1764978938773.jpg";
import firestick4kImg from "@assets/71+Pvh7WB6L._AC_SL1500__1764978938770.jpg";
import firestick4kMaxImg from "@assets/71E1te69hZL._AC_SL1500__1764978938773.jpg";

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
}

const firestickProducts: Product[] = [
  {
    id: "fs-hd",
    name: "Fire Stick HD - Jailbroken & Ready",
    price: 119,
    description: "Premium jailbroken Fire Stick HD with 1 Year IPTV included. Get instant access to 18,000+ live TV channels, 60,000+ movies & TV shows, and all sports leagues including NFL, NBA, UFC, and PPV events. You'll receive your login credentials, an easy 10-minute setup tutorial, and 24/7 customer support.",
    features: ["1080p Full HD Resolution", "18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "4K/HD Quality Streaming", "Works on Multiple Devices", "Instant Credential Delivery", "10-Minute Easy Setup", "24/7 Customer Support"],
    image: firestickHdImg,
    category: "firestick",
    badge: "STARTER"
  },
  {
    id: "fs-4k",
    name: "Fire Stick 4K - Jailbroken & Ready",
    price: 127.50,
    description: "Best-selling jailbroken Fire Stick 4K with Dolby Vision & 1 Year premium IPTV subscription included. Enjoy 18,000+ live TV channels, 60,000+ movies & TV shows in stunning 4K quality. Watch all major sports - NFL, NBA, UFC, and PPV events. You'll receive instant credentials, easy setup tutorial, and 24/7 support.",
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
    description: "Ultimate jailbroken Fire Stick 4K Max with Wi-Fi 6E and 1 Year premium IPTV subscription. Experience 18,000+ live TV channels, 60,000+ movies & TV shows, and all major sports in breathtaking 4K with Dolby Atmos sound. Includes login credentials, quick setup guide, and priority 24/7 customer support.",
    features: ["4K Ultra HD with Wi-Fi 6E", "Dolby Vision, Atmos & HDR10+", "18,000+ Live TV Channels", "60,000+ Movies & TV Shows", "All Sports & PPV Events", "Premium IPTV Included", "Works on Multiple Devices", "Instant Credential Delivery", "10-Minute Easy Setup", "Priority 24/7 Support"],
    image: firestick4kMaxImg,
    category: "firestick",
    badge: "PREMIUM"
  }
];

export default function FireSticksPage() {
  const [, setLocation] = useLocation();
  const { addItem, addItemWithQuantity } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [firestickQuantities, setFirestickQuantities] = useState<Record<string, number>>({
    "fs-hd": 1,
    "fs-4k": 1,
    "fs-max": 1,
  });

  useEffect(() => {
    document.title = "Jailbroken Fire Sticks | StreamStickPro";
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
    window.scrollTo(0, 0);
  }, []);

  const getFirestickDiscount = (qty: number) => {
    if (qty >= 5) return { percent: 20, label: "20% OFF" };
    if (qty >= 3) return { percent: 15, label: "15% OFF" };
    if (qty >= 2) return { percent: 10, label: "10% OFF" };
    return { percent: 0, label: "" };
  };

  const calculateFirestickPrice = (basePrice: number, qty: number) => {
    const discount = getFirestickDiscount(qty);
    const unitPrice = basePrice * (1 - discount.percent / 100);
    const totalPrice = unitPrice * qty;
    const savings = (basePrice * qty) - totalPrice;
    return { unitPrice, totalPrice, savings };
  };

  const toggleWishlistItem = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product as any);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SEOSchema 
        title="Jailbroken Fire Sticks | StreamStickPro"
        description="Browse our selection of jailbroken Fire Sticks with 1 Year IPTV included. HD, 4K, and 4K Max models. Free shipping, 24/7 support."
        url="https://streamstickpro.com/products/fire-sticks/"
        image="https://streamstickpro.com/opengraph.jpg"
      />

      {/* Navigation Bar */}
      <nav className="border-b border-gray-800 sticky top-0 z-50 bg-gray-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              StreamStickPro
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              Jailbroken Fire Sticks
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Fully configured Fire Sticks with 1 Year IPTV subscription included. 
              You receive a Fire Stick and a step-by-step tutorial by email. 
              10-minute setup with your login credentials. 24/7 support available.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 group ${
                    product.popular 
                      ? 'ring-4 ring-orange-500 scale-105 shadow-2xl shadow-orange-500/50' 
                      : 'hover:shadow-2xl'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${cardGradients[index]}`} />
                  <div className={`absolute inset-0 border-2 ${borderColors[index]} rounded-2xl transition-all duration-500`} />
                  
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
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlistItem(product); }}
                        className={`absolute bottom-4 left-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isInWishlist(product.id) 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                            : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                        }`}
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
                                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
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
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Add {firestickQuantities[product.id] > 1 ? `${firestickQuantities[product.id]} ` : ''}to Cart
                        </button>
                      </div>

                      <div className="space-y-3">
                        {product.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
