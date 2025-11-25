/**
 * SecureCheckoutPage Component
 * 
 * Full storefront for the secure checkout subdomain.
 * Features:
 * - Product grid (reads from square_products joined with real_products)
 * - Product detail modal
 * - Cart management
 * - Square checkout integration
 * - Confirmation page
 * 
 * SECURITY:
 * - Uses environment placeholders (no secrets in code)
 * - Requires VITE_SQUARE_APP_ID and VITE_SQUARE_LOCATION_ID
 * - All products must be approved_for_square = true
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingCart, 
  Shield, 
  Lock, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight,
  Star,
  CheckCircle,
  Package,
  Truck,
  Flame
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { validateCartPrices, CartItem as ValidateCartItem } from '../api/syncPrices';
import SquarePaymentForm from '../components/SquarePaymentForm';

// Types
interface SecureProduct {
  id: string;
  real_product_id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  sku: string;
  main_image: string;
  category?: string;
  features?: string[];
  badge?: string;
  popular?: boolean;
}

interface CartItem {
  product: SecureProduct;
  quantity: number;
}

type CheckoutStep = 'browse' | 'cart' | 'checkout' | 'confirmation';

export default function SecureCheckoutPage() {
  const [products, setProducts] = useState<SecureProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<CheckoutStep>('browse');
  const [selectedProduct, setSelectedProduct] = useState<SecureProduct | null>(null);
  const [priceValidationError, setPriceValidationError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [orderNumber, setOrderNumber] = useState<string>('');

  // Load approved products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('square_products')
        .select(`
          id,
          real_product_id,
          name,
          description,
          price,
          sku,
          main_image,
          real_products (
            original_price,
            category,
            features,
            badge,
            popular
          )
        `)
        .eq('approved_for_square', true)
        .order('name');

      if (error) {
        console.error('Error loading products:', error);
        setProducts(fallbackProducts);
        return;
      }

      if (data && data.length > 0) {
        const formattedProducts: SecureProduct[] = data.map((p: Record<string, unknown>) => {
          const realProduct = p.real_products as Record<string, unknown> | null;
          return {
            id: p.id as string,
            real_product_id: p.real_product_id as string,
            name: p.name as string,
            description: p.description as string,
            price: p.price as number,
            original_price: realProduct?.original_price as number | undefined,
            sku: p.sku as string,
            main_image: p.main_image as string,
            category: realProduct?.category as string | undefined,
            features: (realProduct?.features as string[] | undefined) || [],
            badge: realProduct?.badge as string | undefined,
            popular: realProduct?.popular as boolean | undefined,
          };
        });
        setProducts(formattedProducts);
      } else {
        setProducts(fallbackProducts);
      }
    } catch {
      console.error('Error loading products');
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Cart functions
  const addToCart = (product: SecureProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSelectedProduct(null);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Validate prices before checkout
  const validateAndProceed = async () => {
    setPriceValidationError(null);

    const cartItems: ValidateCartItem[] = cart.map((item) => ({
      productId: item.product.real_product_id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const validation = await validateCartPrices(cartItems);

    if (!validation.valid) {
      setPriceValidationError(
        `${validation.message} Please refresh your cart and try again.`
      );
      // Reload products to get fresh prices
      await loadProducts();
      return;
    }

    setStep('checkout');
  };

  // Handle payment
  const handlePaymentSubmit = async (token: string) => {
    // In production, this would call your backend to process the payment
    console.log('Processing payment with token:', token);
    console.log('Customer info:', customerInfo);
    console.log('Cart:', cart);

    // Generate order number
    const newOrderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setOrderNumber(newOrderNumber);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setStep('confirmation');
    setCart([]);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Get image URL
  const getImageUrl = (filename: string) => {
    if (!filename) return '/placeholder-product.jpg';
    if (filename.startsWith('http')) return filename;
    // Use Supabase storage URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/imiges/${filename}`;
    }
    return `/images/${filename}`;
  };

  // Confirmation Page
  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500">Order Number</span>
              <span className="font-mono font-bold text-gray-900">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Paid</span>
              <span className="font-bold text-2xl text-gray-900">
                {formatPrice(cartTotal)}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-left p-3 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Digital Delivery</p>
                <p className="text-sm text-gray-500">Check your email for activation instructions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left p-3 bg-green-50 rounded-lg">
              <Truck className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Physical Items</p>
                <p className="text-sm text-gray-500">Ships within 1-2 business days</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('browse')}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all"
          >
            Continue Shopping
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Questions? Contact{' '}
            <a href="mailto:support@streamstickpro.com" className="text-orange-500 hover:underline">
              support@streamstickpro.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Checkout Page
  if (step === 'checkout') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setStep('cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Cart
          </button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <img
                        src={getImageUrl(item.product.main_image)}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <SquarePaymentForm
                amount={cartTotal}
                onSubmit={handlePaymentSubmit}
              />

              <div className="mt-6 bg-blue-50 rounded-xl p-4 flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Secure Transaction</p>
                  <p className="text-sm text-blue-700">
                    Your payment is processed securely through Square. Your card details are never stored on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cart Page
  if (step === 'cart') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
            <button
              onClick={() => setStep('browse')}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Continue Shopping
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add some products to get started</p>
              <button
                onClick={() => setStep('browse')}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {priceValidationError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Price Validation Error</p>
                    <p className="text-sm text-red-700">{priceValidationError}</p>
                    <button
                      onClick={loadProducts}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Refresh Prices
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                {cart.map((item, index) => (
                  <div
                    key={item.product.id}
                    className={`flex items-center gap-4 p-6 ${
                      index !== cart.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <img
                      src={getImageUrl(item.product.main_image)}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">{item.product.sku}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-bold text-gray-900 w-24 text-right">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600">Subtotal ({cartItemCount} items)</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={validateAndProceed}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Proceed to Secure Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Browse Page (default)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold text-gray-900">Stream Stick Pro</span>
          </div>

          <button
            onClick={() => setStep('cart')}
            className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Premium Streaming{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              Made Simple
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Professional streaming devices and website design services. Fast, secure checkout powered by Square.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>5-Star Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Products</h2>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative">
                    <img
                      src={getImageUrl(product.main_image)}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                      }}
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                        {product.badge}
                      </span>
                    )}
                    {product.popular && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={getImageUrl(selectedProduct.main_image)}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                }}
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
              <p className="text-gray-600 mb-4">{selectedProduct.description}</p>

              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                  <ul className="space-y-2">
                    {selectedProduct.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && (
                    <span className="ml-2 text-lg text-gray-400 line-through">
                      {formatPrice(selectedProduct.original_price)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(selectedProduct)}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-4 h-4" />
            Secure checkout powered by Square
          </p>
          <p className="text-sm">
            © {new Date().getFullYear()} Stream Stick Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Fallback products if database is not available
const fallbackProducts: SecureProduct[] = [
  {
    id: 'fallback-1',
    real_product_id: 'fallback-1',
    name: 'Basic Website Design',
    description: 'Professional single-page website design with responsive layout.',
    price: 89.99,
    original_price: 149.99,
    sku: 'WEB-BASIC-001',
    main_image: 'website-basic.jpg',
    category: 'website-design',
    features: ['Single responsive page', 'Mobile-optimized design', 'Contact form'],
    badge: 'Starter',
    popular: false,
  },
  {
    id: 'fallback-2',
    real_product_id: 'fallback-2',
    name: 'Standard Website Design',
    description: 'Multi-page professional website with modern design and SEO.',
    price: 119.99,
    original_price: 199.99,
    sku: 'WEB-STD-001',
    main_image: 'website-standard.jpg',
    category: 'website-design',
    features: ['Up to 5 pages', 'Responsive design', 'CMS integration', 'SEO optimization'],
    badge: 'Most Popular',
    popular: true,
  },
  {
    id: 'fallback-3',
    real_product_id: 'fallback-3',
    name: 'Premium Website Design',
    description: 'Full custom website with e-commerce and premium support.',
    price: 149.99,
    original_price: 299.99,
    sku: 'WEB-PREM-001',
    main_image: 'website-premium.jpg',
    category: 'website-design',
    features: ['Unlimited pages', 'Custom design', 'E-commerce', 'Priority support'],
    badge: 'Best Value',
    popular: false,
  },
];
