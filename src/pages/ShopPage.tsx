import { useState, useEffect } from 'react';
import { supabase, getStorageUrl } from '../lib/supabase';
import { ShoppingCart, Search, Filter, Star } from 'lucide-react';
import Footer from '../components/Footer';
import CustomerReviewsSection from '../components/CustomerReviewsSection';
import ValidatedImage from '../components/ValidatedImage';

// Fallback images
const FALLBACK_FIRESTICK_IMAGE = 'https://images.pexels.com/photos/5474028/pexels-photo-5474028.jpeg?auto=compress&cs=tinysrgb&w=600';
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

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

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
      
      // Ensure images are properly formatted from Supabase Storage
      const productsWithImages = (data || []).map((product: Product) => {
        let imageUrl = product.main_image || '';
        
        // Use Supabase storage images as fallback for reliability
        if (!imageUrl || imageUrl.includes('placeholder') || imageUrl.includes('pexels')) {
          const isFirestick = product.name?.toLowerCase().includes('fire stick') || product.name?.toLowerCase().includes('fire tv');
          if (isFirestick) {
            if (product.name?.toLowerCase().includes('4k max')) {
              imageUrl = getStorageUrl('images', 'firestick 4k max.jpg');
            } else if (product.name?.toLowerCase().includes('4k')) {
              imageUrl = getStorageUrl('images', 'firestick 4k.jpg');
            } else {
              imageUrl = getStorageUrl('images', 'firestick hd.jpg');
            }
          } else {
            imageUrl = getStorageUrl('images', 'iptv-subscription.jpg');
          }
        }
        
        return {
          ...product,
          main_image: imageUrl
        };
      });
      
      // Use database products if available, otherwise use fallback products
      if (productsWithImages && productsWithImages.length > 0) {
        setProducts(productsWithImages);
      } else {
        setProducts(fallbackProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // On error, use fallback products
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  // Fallback products to display when database is empty or unavailable
  const fallbackProducts: Product[] = [
    // Fire Stick Products
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
    },
    // IPTV Subscription Products
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
    // Redirect to checkout immediately
    window.location.href = '/checkout';
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.sale_price || a.price) - parseFloat(b.sale_price || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.sale_price || b.price) - parseFloat(a.sale_price || a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(filtered);
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Shop All Products</h1>
              <p className="text-orange-100">Browse our complete collection</p>
            </div>
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

      {/* Filters & Search */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative h-64 bg-gray-200 overflow-hidden">
                {product.main_image ? (
                  <ValidatedImage
                    src={product.main_image}
                    fallbackSrc={product.name?.toLowerCase().includes('fire stick') || product.name?.toLowerCase().includes('fire tv') ? FALLBACK_FIRESTICK_IMAGE : FALLBACK_IPTV_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    minBytes={1000}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <ValidatedImage
                      src={getStorageUrl('images', 'iptv-subscription.jpg')}
                      fallbackSrc={FALLBACK_IPTV_IMAGE}
                      alt="placeholder"
                      className="w-full h-full object-cover"
                      minBytes={1000}
                    />
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-2 left-2 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Featured
                  </div>
                )}
                {product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price) && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Sale
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < product.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      ({product.rating})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  {product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price) ? (
                    <>
                      <span className="text-2xl font-bold text-orange-600">
                        ${product.sale_price}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${product.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-4">
                  {product.stock_quantity > 0 ? (
                    <span className="text-sm text-green-600 font-semibold">
                      In Stock ({product.stock_quantity} available)
                    </span>
                  ) : (
                    <span className="text-sm text-red-600 font-semibold">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock_quantity === 0}
                  className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    product.stock_quantity > 0
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-gray-500">No products found</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="mt-4 text-orange-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <CustomerReviewsSection />

      {/* Back to Home */}
      <div className="container mx-auto px-4 pb-8">
        <a
          href="/"
          className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all"
        >
          ← Back to Home
        </a>
      </div>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}
