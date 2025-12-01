import { useState, useEffect } from 'react';
import { ShoppingCart, Lock, Bitcoin, CreditCard, Smartphone, Wallet, Mail, User, CheckCircle, ArrowRight, Shield, AlertCircle, Package, X } from 'lucide-react';
import { supabase, getStorageUrl } from '../lib/supabase';
import StripePaymentForm from '../components/StripePaymentForm';
import BitcoinPaymentFlow from '../components/BitcoinPaymentFlow';
import CashAppPaymentFlow from '../components/CashAppPaymentFlow';

// Extend Window interface for Stripe
declare global {
  interface Window {
    Stripe?: any;
  }
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  main_image: string;
  category: string;
  stripe_payment_link?: string | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CompleteCheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'bitcoin' | 'cashapp' | ''>('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingPaymentIntent, setCreatingPaymentIntent] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCartFromProducts();
    // Check URL for product parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId) {
      addProductToCart(productId);
    }
  }, []);

  const loadCartFromProducts = async () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        // Convert cart items to use real products
        const products = await loadProducts();
        const enrichedCart = cartData.map((item: any) => {
          const product = products.find(p => p.id === item.product?.id || p.id === item.id);
          if (product) {
            return {
              product: product,
              quantity: item.quantity || 1
            };
          }
          return null;
        }).filter(Boolean) as CartItem[];
        
        if (enrichedCart.length > 0) {
          setCart(enrichedCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  };

  const loadProducts = async (): Promise<Product[]> => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('real_products')
        .select('*')
        .in('status', ['published', 'publish', 'active'])
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data) {
        return data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: parseFloat(p.price || 0),
          sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
          main_image: p.main_image || '',
          category: p.category || '',
          stripe_payment_link: p.stripe_payment_link || null
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    } finally {
      setLoadingProducts(false);
    }
  };

  const addProductToCart = async (productId: string) => {
    const products = await loadProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
      setCart([{ product, quantity: 1 }]);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.product.sale_price || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
  };

  const calculateTax = () => calculateSubtotal() * 0.0;
  const calculateShipping = () => 0;
  const calculateTotal = () => calculateSubtotal() + calculateTax() + calculateShipping();

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name.trim()) newErrors.name = 'Name is required';
    if (!customerInfo.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) newErrors.email = 'Invalid email format';
    if (!customerInfo.phone.trim()) newErrors.phone = 'Phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2 && paymentMethod) {
      // If Stripe is selected, create payment intent before moving to step 3
      if (paymentMethod === 'stripe') {
        await createPaymentIntent();
        if (clientSecret) {
          setCurrentStep(3);
        }
      } else {
        setCurrentStep(3);
      }
    }
  };

  const createPaymentIntent = async () => {
    if (!customerInfo.email || !customerInfo.name || cart.length === 0) {
      setPaymentError('Please fill in your information and add products to cart');
      return;
    }

    setCreatingPaymentIntent(true);
    setPaymentError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Payment service not configured');
      }

      // Calculate total from cart
      const totalAmount = calculateTotal();
      const productIds = cart.map(item => item.product.id);

      // Call Supabase Edge Function with proper headers for Cloudflare
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: 'usd',
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          productIds: productIds,
          metadata: {
            customerPhone: customerInfo.phone,
            cartItems: JSON.stringify(cart.map(item => ({
              productId: item.product.id,
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.sale_price || item.product.price
            })))
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create payment intent`);
      }

      const data = await response.json();

      if (!data.clientSecret) {
        throw new Error('Invalid response from payment server');
      }

      setClientSecret(data.clientSecret);
    } catch (error: unknown) {
      console.error('Error creating payment intent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.';
      setPaymentError(errorMessage);
    } finally {
      setCreatingPaymentIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId?: string, orderCode?: string) => {
    // Save order to database with REAL product names (what customer sees)
    try {
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        total_amount: calculateTotal(),
        payment_method: paymentMethod,
        payment_status: 'paid',
        order_status: 'processing',
        stripe_payment_intent_id: paymentIntentId || null,
        order_code: orderCode || generateOrderCode(),
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name, // REAL name (customer sees this)
          product_name_cloaked: item.product.cloaked_name || 'Digital Entertainment Service', // CLOAKED name (Stripe sees this)
          quantity: item.quantity,
          price: item.product.sale_price || item.product.price
        }))
      };

      const { error } = await supabase
        .from('orders_full')
        .insert([orderData]);

      if (error) {
        console.error('Error saving order:', error);
      }
    } catch (error) {
      console.error('Error saving order:', error);
    }

    setOrderComplete(true);
    setOrderCode(orderCode || generateOrderCode());
    // Clear cart
    localStorage.removeItem('cart');
  };

  const generateOrderCode = () => {
    return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity } 
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Order Complete!</h2>
          <p className="text-gray-600 mb-2">Thank you for your purchase</p>
          {orderCode && (
            <p className="text-sm text-gray-500 mb-6">Order Code: <strong>{orderCode}</strong></p>
          )}
          <div className="p-4 bg-gray-50 rounded-lg text-left mb-6">
            <p className="text-sm text-gray-500 mb-2">Total Amount</p>
            <p className="font-bold text-2xl text-gray-900">${calculateTotal().toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-blue-800">
              <strong>Next Steps:</strong> You will receive a confirmation email with your order details and service access information.
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !loadingProducts) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add products to your cart to checkout</p>
          <button 
            onClick={() => window.location.href = '/shop'}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Go to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              Checkout
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Secure Checkout</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-semibold">Information</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-semibold">Payment</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-semibold">Complete</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Customer Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <button
                    onClick={handleNextStep}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method Selection */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  Select Payment Method
                </h2>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {/* Stripe Payment (Cards, Apple Pay, Google Pay, etc.) */}
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      paymentMethod === 'stripe' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'stripe' ? 'border-blue-600' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'stripe' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                      </div>
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <span className="font-bold text-lg">Card Payment</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Credit/Debit Cards</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>Visa</span>
                      <span>•</span>
                      <span>Mastercard</span>
                      <span>•</span>
                      <span>Apple Pay</span>
                      <span>•</span>
                      <span>Google Pay</span>
                      <span>•</span>
                      <span>Cash App</span>
                    </div>
                  </button>

                  {/* Bitcoin Payment */}
                  <button
                    onClick={() => setPaymentMethod('bitcoin')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      paymentMethod === 'bitcoin' 
                        ? 'border-orange-600 bg-orange-50' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'bitcoin' ? 'border-orange-600' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'bitcoin' && <div className="w-3 h-3 bg-orange-600 rounded-full"></div>}
                      </div>
                      <Bitcoin className="w-6 h-6 text-orange-600" />
                      <span className="font-bold text-lg">Bitcoin</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Cryptocurrency</p>
                    <p className="text-xs text-gray-500">Pay with Bitcoin</p>
                  </button>

                  {/* Cash App Payment */}
                  <button
                    onClick={() => setPaymentMethod('cashapp')}
                    className={`p-6 border-2 rounded-xl transition-all text-left ${
                      paymentMethod === 'cashapp' 
                        ? 'border-green-600 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cashapp' ? 'border-green-600' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'cashapp' && <div className="w-3 h-3 bg-green-600 rounded-full"></div>}
                      </div>
                      <Wallet className="w-6 h-6 text-green-600" />
                      <span className="font-bold text-lg">Cash App</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Mobile Payment</p>
                    <p className="text-xs text-gray-500">Pay with Cash App</p>
                  </button>
                </div>

                {paymentError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{paymentError}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!paymentMethod || creatingPaymentIntent}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creatingPaymentIntent ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Processing */}
            {currentStep === 3 && paymentMethod === 'stripe' && clientSecret && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-semibold"
                  >
                    ← Change Payment Method
                  </button>
                </div>
                <StripePaymentForm
                  amount={calculateTotal()}
                  clientSecret={clientSecret}
                  onSuccess={(paymentIntentId) => handlePaymentSuccess(paymentIntentId)}
                  onError={(error) => setPaymentError(error)}
                />
              </div>
            )}

            {currentStep === 3 && paymentMethod === 'bitcoin' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-semibold"
                  >
                    ← Change Payment Method
                  </button>
                </div>
                <BitcoinPaymentFlow
                  totalAmount={calculateTotal()}
                  customerInfo={customerInfo}
                  products={cart.map(item => ({
                    name: item.product.name,
                    price: item.product.sale_price || item.product.price,
                    quantity: item.quantity
                  }))}
                  onOrderComplete={(orderCode) => handlePaymentSuccess(undefined, orderCode)}
                  onBack={() => setCurrentStep(2)}
                />
              </div>
            )}

            {currentStep === 3 && paymentMethod === 'cashapp' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm font-semibold"
                  >
                    ← Change Payment Method
                  </button>
                </div>
                <CashAppPaymentFlow
                  totalAmount={calculateTotal()}
                  customerInfo={customerInfo}
                  products={cart.map(item => ({
                    name: item.product.name,
                    price: item.product.sale_price || item.product.price,
                    quantity: item.quantity
                  }))}
                  onOrderComplete={(orderCode) => handlePaymentSuccess(undefined, orderCode)}
                  onBack={() => setCurrentStep(2)}
                />
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => {
                  const imageUrl = item.product.main_image && !item.product.main_image.startsWith('http')
                    ? getStorageUrl('images', item.product.main_image)
                    : item.product.main_image || '/placeholder-product.jpg';
                  const price = item.product.sale_price || item.product.price;

                  return (
                    <div key={item.product.id} className="flex gap-4 pb-4 border-b border-gray-200">
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{item.product.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">${price.toFixed(2)}</span> × {item.quantity}
                          </div>
                          <div className="font-bold">${(price * item.quantity).toFixed(2)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>${calculateShipping().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-200">
                <Lock className="w-4 h-4 text-green-600" />
                <span>256-bit SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

