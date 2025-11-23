import { Check, Flame, Star, Zap } from 'lucide-react';

interface ProductsProps {
  onSelectProduct?: (productId: string, amount: number) => void;
}

export default function FireStickProducts({ onSelectProduct }: ProductsProps) {
  const products = [
    {
      id: 'firestick-hd',
      name: 'Fire Stick HD',
      price: 140.00,
      image: 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%20hd.jpg',
      badge: 'HD QUALITY',
      popular: false,
      features: [
        'Brand New Amazon Fire Stick HD',
        '18,000+ Live TV Channels',
        '60,000+ Movies & TV Shows',
        'All Sports Channels & PPV Events',
        'HD Quality',
        'Pre-Configured & Ready to Use',
        'Plug & Play Setup (5 Minutes)',
        '1 Year Premium IPTV Included',
        'Free Shipping',
        '24/7 Support'
      ]
    },
    {
      id: 'firestick-4k',
      name: 'Fire Stick 4K',
      price: 150.00,
      image: 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k.jpg',
      badge: 'BEST VALUE',
      popular: true,
      features: [
        'Brand New Amazon Fire Stick 4K',
        '18,000+ Live TV Channels',
        '60,000+ Movies & TV Shows',
        'All Sports Channels & PPV Events',
        '4K Ultra HD Quality',
        'Pre-Configured & Ready to Use',
        'Plug & Play Setup (5 Minutes)',
        '1 Year Premium IPTV Included',
        'Priority Customer Support',
        'Free Shipping'
      ]
    },
    {
      id: 'firestick-4k-max',
      name: 'Fire Stick 4K Max',
      price: 160.00,
      image: 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k%20max.jpg',
      badge: 'PREMIUM',
      popular: false,
      features: [
        'Brand New Amazon Fire Stick 4K Max',
        '18,000+ Live TV Channels',
        '60,000+ Movies & TV Shows',
        'All Sports Channels & PPV Events',
        '4K Ultra HD Quality',
        'Fastest Performance',
        'Pre-Configured & Ready to Use',
        'Plug & Play Setup (5 Minutes)',
        '1 Year Premium IPTV Included',
        'VIP Customer Support',
        'Free Shipping'
      ]
    }
  ];

  return (
    <section id="products" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Dramatic Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-16 animate-fade-in">
          <div className="absolute inset-0">
            <img
              src="/Screenshot_20251102-131641.png"
              alt="Fire Stick Breaking Free"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          </div>

          <div className="relative z-10 px-8 md:px-16 py-16 md:py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-orange-500/30 backdrop-blur-sm border border-orange-400/50 rounded-full px-6 py-2 mb-6">
                <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                <span className="text-sm font-bold tracking-wide">BREAK FREE FROM CABLE</span>
              </div>


              <div className="flex flex-wrap gap-4 text-sm md:text-base">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>18,000+ Channels</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>60,000+ Movies</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>All Sports & PPV</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center mb-16 animate-fade-in">
          <h3 className="text-3xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Fire Stick</span>
          </h3>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Every device comes fully loaded and ready to stream in under 5 minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up ${
                product.popular ? 'ring-4 ring-orange-500 scale-105 shadow-2xl shadow-orange-500/50' : ''
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {product.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce">
                    <Star className="w-4 h-4 fill-current" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="relative h-56 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                  {product.badge}
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{product.name}</h3>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-orange-400">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-blue-200 text-sm mt-2">
                    Includes 1 Year IPTV Subscription
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onSelectProduct) {
                      onSelectProduct(product.id, product.price);
                    } else {
                      // Add to cart and go to shop
                      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
                      const existingItem = cart.find((item: any) => item.product.id === product.id);
                      if (existingItem) {
                        existingItem.quantity += 1;
                      } else {
                        cart.push({
                          product: {
                            id: product.id,
                            name: product.name,
                            price: product.price.toString(),
                            image_url: product.image
                          },
                          quantity: 1
                        });
                      }
                      localStorage.setItem('cart', JSON.stringify(cart));
                      window.location.href = '/shop';
                    }
                  }}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 mb-6 flex items-center justify-center gap-2 ${
                    product.popular
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/50'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  Order Now
                </button>

                <div className="space-y-3">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5 group-hover:scale-125 transition-transform" />
                      <span className="text-blue-100 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center animate-fade-in animation-delay-800">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto border border-white/20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">Instant Setup</h4>
                <p className="text-blue-200 text-sm">Plug in and start watching in under 5 minutes</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">Premium Quality</h4>
                <p className="text-blue-200 text-sm">4K streams with anti-freeze technology</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">Lifetime Support</h4>
                <p className="text-blue-200 text-sm">24/7 customer service whenever you need help</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-blue-200">
          ✓ Ships same day | ✓ Free shipping on all orders | ✓ 7-day money-back guarantee
        </p>
      </div>
    </section>
  );
}
