import { Check, Flame, Star, Zap, ShoppingCart, Gift, Send, User, Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  type: 'firestick' | 'iptv';
  image: string;
  badge: string;
  popular: boolean;
  period?: string;
  features: string[];
}

interface ShopProps {
  onAddToCart: (product: Product) => void;
}

interface DBProduct {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  short_description: string;
  description: string;
  featured: boolean;
  status: string;
  main_image: string;
}

export default function Shop({ onAddToCart }: ShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [freeTrialName, setFreeTrialName] = useState('');
  const [freeTrialEmail, setFreeTrialEmail] = useState('');
  const [freeTrialPhone, setFreeTrialPhone] = useState('');
  const [freeTrialSubmitted, setFreeTrialSubmitted] = useState(false);
  const [freeTrialLoading, setFreeTrialLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data: dbProducts } = await supabase
      .from('real_products')
      .select('*')
      .in('status', ['published', 'publish', 'active'])
      .order('sort_order', { ascending: true });

    if (dbProducts) {

      const mappedProducts: Product[] = dbProducts.map((p: DBProduct) => {
        const features = p.description ? p.description.split(',').map(f => f.trim()) : [];
        const isFirestick = p.name.toLowerCase().includes('fire stick') || p.name.toLowerCase().includes('fire tv');

        // Parse prices to numbers
        const price = parseFloat(p.sale_price?.toString() || p.price?.toString() || '0');

        // Get image - prioritize main_image, then image_url, then fallback
        let productImage = p.main_image || p.image_url || '';
        
        // If no image, use type-specific fallback
        if (!productImage || productImage.trim() === '') {
          if (isFirestick) {
            if (p.name.toLowerCase().includes('4k max')) {
              productImage = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k%20max.jpg';
            } else if (p.name.toLowerCase().includes('4k')) {
              productImage = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k.jpg';
            } else {
              productImage = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%20hd.jpg';
            }
          } else {
            productImage = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg';
          }
        }

        return {
          id: p.id,
          name: p.name,
          price: price,
          type: isFirestick ? 'firestick' : 'iptv',
          image: productImage,
          badge: isFirestick ? 'BEST VALUE' : 'POPULAR',
          popular: p.featured,
          period: isFirestick ? undefined : '/month',
          features: features.length > 0 ? features : ['Premium quality', '24/7 support']
        };
      });

      setProducts(mappedProducts);
    }
    setLoading(false);
  };

  const handleFreeTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!freeTrialName || !freeTrialEmail) {
      alert('Please enter your name and email');
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
          metadata: { product: 'Free Trial - IPTV Subscription' }
        }]);

      const emailBody = `
FREE TRIAL REQUEST - IPTV SUBSCRIPTION

Customer Details:
- Name: ${freeTrialName}
- Email: ${freeTrialEmail}
- Phone: ${freeTrialPhone || 'Not provided'}
- Date: ${new Date().toLocaleString()}

Product: Free Trial IPTV Subscription
- 7 Days Free Access
- All channels included
- All features included

Please process this free trial request and send activation details to the customer.

---
This is an automated message from StreamStickPro.com
      `.trim();

      const mailtoLink = `mailto:reloadedfiretvteam@gmail.com?subject=Free Trial Request - ${freeTrialName}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;

      setFreeTrialSubmitted(true);

      setTimeout(() => {
        alert('Email opened! Please send the email to complete your free trial request. We will contact you within 24 hours.');
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      alert('Submission error. Please email us directly at reloadedfiretvteam@gmail.com');
    } finally {
      setFreeTrialLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="shop" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-6 py-2 mb-6">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
              <span className="text-sm font-medium">LOADING PRODUCTS</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Loading...</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-700"></div>
                <div className="p-8 space-y-4">
                  <div className="h-6 bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                  <div className="h-12 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const fallbackProducts: Product[] = [
    {
      id: 'firestick-hd',
      name: 'Fire Stick HD',
      price: 140.00,
      type: 'firestick',
      image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
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
      type: 'firestick',
      image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
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
      type: 'firestick',
      image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
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
    },
    {
      id: 'iptv-1month',
      name: '1 Month IPTV Subscription',
      price: 15.00,
      type: 'iptv',
      image: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=800',
      badge: 'STARTER',
      popular: false,
      period: '/month',
      features: [
        '18,000+ Live TV Channels',
        '60,000+ Movies & TV Shows',
        'All Sports Channels & PPV Events',
        '4K/FHD/HD Quality Streams',
        'Works on Any Device',
        'Anti-Freeze Technology',
        'EPG & Catch-Up TV',
        'No Contract - Cancel Anytime',
        'Instant Activation',
        '24/7 Customer Support'
      ]
    },
    {
      id: 'iptv-3months',
      name: '3 Month IPTV Subscription',
      price: 30.00,
      type: 'iptv',
      image: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=800',
      badge: 'POPULAR',
      popular: true,
      features: [
        '18,000+ Live TV Channels',
        '60,000+ Movies & TV Shows',
        'All Sports Channels & PPV Events',
        '4K/FHD/HD Quality Streams',
        'Works on Any Device',
        'Anti-Freeze Technology',
        'EPG & Catch-Up TV',
        'Priority Support',
        'Instant Activation',
        '24/7 Customer Support'
      ]
    },
    {
      id: 'iptv-6months',
      name: '6 Month IPTV Subscription',
      price: 50.00,
      type: 'iptv',
      image: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=800',
      badge: 'GREAT VALUE',
      popular: false,
      features: [
        '18,000+ Live TV Channels',
        '60,000+ Movies & TV Shows',
        'All Sports Channels & PPV Events',
        '4K/FHD/HD Quality Streams',
        'Works on Any Device',
        'Anti-Freeze Technology',
        'EPG & Catch-Up TV',
        'Priority Support',
        'Instant Activation',
        '24/7 Customer Support'
      ]
    },
    {
      id: 'iptv-12months',
      name: '1 Year IPTV Subscription',
      price: 75.00,
      type: 'iptv',
      image: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=800',
      badge: 'BEST DEAL',
      popular: false,
      features: [
        '18,000+ Live TV Channels',
        '60,000+ Movies & TV Shows',
        'All Sports Channels & PPV Events',
        '4K/FHD/HD Quality Streams',
        'Works on Any Device',
        'Anti-Freeze Technology',
        'EPG & Catch-Up TV',
        'VIP Support',
        'Instant Activation',
        '24/7 Customer Support'
      ]
    }
  ];

  const displayProducts = products.length > 0 ? products : fallbackProducts;
  const firestickProducts = displayProducts.filter(p => p.type === 'firestick');
  const iptvProducts = displayProducts.filter(p => p.type === 'iptv');

  return (
    <section id="shop" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-6 py-2 mb-6">
            <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
            <span className="text-sm font-medium">SHOP ALL PRODUCTS</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Premium Products</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Browse our complete collection of jailbroken Fire Sticks and IPTV subscriptions
          </p>
        </div>

        <div className="mb-16">
          {/* Dramatic Fire Stick Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden mb-12 animate-fade-in">
            <div className="absolute inset-0">
              <img
                src="/Screenshot_20251102-131641.png"
                alt="Fire Stick Breaking Free"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            </div>

            <div className="relative z-10 px-8 md:px-16 py-16 md:py-24">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-orange-500/30 backdrop-blur-sm border border-orange-400/50 rounded-full px-6 py-2 mb-6">
                  <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                  <span className="text-sm font-bold tracking-wide">BREAK FREE FROM CABLE</span>
                </div>

                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                  Unleash
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 animate-pulse">
                    Unlimited
                  </span>
                  <br />
                  Entertainment
                </h2>

                <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                  Pre-loaded, pre-configured, and ready to stream. Cut the chains of expensive cable and experience true streaming freedom.
                </p>

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

          <h3 className="text-3xl font-bold mb-8 text-center">
            <Flame className="inline w-8 h-8 text-orange-500 mr-2" />
            Choose Your Fire Stick
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {firestickProducts.map((product) => (
              <div
                key={product.id}
                className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  product.popular ? 'ring-4 ring-orange-500 scale-105 shadow-2xl shadow-orange-500/50' : ''
                }`}
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
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Fallback based on product type
                      if (product.type === 'firestick') {
                        if (product.name.includes('4K Max')) {
                          target.src = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k%20max.jpg';
                        } else if (product.name.includes('4K')) {
                          target.src = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%204k.jpg';
                        } else {
                          target.src = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/firestick%20hd.jpg';
                        }
                      } else {
                        target.src = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg';
                      }
                    }}
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
                    onClick={() => onAddToCart(product)}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 mb-6 flex items-center justify-center gap-2 ${
                      product.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/50'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>

                  <div className="space-y-3">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FREE TRIAL BOX */}
        <div className="mb-16">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-green-600 via-teal-600 to-green-600 rounded-3xl overflow-hidden shadow-2xl border-4 border-green-400">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-center py-3 font-bold text-lg relative">
              <Gift className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 animate-bounce" />
              🎉 LIMITED TIME - TRY FREE FOR 36 HOURS!
              <Gift className="w-6 h-6 absolute right-6 top-1/2 -translate-y-1/2 animate-bounce" />
            </div>

            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Side - Info */}
                <div>
                  <h3 className="text-4xl font-bold text-white mb-4">
                    36-Hour Free Trial
                  </h3>
                  <p className="text-green-100 text-lg mb-6">
                    No credit card required. Experience everything our premium IPTV service has to offer completely free!
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <Check className="w-6 h-6 text-white bg-green-500 rounded-full p-1" />
                      <span className="text-white font-semibold">22,000+ Live TV Channels</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-6 h-6 text-white bg-green-500 rounded-full p-1" />
                      <span className="text-white font-semibold">120,000+ Movies & Shows</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-6 h-6 text-white bg-green-500 rounded-full p-1" />
                      <span className="text-white font-semibold">All Sports & PPV Events</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-6 h-6 text-white bg-green-500 rounded-full p-1" />
                      <span className="text-white font-semibold">4K Ultra HD Quality</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-6 h-6 text-white bg-green-500 rounded-full p-1" />
                      <span className="text-white font-semibold">Works on All Devices</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="w-6 h-6 text-white bg-green-500 rounded-full p-1" />
                      <span className="text-white font-semibold">24/7 Customer Support</span>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <p className="text-white text-center font-bold text-2xl">100% FREE</p>
                    <p className="text-green-100 text-center text-sm">for 36 hours, then $14.99/month</p>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div>
                  {!freeTrialSubmitted ? (
                    <div className="bg-white rounded-2xl p-6 shadow-2xl">
                      <h4 className="text-2xl font-bold text-gray-800 mb-4">
                        Start Your Free Trial
                      </h4>

                      <form onSubmit={handleFreeTrialSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              required
                              value={freeTrialName}
                              onChange={(e) => setFreeTrialName(e.target.value)}
                              placeholder="John Doe"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              required
                              value={freeTrialEmail}
                              onChange={(e) => setFreeTrialEmail(e.target.value)}
                              placeholder="john@example.com"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number (Optional)
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="tel"
                              value={freeTrialPhone}
                              onChange={(e) => setFreeTrialPhone(e.target.value)}
                              placeholder="(555) 123-4567"
                              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={freeTrialLoading}
                          className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-teal-600 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                        >
                          {freeTrialLoading ? (
                            'Processing...'
                          ) : (
                            <>
                              <Send className="w-5 h-5" />
                              Start My Free Trial Now
                            </>
                          )}
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                          By clicking the button, your email client will open with a pre-filled message. Simply send it to complete your request.
                        </p>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
                      <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Check className="w-10 h-10 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-800 mb-4">
                        Request Submitted!
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Thank you {freeTrialName}! We've opened your email client with a pre-filled message.
                      </p>
                      <p className="text-sm text-gray-500">
                        We'll send your activation details to <strong>{freeTrialEmail}</strong> within 24 hours.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold mb-8 text-center">
            <Zap className="inline w-8 h-8 text-blue-500 mr-2" />
            IPTV Subscriptions Only
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {iptvProducts.map((product) => (
              <div
                key={product.id}
                className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  product.popular ? 'ring-4 ring-blue-500 scale-105 shadow-2xl shadow-blue-500/50' : ''
                }`}
              >
                {product.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      POPULAR
                    </div>
                  </div>
                )}

                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full font-bold text-xs">
                    {product.badge}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">{product.name}</h3>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-blue-400">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full py-3 rounded-xl font-bold text-base transition-all transform hover:scale-105 mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>

                  <div className="space-y-2">
                    {product.features.slice(0, 6).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-blue-100 text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
