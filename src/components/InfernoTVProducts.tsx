import { Check, Flame, Star, Tv } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  features: string[];
  image_url: string;
  main_image?: string;
  is_featured: boolean;
  product_type: string;
}

interface Props {
  onSelectProduct: (productId: string, amount: number) => void;
}

export default function InfernoTVProducts({ onSelectProduct }: Props) {
  const [iptvProducts, setIptvProducts] = useState<Product[]>([]);
  const [firestickProducts, setFirestickProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('real_products')
      .select('*')
      .in('status', ['published', 'publish', 'active'])
      .order('sort_order');

    if (!error && data) {
      const iptv = data.filter((p: any) => p.product_type === 'iptv_subscription');
      const firesticks = data.filter((p: any) => p.product_type === 'firestick_bundle');

      setIptvProducts(iptv as Product[]);
      setFirestickProducts(firesticks as Product[]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-pulse text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gradient-to-br from-gray-900 via-orange-900 to-gray-900">
      {/* INFERNO TV SUBSCRIPTIONS SECTION */}
      <section id="inferno-tv" className="container mx-auto px-4 mb-20">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-6 py-2 mb-6">
            <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            <span className="text-sm font-medium text-white">INFERNO TV SUBSCRIPTIONS</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white animate-slide-up">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Inferno TV</span> Plan
          </h2>

          <p className="text-xl text-orange-100 max-w-3xl mx-auto animate-slide-up animation-delay-200">
            Premium IPTV with 18,000 live channels, 60,000+ movies, and all sports - no cable needed!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {iptvProducts.map((product, index) => (
            <div
              key={product.id}
              className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up ${
                product.is_featured ? 'ring-4 ring-orange-500 scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {product.is_featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 animate-bounce">
                    <Star className="w-4 h-4 fill-current" />
                    BEST VALUE
                  </div>
                </div>
              )}

              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-800 to-blue-900 flex items-center justify-center">
                <img
                  src={product.image_url || product.main_image || 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg'}
                  alt={product.name}
                  className="h-full w-full object-cover transform hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg';
                  }}
                />
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-white">{product.name}</h3>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-orange-400">
                      ${product.price}
                    </span>
                  </div>
                  <p className="text-orange-200 text-sm mt-2">{product.short_description}</p>
                </div>

                <button
                  onClick={() => {
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
                          image_url: product.image_url || product.main_image
                        },
                        quantity: 1
                      });
                    }
                    localStorage.setItem('cart', JSON.stringify(cart));
                    window.location.href = '/shop';
                  }}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 mb-6 flex items-center justify-center gap-2 ${
                    product.is_featured
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/50'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg'
                  }`}
                >
                  <Tv className="w-5 h-5" />
                  Subscribe Now
                </button>

                <div className="space-y-3">
                  {product.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5 group-hover:scale-125 transition-transform" />
                      <span className="text-orange-100 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FIRE STICK BUNDLES SECTION */}
      <section id="firestick-bundles" className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-full px-6 py-2 mb-6">
            <Flame className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-sm font-medium text-white">FIRE STICK BUNDLES</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white animate-slide-up">
            Amazon Fire Stick + <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Full Year Inferno TV</span>
          </h2>

          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-2xl p-6 max-w-4xl mx-auto mb-8 animate-slide-up animation-delay-200">
            <p className="text-xl text-yellow-100 leading-relaxed">
              ⚠️ <strong>NOT like those other "jailbroken" Fire Stick websites!</strong><br />
              No long lengthy tutorials. No hundreds of apps that fail and have broken links.<br />
              <strong className="text-yellow-300">One app does it all.</strong> Daily updates. Full customer support.<br />
              This is the future of streaming!
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {firestickProducts.map((product, index) => (
            <div
              key={product.id}
              className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up ${
                product.is_featured ? 'ring-4 ring-red-500 scale-105 shadow-2xl shadow-red-500/50' : ''
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {product.is_featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce">
                    <Star className="w-4 h-4 fill-current" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                {/* Real Amazon Fire Stick product images from Supabase */}
                <img
                  src={
                    product.image_url || product.main_image || (
                      product.name.includes('4K Max')
                        ? 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k%20max.jpg'
                        : product.name.includes('4K')
                        ? 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k.jpg'
                        : 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%20hd.jpg'
                    )
                  }
                  alt={product.name}
                  className="h-full w-full object-cover transform hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (product.name.includes('4K Max')) {
                      target.src = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k%20max.jpg';
                    } else if (product.name.includes('4K')) {
                      target.src = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k.jpg';
                    } else {
                      target.src = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%20hd.jpg';
                    }
                  }}
                  alt={product.name}
                  className="h-full object-contain transform hover:scale-110 transition-transform duration-500 p-4"
                />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm animate-pulse">
                  $70 VALUE!
                </div>
                {/* Brand badge */}
                <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-lg font-bold text-xs">
                  AMAZON AUTHENTIC
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-white">{product.name}</h3>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-orange-400">
                      ${product.price}
                    </span>
                  </div>
                  <p className="text-green-400 text-sm mt-2 font-semibold">
                    ✓ Includes 1 Full Year of Inferno TV ($70 value)
                  </p>
                </div>

                <button
                  onClick={() => onSelectProduct(product.id, product.price)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 mb-6 flex items-center justify-center gap-2 ${
                    product.is_featured
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/50 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg text-white'
                  }`}
                >
                  <Flame className="w-5 h-5" />
                  Get This Bundle
                </button>

                <div className="space-y-3">
                  {product.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5 group-hover:scale-125 transition-transform" />
                      <span className="text-orange-100 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center animate-fade-in animation-delay-800">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto border border-white/20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-2">📦</div>
                <h4 className="font-bold text-lg mb-2 text-white">Brand New Sealed</h4>
                <p className="text-orange-200 text-sm">100% authentic Amazon devices</p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">⚡</div>
                <h4 className="font-bold text-lg mb-2 text-white">5-Minute Setup</h4>
                <p className="text-orange-200 text-sm">Easy tutorial included</p>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">✓</div>
                <h4 className="font-bold text-lg mb-2 text-white">Full Support</h4>
                <p className="text-orange-200 text-sm">24/7 customer service</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-orange-200">
          ✓ Free shipping | ✓ Same-day processing | ✓ Money-back guarantee
        </p>
      </section>
    </div>
  );
}
