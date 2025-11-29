import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Check, Zap, ArrowLeft, Gift, User, Mail, Phone, Send } from 'lucide-react';
import { supabase, getStorageUrl } from '../lib/supabase';
import Footer from '../components/Footer';
import ValidatedImage from '../components/ValidatedImage';

// Fallback image when all else fails
const FALLBACK_IPTV_IMAGE = 'https://images.pexels.com/photos/5474282/pexels-photo-5474282.jpeg?auto=compress&cs=tinysrgb&w=600';

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

interface DBProduct {
  id: string;
  name: string;
  description?: string;
  price?: string;
  sale_price?: string;
  main_image?: string;
  image_url?: string;
  category?: string;
  stock_quantity?: number;
  rating?: number;
  featured?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function IPTVServicesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [freeTrialName, setFreeTrialName] = useState('');
  const [freeTrialEmail, setFreeTrialEmail] = useState('');
  const [freeTrialPhone, setFreeTrialPhone] = useState('');
  const [freeTrialSubmitted, setFreeTrialSubmitted] = useState(false);
  const [freeTrialLoading, setFreeTrialLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCart();
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
      
      // Filter for IPTV subscription products only
      const iptvProducts = (data || [])
        .filter((product: DBProduct) => {
          const name = (product.name || '').toLowerCase();
          const category = (product.category || '').toLowerCase();
          const isFirestick = name.includes('fire stick') || 
                             name.includes('fire tv') || 
                             name.includes('firestick') ||
                             category.includes('fire stick') ||
                             category === 'firestick';
          return !isFirestick && (
            name.includes('iptv') || 
            name.includes('subscription') ||
            name.includes('month') ||
            name.includes('year') ||
            category.includes('iptv') ||
            category.includes('subscription')
          );
        })
        .map((product: DBProduct) => {
          let imageUrl = product.main_image || product.image_url || '';
          
          // Use Supabase storage as fallback for reliability
          if (!imageUrl || imageUrl.includes('placeholder') || imageUrl.includes('pexels')) {
            imageUrl = getStorageUrl('images', 'iptv-subscription.jpg');
          }
          
          return {
            ...product,
            main_image: imageUrl
          };
        });
      
      if (iptvProducts && iptvProducts.length > 0) {
        setProducts(iptvProducts);
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
      id: 'iptv-1month',
      name: '1 Month IPTV Subscription',
      description: '18,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports & PPV Events, 4K/FHD/HD Quality, Works on Any Device, Instant Activation',
      price: '15.00',
      sale_price: '15.00',
      main_image: getStorageUrl('images', 'iptv-subscription.jpg'),
      category: 'IPTV Subscription',
      stock_quantity: 999,
      rating: 5,
      featured: false
    },
    {
      id: 'iptv-3months',
      name: '3 Month IPTV Subscription',
      description: '18,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports & PPV Events, 4K/FHD/HD Quality, Works on Any Device, Priority Support',
      price: '30.00',
      sale_price: '30.00',
      main_image: getStorageUrl('images', 'iptv-subscription.jpg'),
      category: 'IPTV Subscription',
      stock_quantity: 999,
      rating: 5,
      featured: true
    },
    {
      id: 'iptv-6months',
      name: '6 Month IPTV Subscription',
      description: '18,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports & PPV Events, 4K/FHD/HD Quality, Works on Any Device, Priority Support',
      price: '50.00',
      sale_price: '50.00',
      main_image: getStorageUrl('images', 'iptv-subscription.jpg'),
      category: 'IPTV Subscription',
      stock_quantity: 999,
      rating: 5,
      featured: false
    },
    {
      id: 'iptv-12months',
      name: '1 Year IPTV Subscription',
      description: '18,000+ Live TV Channels, 60,000+ Movies & TV Shows, All Sports & PPV Events, 4K/FHD/HD Quality, Works on Any Device, VIP Support, Best Value!',
      price: '75.00',
      sale_price: '75.00',
      main_image: getStorageUrl('images', 'iptv-subscription.jpg'),
      category: 'IPTV Subscription',
      stock_quantity: 999,
      rating: 5,
      featured: false
    }
  ];

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    let newCart;

    if (existing) {
      newCart = cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }

