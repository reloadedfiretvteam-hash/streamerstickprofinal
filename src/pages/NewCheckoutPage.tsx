import { useState, useEffect } from 'react';
import { ShoppingCart, Lock, Bitcoin, CreditCard, Smartphone, Mail, User, CheckCircle, ArrowRight, Shield, Clock, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BitcoinPaymentFlow from '../components/BitcoinPaymentFlow';
import CashAppPaymentFlow from '../components/CashAppPaymentFlow';
import StripePaymentForm from '../components/StripePaymentForm';
import Footer from '../components/Footer';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: string;
    sale_price?: string;
    image_url?: string;
  };
  quantity: number;
}

export default function NewCheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'bitcoin' | 'cashapp' | ''>('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderCode, setOrderCode] = useState('');

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
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [creatingPaymentIntent, setCreatingPaymentIntent] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = parseFloat(item.product.sale_price || item.product.price);
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
    if (!customerInfo.address.trim()) newErrors.address = 'Address is required';
    if (!customerInfo.city.trim()) newErrors.city = 'City is required';
    if (!customerInfo.state.trim()) newErrors.state = 'State is required';
    if (!customerInfo.zip.trim()) newErrors.zip = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2 && paymentMethod) {
      setCurrentStep(3);
    }
  };

  const handleOrderComplete = (code: string) => {
    setOrderCode(code);
    setOrderComplete(true);
    localStorage.removeItem('cart');
  };

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <a
            href="/shop"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-lg text-gray-600">Thank you for your purchase</p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-700 mb-2 font-semibold">Your Order Tracking Code:</p>
            <div className="bg-white rounded-lg p-4 border-2 border-orange-500">
              <p className="text-3xl font-bold text-center text-orange-600 font-mono">{orderCode}</p>
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">
              An email with your order details and tracking code has been sent to <strong>{customerInfo.email}</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <a
              href={`/track-order?code=${orderCode}`}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              <Clock className="w-5 h-5" />
              Track Your Order
            </a>
            <a
              href="/shop"
              className="flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              Continue Shopping
            </a>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2">What Happens Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>You'll receive payment confirmation within 10-30 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Your order will be processed and shipped within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Track your order anytime using your unique code</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Contact us at reloadedfiretvteam@gmail.com for support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Secure Checkout</h1>
          <p className="text-blue-200">Complete your order in 3 easy steps</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Contact Info', icon: User },
              { num: 2, label: 'Payment Method', icon: CreditCard },
              { num: 3, label: 'Complete Payment', icon: CheckCircle }
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= step.num
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <p className={`text-xs mt-2 font-semibold ${
                    currentStep >= step.num ? 'text-orange-400' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
                {index < 2 && (
                  <div className={`h-1 flex-1 transition-all ${
                    currentStep > step.num ? 'bg-orange-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Customer Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-orange-500" />
                  Contact & Shipping Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="123 Main St"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="New York"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.state}
                      onChange={(e) => setCustomerInfo({...customerInfo, state: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="NY"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.zip}
                      onChange={(e) => setCustomerInfo({...customerInfo, zip: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.zip ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10001"
                    />
                    {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Payment Method
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Payment Method Selection */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-orange-500" />
                  Choose Payment Method
                </h2>

                <div className="space-y-4 mb-6">
                  {/* Stripe Payment Option */}
                  <label
                    className={`block p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                      paymentMethod === 'stripe'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard className="w-8 h-8 text-blue-600" />
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">Credit/Debit Card</h3>
                            <p className="text-sm text-gray-600">Secure Payment via Stripe</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <p className="text-sm text-gray-700 mb-3">
                            <strong>Pay securely with your credit or debit card</strong>
                          </p>
                          <ul className="space-y-2 text-xs text-gray-600">
                            <li className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-500" />
                              PCI-compliant secure payment processing
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Instant payment confirmation
                            </li>
                            <li className="flex items-center gap-2">
                              <Lock className="w-4 h-4 text-gray-500" />
                              Your card details are never stored
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Bitcoin Option */}
                  <label
                    className={`block p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                      paymentMethod === 'bitcoin'
                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value="bitcoin"
                        checked={paymentMethod === 'bitcoin'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'bitcoin')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Bitcoin className="w-8 h-8 text-orange-500" />
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">Bitcoin (BTC)</h3>
                            <p className="text-sm text-gray-600">Cryptocurrency Payment</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <p className="text-sm text-gray-700 mb-3">
                            <strong>Pay with Bitcoin via NOWPayments</strong>
                          </p>
                          <ul className="space-y-2 text-xs text-gray-600">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Option 1: Buy Bitcoin instantly with credit/debit card
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Option 2: Send Bitcoin from your existing wallet
                            </li>
                            <li className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-500" />
                              Secure blockchain-verified transactions
                            </li>
                            <li className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              Payment confirmed in 10-30 minutes
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Cash App Option */}
                  <label
                    className={`block p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                      paymentMethod === 'cashapp'
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value="cashapp"
                        checked={paymentMethod === 'cashapp'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cashapp')}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Smartphone className="w-8 h-8 text-green-600" />
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">Cash App</h3>
                            <p className="text-sm text-gray-600">Mobile Payment</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <p className="text-sm text-gray-700 mb-3">
                            <strong>Send payment directly via Cash App</strong>
                          </p>
                          <ul className="space-y-2 text-xs text-gray-600">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Send to our Cash App tag: <strong>$starstreem1</strong>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Include your unique order code in the note
                            </li>
                            <li className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-blue-500" />
                              Fast and secure mobile payment
                            </li>
                            <li className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-500" />
                              Instant payment verification
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!paymentMethod}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Flow */}
            {currentStep === 3 && (
              <div className="animate-fade-in">
                {paymentMethod === 'stripe' && (
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      Secure Card Payment
                    </h2>
                    {!stripeClientSecret ? (
                      <div>
                        <p className="text-gray-600 mb-4">Click below to initialize secure payment</p>
                        <button
                          onClick={async () => {
                            setCreatingPaymentIntent(true);
                            try {
                              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                              const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                              
                              if (!supabaseUrl) {
                                throw new Error('Supabase URL not configured');
                              }

                              const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
                                method: 'POST',
                                headers: { 
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${supabaseAnonKey || ''}`
                                },
                                body: JSON.stringify({
                                  amount: Math.round(calculateTotal() * 100), // Convert to cents
                                  currency: 'usd',
                                  customerInfo: {
                                    email: customerInfo.email,
                                    fullName: customerInfo.name
                                  }
                                }),
                              });

                              if (!response.ok) {
                                const errorText = await response.text();
                                let errorData;
                                try {
                                  errorData = JSON.parse(errorText);
                                } catch {
                                  errorData = { error: errorText || 'Failed to create payment intent' };
                                }
                                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                              }

                              const data = await response.json();
                              if (!data.clientSecret) {
                                throw new Error('No client secret returned from server');
                              }
                              setStripeClientSecret(data.clientSecret);
                            } catch (error) {
                              console.error('Payment intent creation error:', error);
                              alert(`Error: ${error instanceof Error ? error.message : 'Failed to initialize payment. Please check your connection and try again.'}`);
                            } finally {
                              setCreatingPaymentIntent(false);
                            }
                          }}
                          disabled={creatingPaymentIntent}
                          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-lg transition-all disabled:opacity-50"
                        >
                          {creatingPaymentIntent ? 'Initializing...' : 'Initialize Secure Payment'}
                        </button>
                      </div>
                    ) : (
                      <StripePaymentForm
                        amount={calculateTotal()}
                        clientSecret={stripeClientSecret}
                        onSuccess={async (paymentIntentId) => {
                          try {
                            const { data, error } = await supabase
                              .from('orders')
                              .insert([{
                                customer_name: customerInfo.name,
                                customer_email: customerInfo.email,
                                customer_phone: customerInfo.phone,
                                shipping_address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`,
                                total_amount: calculateTotal().toString(),
                                payment_method: 'stripe',
                                payment_intent_id: paymentIntentId,
                                payment_status: 'completed',
                                status: 'processing',
                                items: cart.map(item => ({
                                  product_id: item.product.id,
                                  product_name: item.product.name,
                                  quantity: item.quantity,
                                  price: parseFloat(item.product.sale_price || item.product.price)
                                }))
                              }])
                              .select();
                            if (error) throw error;
                            const orderCode = (data && data.length > 0 && data[0].id) ? String(data[0].id) : `STRIPE-${Date.now()}`;
                            handleOrderComplete(orderCode);
                          } catch (error) {
                            console.error('Order creation failed:', error);
                            alert('Payment succeeded but order creation failed. Please contact support.');
                          }
                        }}
                        onError={(error) => {
                          alert(`Payment failed: ${error}`);
                        }}
                      />
                    )}
                    <button
                      onClick={() => {
                        setCurrentStep(2);
                        setStripeClientSecret(null);
                      }}
                      className="mt-6 w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                      Back to Payment Methods
                    </button>
                  </div>
                )}
                {paymentMethod === 'bitcoin' && (
                  <BitcoinPaymentFlow
                    totalAmount={calculateTotal()}
                    customerInfo={customerInfo}
                    products={cart.map(item => ({
                      name: item.product.name,
                      price: parseFloat(item.product.sale_price || item.product.price),
                      quantity: item.quantity
                    }))}
                    onOrderComplete={handleOrderComplete}
                    onBack={() => setCurrentStep(2)}
                  />
                )}

                {paymentMethod === 'cashapp' && (
                  <CashAppPaymentFlow
                    totalAmount={calculateTotal()}
                    customerInfo={customerInfo}
                    products={cart.map(item => ({
                      name: item.product.name,
                      price: parseFloat(item.product.sale_price || item.product.price),
                      quantity: item.quantity
                    }))}
                    onOrderComplete={handleOrderComplete}
                    onBack={() => setCurrentStep(2)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-3 pb-3 border-b">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-orange-600">
                        ${(parseFloat(item.product.sale_price || item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${calculateTax().toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-orange-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              {/* Trust Badges */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2 text-sm">Secure Checkout</h3>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    256-bit SSL encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    Money-back guarantee
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    Instant email confirmation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}
