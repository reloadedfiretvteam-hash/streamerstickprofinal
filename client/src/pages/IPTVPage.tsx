import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShoppingCart, Flame, Check, Star, ArrowLeft, Tv, Wifi, Play } from "lucide-react";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOSchema } from "@/components/SEOSchema";

import iptvImg from "@assets/OIF_1764979270800.jpg";

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

export default function IPTVPage() {
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const [selectedDevices, setSelectedDevices] = useState<Record<string, number>>({
    "1mo": 1,
    "3mo": 1,
    "6mo": 1,
    "1yr": 1,
  });

  useEffect(() => {
    document.title = "IPTV Subscriptions | StreamStickPro";
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SEOSchema 
        title="IPTV Subscriptions | StreamStickPro"
        description="Premium IPTV plans with 18,000+ live channels, 60,000+ movies & shows, all sports & PPV. Flexible 1-5 device plans. Instant delivery."
        url="https://streamstickpro.com/products/iptv/"
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
              Premium IPTV Subscriptions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Access 18,000+ live TV channels, 60,000+ movies & TV shows, and all major sports leagues.
              You receive your login credentials with a step-by-step tutorial by email. 
              10-minute setup. 24/7 support available. Live chat available.
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <Tv className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">18,000+ Channels</h3>
              <p className="text-gray-400 text-sm">Live TV from around the world including sports, news, entertainment, and more</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <Play className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">60,000+ On-Demand</h3>
              <p className="text-gray-400 text-sm">Massive library of movies and TV shows available anytime</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <Wifi className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-lg font-bold mb-2">All Devices</h3>
              <p className="text-gray-400 text-sm">Works on Fire Sticks, Smart TVs, phones, tablets, and computers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {iptvPricingMatrix.map((plan, planIndex) => (
              <motion.div
                key={plan.duration}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: planIndex * 0.1 }}
                className={`relative rounded-2xl overflow-hidden ${
                  plan.popular 
                    ? 'ring-4 ring-orange-500 shadow-2xl shadow-orange-500/50' 
                    : 'border border-gray-700'
                }`}
              >
                <div className={`absolute inset-0 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-orange-950/60 via-slate-900 to-gray-900'
                    : 'bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900'
                }`} />
                
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce">
                      <Star className="w-4 h-4 fill-current" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="relative z-10 p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-3xl font-bold text-white">{plan.durationLabel}</h3>
                    {!plan.popular && (
                      <Badge className={`${
                        plan.duration === '1yr' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : plan.duration === '6mo'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            : 'bg-gray-600'
                      } text-white`}>
                        {plan.badge}
                      </Badge>
                    )}
                  </div>

                  <p className="text-gray-300 mb-6">{plan.description}</p>

                  {/* Device Selector */}
                  <div className="mb-6">
                    <label className="text-sm text-gray-300 mb-3 block font-semibold">Number of Devices:</label>
                    <div className="grid grid-cols-5 gap-2">
                      {plan.prices.map((priceOption) => (
                        <button
                          key={priceOption.devices}
                          onClick={() => setSelectedDevices(prev => ({ ...prev, [plan.duration]: priceOption.devices }))}
                          className={`py-3 px-2 rounded-lg text-sm font-bold transition-all ${
                            selectedDevices[plan.duration] === priceOption.devices
                              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {priceOption.devices}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="mb-6">
                    {(() => {
                      const selectedOption = plan.prices.find(p => p.devices === selectedDevices[plan.duration]) || plan.prices[0];
                      return (
                        <>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                              ${selectedOption.price}
                            </span>
                            <span className="text-gray-400">/ {plan.durationLabel.toLowerCase()}</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            For {selectedOption.devices} {selectedOption.devices === 1 ? 'device' : 'devices'}
                          </p>
                        </>
                      );
                    })()}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      const selectedOption = plan.prices.find(p => p.devices === selectedDevices[plan.duration]) || plan.prices[0];
                      addItem({
                        id: selectedOption.productId,
                        name: `IPTV ${plan.durationLabel} - ${selectedOption.devices} ${selectedOption.devices === 1 ? 'Device' : 'Devices'}`,
                        price: selectedOption.price,
                        description: plan.description,
                        image: iptvImg,
                        category: 'iptv',
                        period: plan.durationLabel,
                      } as any);
                    }}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/50'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>

                  {/* Features List */}
                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
