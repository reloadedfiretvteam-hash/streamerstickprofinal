import { useState } from 'react';
import { Check, Sparkles, Zap, Crown, ShoppingCart, Star } from 'lucide-react';

interface PremiumPackage {
  id: string;
  name: string;
  requests: number;
  price: number;
  pricePerRequest: number;
  popular: boolean;
  badge: string;
  features: string[];
}

interface PremiumRequestsPackagesProps {
  onAddToCart: (pkg: PremiumPackage) => void;
}

export default function PremiumRequestsPackages({ onAddToCart }: PremiumRequestsPackagesProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const packages: PremiumPackage[] = [
    {
      id: 'premium-10',
      name: '10 Premium Requests',
      requests: 10,
      price: 4.99,
      pricePerRequest: 0.50,
      popular: false,
      badge: 'STARTER',
      features: [
        '10 Premium Requests',
        'Priority Support',
        'Valid for 30 days',
        'Instant Activation',
      ],
    },
    {
      id: 'premium-25',
      name: '25 Premium Requests',
      requests: 25,
      price: 9.99,
      pricePerRequest: 0.40,
      popular: true,
      badge: 'BEST VALUE',
      features: [
        '25 Premium Requests',
        'Priority Support',
        'Valid for 60 days',
        'Instant Activation',
        '20% Savings',
      ],
    },
    {
      id: 'premium-50',
      name: '50 Premium Requests',
      requests: 50,
      price: 17.99,
      pricePerRequest: 0.36,
      popular: false,
      badge: 'POWER USER',
      features: [
        '50 Premium Requests',
        'VIP Priority Support',
        'Valid for 90 days',
        'Instant Activation',
        '28% Savings',
      ],
    },
    {
      id: 'premium-100',
      name: '100 Premium Requests',
      requests: 100,
      price: 29.99,
      pricePerRequest: 0.30,
      popular: false,
      badge: 'ENTERPRISE',
      features: [
        '100 Premium Requests',
        'VIP Priority Support',
        'Valid for 180 days',
        'Instant Activation',
        '40% Savings',
        'Rollover Unused Requests',
      ],
    },
  ];

  const handleSelect = (pkg: PremiumPackage) => {
    setSelectedPackage(pkg.id);
    onAddToCart(pkg);
  };

  return (
    <section id="premium-requests" className="py-20 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-sm font-medium">PREMIUM REQUESTS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Buy More Premium Requests
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Need more premium requests? Purchase additional request packages to unlock enhanced features and priority processing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                pkg.popular ? 'ring-4 ring-purple-500 scale-105 shadow-2xl shadow-purple-500/50' : ''
              } ${selectedPackage === pkg.id ? 'ring-2 ring-green-500' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <div className="text-center">
                  {pkg.id === 'premium-10' && <Zap className="w-12 h-12 text-white mx-auto mb-1" />}
                  {pkg.id === 'premium-25' && <Sparkles className="w-12 h-12 text-white mx-auto mb-1" />}
                  {pkg.id === 'premium-50' && <Crown className="w-12 h-12 text-white mx-auto mb-1" />}
                  {pkg.id === 'premium-100' && <Crown className="w-12 h-12 text-yellow-300 mx-auto mb-1" />}
                  <span className="text-white font-bold text-2xl">{pkg.requests}</span>
                  <span className="text-white/80 text-sm block">Requests</span>
                </div>
                <div className="absolute top-3 right-3 bg-white/20 text-white px-3 py-1 rounded-full font-bold text-xs">
                  {pkg.badge}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{pkg.name}</h3>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-purple-400">
                      ${pkg.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    ${pkg.pricePerRequest.toFixed(2)} per request
                  </p>
                </div>

                <button
                  onClick={() => handleSelect(pkg)}
                  className={`w-full py-3 rounded-xl font-bold text-base transition-all transform hover:scale-105 mb-4 flex items-center justify-center gap-2 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/50'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 shadow-lg'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>

                <div className="space-y-2">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-3 text-purple-300">
              <Sparkles className="inline w-5 h-5 mr-2" />
              What are Premium Requests?
            </h3>
            <p className="text-gray-300">
              Premium requests give you access to enhanced features, priority processing, and exclusive support. 
              Use them for faster response times, advanced customization options, and priority customer service.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