    saveCart(newCart);
    window.location.href = '/checkout';
  };

  const handleFreeTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!freeTrialName || !freeTrialEmail) {
      alert('Please enter your name and email.');
      return;
    }

    setFreeTrialLoading(true);

    try {
      await supabase
        .from('email_captures')
        .insert([{
          email: freeTrialEmail,
          name: freeTrialName,
          phone: freeTrialPhone || null,
          source: 'free-trial-signup',
          metadata: { product: '36-Hour Free Trial - IPTV Subscription' }
        }]);

      const emailBody = `
FREE TRIAL REQUEST - 36-HOUR IPTV SUBSCRIPTION

Customer Information:
- Name: ${freeTrialName}
- Email: ${freeTrialEmail}
- Phone: ${freeTrialPhone || 'Not provided'}
- Request Date: ${new Date().toLocaleString()}

Product Requested: 36-Hour Free IPTV Trial

Trial Includes:
- 18,000+ Live TV Channels
- 60,000+ Movies & TV Shows
- All Sports Channels & Pay-Per-View Events
- 4K, Full HD, and HD Streaming
- Compatible with All Devices

Please send the trial activation details to the customer's email address.

---
Automated message from StreamStickPro.com
      `.trim();

      const mailtoLink = `mailto:reloadedfiretvteam@gmail.com?subject=36-Hour Free Trial Request - ${freeTrialName}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;

      setFreeTrialSubmitted(true);

      setTimeout(() => {
        alert('Your email app has opened. Please click "Send" to complete your request. You will receive your activation details within 24 hours.');
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      alert('There was a problem submitting your request. Please email us at reloadedfiretvteam@gmail.com.');
    } finally {
      setFreeTrialLoading(false);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl text-white">Loading IPTV subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-8 h-8 text-yellow-300" />
                <h1 className="text-4xl font-bold">IPTV Subscriptions</h1>
              </div>
              <p className="text-blue-100">Premium Streaming - Works on Any Device</p>
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
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center gap-2"
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
              <span>4K Quality Streaming</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              <span>Instant Activation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free Trial Card */}
          <div className="relative bg-gradient-to-br from-green-600/30 to-teal-600/30 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ring-4 ring-green-500 shadow-2xl shadow-green-500/50">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce text-sm">
                <Gift className="w-4 h-4" />
                FREE TRIAL
              </div>
            </div>

            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
              <div className="text-center">
                <Gift className="w-16 h-16 text-white mx-auto mb-2" />
                <span className="text-white font-bold text-lg">Try Before You Buy</span>
              </div>
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-xs">
                36 HOURS
              </div>
            </div>

            <div className="p-6 text-white">
              <h3 className="text-xl font-bold mb-4">36-Hour Free Trial</h3>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-green-400">FREE</span>
                </div>
                <p className="text-green-200 text-xs mt-1">No credit card required</p>
              </div>

              {!freeTrialSubmitted ? (
                <form onSubmit={handleFreeTrialSubmit} className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={freeTrialName}
                      onChange={(e) => setFreeTrialName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={freeTrialEmail}
                      onChange={(e) => setFreeTrialEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={freeTrialPhone}
                      onChange={(e) => setFreeTrialPhone(e.target.value)}
                      placeholder="Phone Number (Optional)"
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={freeTrialLoading}
                    className="w-full py-3 rounded-xl font-bold text-base transition-all transform hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg disabled:opacity-50"
                  >
                    {freeTrialLoading ? (
                      'Processing...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Start Free Trial
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-green-200 text-sm font-medium">Request Submitted!</p>
                  <p className="text-green-300 text-xs mt-1">Please send the email to complete your request.</p>
                </div>
              )}

              <div className="space-y-2 mt-4">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-100 text-xs">18,000+ Live TV Channels</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-100 text-xs">60,000+ Movies & TV Shows</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-100 text-xs">All Sports & Pay-Per-View</span>
                </div>
              </div>
            </div>
          </div>

          {/* IPTV Products */}
          {products.map(product => (
            <div
              key={product.id}
              className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                product.featured ? 'ring-4 ring-blue-500 scale-105 shadow-2xl shadow-blue-500/50' : ''
              }`}
            >
              {product.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    POPULAR
                  </div>
                </div>
              )}

              {/* Product Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-600 to-cyan-600 overflow-hidden flex items-center justify-center">
                {product.main_image ? (
                  <ValidatedImage
                    src={product.main_image}
                    fallbackSrc={FALLBACK_IPTV_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    minBytes={1000}
                  />
                ) : (
                  <Zap className="w-20 h-20 text-white/50" />
                )}
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-xs">
                  {product.name.includes('1 Month') ? 'STARTER' :
                   product.name.includes('3 Month') ? 'POPULAR' :
                   product.name.includes('6 Month') ? 'GREAT VALUE' : 'BEST DEAL'}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 text-white">
                <h3 className="text-xl font-bold mb-3">{product.name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < product.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-500'
                      }`}
                    />
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-blue-400">
                    ${product.sale_price || product.price}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  className={`w-full py-3 rounded-xl font-bold text-base transition-all transform hover:scale-105 mb-4 flex items-center justify-center gap-2 ${
                    product.featured
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/50'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100 text-xs">18,000+ Live Channels</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100 text-xs">60,000+ Movies & Shows</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100 text-xs">All Sports & PPV</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100 text-xs">Works on Any Device</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Products */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-400">No IPTV subscriptions available</p>
            <a
              href="/shop"
              className="mt-4 inline-block text-blue-400 hover:underline"
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
              What's Included in Every Subscription?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Instant Activation</h4>
                <p className="text-gray-300 text-sm">Start streaming within minutes of purchase</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">4K Quality</h4>
                <p className="text-gray-300 text-sm">Crystal clear 4K, FHD, and HD streams</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">All Devices</h4>
                <p className="text-gray-300 text-sm">Works on Fire Stick, Smart TV, Phone, Tablet & more</p>
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
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            View All Products
          </a>
          <a
            href="/fire-sticks"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-all"
          >
            View Fire Sticks
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
