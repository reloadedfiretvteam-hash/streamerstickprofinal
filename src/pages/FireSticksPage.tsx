import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Check, Flame, ArrowLeft, Zap } from 'lucide-react';
import { supabase, getStorageUrl } from '../lib/supabase';
import Footer from '../components/Footer';
import ValidatedImage from '../components/ValidatedImage';
import Navigation from '../components/EnhancedNavigation';
import { useCart } from '../context/CartContext';

// Fallback image when all else fails
const FALLBACK_FIRESTICK_IMAGE = 'https://images.pexels.com/photos/5474028/pexels-photo-5474028.jpeg?auto=compress&cs=tinysrgb&w=600';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  sale_price: string;
  main_image: string;
  category: string;
  stock_quantity: number;
  rating: number;
  featured: boolean;
}

export default function FireSticksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, getItemCount } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('real_products')
        .select('*')
        .in('status', ['active', 'publish', 'published'])
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        throw error;
      }
      
      // Filter and process Fire Stick products
      const fireStickProducts = (data || [])
        .filter((product: any) => {
          const name = (product.name || '').toLowerCase();
          const category = (product.category || '').toLowerCase();
          return name.includes('fire stick') || 
                 name.includes('fire tv') || 
                 name.includes('firestick') ||
                 category.includes('fire stick') ||
                 category === 'firestick';
        })
        .map((product: any) => {
          let imageUrl = product.main_image || product.image_url || '';
          
          // Use Supabase storage URLs as fallback for reliability
          if (!imageUrl || imageUrl.includes('placeholder') || imageUrl.includes('pexels')) {
            if (product.name?.toLowerCase().includes('4k max')) {
              imageUrl = getStorageUrl('images', 'firestick 4k max.jpg');
            } else if (product.name?.toLowerCase().includes('4k')) {
              imageUrl = getStorageUrl('images', 'firestick 4k.jpg');
            } else {
              imageUrl = getStorageUrl('images', 'firestick hd.jpg');
            }
          }
          
          return {
            ...product,
            main_image: imageUrl
          };
        });
      
      if (fireStickProducts && fireStickProducts.length > 0) {
        setProducts(fireStickProducts);
      } else {
        setProducts(fallbackProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  const fallbackProducts: Product[] = [
    {
      id: 'firestick-hd',
      name: 'Fire Stick HD - Jailbroken & Ready',
      description: 'Brand New Amazon Fire Stick HD with 1 Year Premium IPTV. Pre-configured with 18,000+ channels, 60,000+ movies. Plug & play - ready in 5 minutes!',
      price: '140.00',
      sale_price: '140.00',
      main_image: getStorageUrl('images', 'firestick hd.jpg'),
      category: 'Fire Stick',
      stock_quantity: 50,
      rating: 5,
      featured: false
    },
    {
      id: 'firestick-4k',
      name: 'Fire Stick 4K - Jailbroken & Ready',
      description: 'Brand New Amazon Fire Stick 4K with 1 Year Premium IPTV. Pre-configured with 18,000+ channels, 60,000+ movies in stunning 4K quality. Best seller!',
      price: '150.00',
      sale_price: '150.00',
      main_image: getStorageUrl('images', 'firestick 4k.jpg'),
      category: 'Fire Stick',
      stock_quantity: 50,
      rating: 5,
      featured: true
    },
    {
      id: 'firestick-4k-max',
      name: 'Fire Stick 4K Max - Jailbroken & Ready',
      description: 'Brand New Amazon Fire Stick 4K Max with 1 Year Premium IPTV. Fastest performance, 4K Ultra HD, pre-configured with all premium content.',
      price: '160.00',
      sale_price: '160.00',
      main_image: getStorageUrl('images', 'firestick 4k max.jpg'),
      category: 'Fire Stick',
      stock_quantity: 50,
      rating: 5,
      featured: false
    }
  ];

  const addToCart = (product: Product) => {
    // Convert to the format expected by CartContext
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.sale_price || product.price),
      type: 'firestick',
      image: product.main_image,
      badge: product.featured ? 'BEST VALUE' : 'STARTER',
      popular: product.featured,
      features: product.description.split(',').map(f => f.trim())
    });
    window.location.href = '/cart';
  };

  const cartItemCount = getItemCount();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl text-white">Loading Fire Stick products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation cartItemCount={cartItemCount} onCartClick={() => window.location.href = '/cart'} />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-8 h-8 text-yellow-300" />
                <h1 className="text-4xl font-bold">Fire Stick Devices</h1>
              </div>
              <p className="text-orange-100">Jailbroken & Ready to Stream - 1 Year IPTV Included</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </a>
              <a
                href="/checkout"
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-all flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart ({cartItemCount})
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>18,000+ Live Channels</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>60,000+ Movies & Shows</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>All Sports & PPV</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>Plug & Play in 5 Minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {products.map(product => (
            <div
              key={product.id}
              className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                product.featured ? 'ring-4 ring-orange-500 scale-105 shadow-2xl shadow-orange-500/50' : ''
              }`}
            >
              {product.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce">
                    <Star className="w-4 h-4 fill-current" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Product Image */}
              <div className="relative h-64 bg-gray-800 overflow-hidden">
                <ValidatedImage
                  src={product.main_image}
                  fallbackSrc={FALLBACK_FIRESTICK_IMAGE}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  minBytes={1000}
                />
              </div>

              {/* Product Info */}
              <div className="p-6 text-white">
                <h3 className="text-2xl font-bold mb-3">{product.name}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < product.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-500'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-400 ml-2">({product.rating}/5)</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl font-bold text-orange-400">
                    ${product.sale_price || product.price}
                  </span>
                  <span className="text-sm text-gray-400">
                    Includes 1 Year IPTV
                  </span>
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  {product.stock_quantity > 0 ? (
                    <span className="text-sm text-green-400 font-semibold">
                      ✓ In Stock - Ships Same Day
                    </span>
                  ) : (
                    <span className="text-sm text-red-400 font-semibold">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock_quantity === 0}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                    product.stock_quantity > 0
                      ? product.featured
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/50'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  {product.stock_quantity > 0 ? 'Add to Cart & Checkout' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Products */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-400">No Fire Stick products available</p>
            <a
              href="/shop"
              className="mt-4 inline-block text-orange-400 hover:underline"
            >
              View all products
            </a>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto border border-white/20">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              Why Choose Our Jailbroken Fire Sticks?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Instant Setup</h4>
                <p className="text-gray-300 text-sm">Plug in and start watching in under 5 minutes</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Premium Quality</h4>
                <p className="text-gray-300 text-sm">4K streams with anti-freeze technology</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Lifetime Support</h4>
                <p className="text-gray-300 text-sm">24/7 customer service whenever you need help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Home */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </a>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            View All Products
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
