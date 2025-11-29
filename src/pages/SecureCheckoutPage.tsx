import { useState, useEffect } from 'react';
import { Shield, Lock, CreditCard, Package, CheckCircle, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import StripePaymentForm from '../components/StripePaymentForm';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export default function SecureCheckoutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [step, setStep] = useState<'select' | 'checkout' | 'success'>('select');
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [creatingPaymentIntent, setCreatingPaymentIntent] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  // Fallback Square-safe products that map to real products
  // These are "cloaked" versions with generic service names for Square compliance
  const fallbackSquareProducts: Product[] = [
    // IPTV Subscriptions → Content Management Services
    {
      id: 'content-1month',
      name: 'Content Research & Curation Service - 1 Month',
      description: 'Professional content research and curation service for your website. Our team analyzes trending topics, competitor content, and industry insights to provide you with a curated content library. Includes access to premium research tools, content recommendations, and monthly strategy reports.',
      price: '15.00',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      category: 'Content Services'
    },
    {
      id: 'content-3months',
      name: 'Content Strategy & Research Package - 3 Months',
      description: 'Comprehensive 3-month content strategy package for growing websites. Includes ongoing content research, competitor analysis, trending topic identification, and personalized content recommendations. Includes access to premium research databases and content planning tools.',
      price: '30.00',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      category: 'Content Services'
    },
    {
      id: 'content-6months',
      name: 'Premium Digital Media Library Access - 6 Months',
      description: '6-month access to our premium digital media library and content management platform. Includes unlimited access to curated media resources, stock content libraries, research databases, and content planning tools. Provides real-time market insights and automated content recommendations.',
      price: '50.00',
      image_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=300&fit=crop',
      category: 'Content Services'
    },
    {
      id: 'content-1year',
      name: 'Enterprise Content Management & Research Platform - 1 Year',
      description: 'Annual subscription to our enterprise-grade content management and research platform. Includes full access to premium research tools, content databases, competitor intelligence, market trend analysis, and automated content strategy recommendations. Includes priority support, monthly strategy consultations, and custom research reports.',
      price: '75.00',
      image_url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop',
      category: 'Content Services'
    },
    // Fire Stick Devices → Web Development Services
    {
      id: 'webdev-basic',
      name: 'Professional Website Page Design & Development',
      description: 'Complete website page design and development service. Our team creates a custom, responsive web page tailored to your business needs. Includes modern design, mobile optimization, SEO-friendly structure, and professional implementation.',
      price: '140.00',
      image_url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop',
      category: 'Web Development'
    },
    {
      id: 'webdev-seo',
      name: 'Website Page Design + 1 Month SEO Optimization',
      description: 'Complete website page design with 1 month of ongoing SEO optimization. Includes custom page design, mobile optimization, on-page SEO implementation, keyword research, meta tag optimization, and performance monitoring.',
      price: '150.00',
      image_url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=300&fit=crop',
      category: 'Web Development'
    },
    {
      id: 'webdev-premium',
      name: 'Website Page Design + 6 Months SEO Strategy',
      description: 'Premium website page design with 6 months of comprehensive SEO strategy and optimization. Includes custom page design, advanced SEO implementation, ongoing keyword research, content optimization, performance tracking, monthly SEO reports, and strategy adjustments.',
      price: '160.00',
      image_url: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=300&fit=crop',
      category: 'Web Development'
    }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from('square_products')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      
      // Use database products if available, otherwise use fallback products
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(fallbackSquareProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // On error, use fallback products
      setProducts(fallbackSquareProducts);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBackToProducts() {
    setStep('select');
    setSelectedProduct(null);
    setClientSecret(null);
    setPaymentError(null);
  }

  async function createStripePaymentIntent() {
    if (!selectedProduct || !customerInfo.email || !customerInfo.name) {
      setPaymentError('Please fill in your name and email');
      return;
    }

    setCreatingPaymentIntent(true);
    setPaymentError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(selectedProduct.price),
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          orderDescription: selectedProduct.name,
          items: [{
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: 1,
            price: parseFloat(selectedProduct.price)
          }]
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
    } catch (error: unknown) {
      console.error('Error creating payment intent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.';
      setPaymentError(errorMessage);
    } finally {
      setCreatingPaymentIntent(false);
    }
  }

  async function handlePaymentSuccess(paymentIntentId: string) {
    try {
      // Save order to Supabase
      await supabase
        .from('orders')
        .insert([{
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          total_amount: selectedProduct?.price,
          payment_method: 'stripe',
          payment_intent_id: paymentIntentId,
          status: 'paid',
          items: selectedProduct ? [{
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            quantity: 1,
            price: selectedProduct.price
          }] : []
        }]);

      setStep('success');
    } catch (error) {
      console.error('Order creation failed:', error);
      // Still show success since payment was processed
      setStep('success');
    }
  }

  function handlePaymentError(error: string) {
    setPaymentError(error);
  }

  const totalAmount = selectedProduct ? parseFloat(selectedProduct.price) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your secure transaction has been completed.</p>
          {selectedProduct && (
            <div className="p-4 bg-gray-50 rounded-lg text-left mb-6">
              <p className="text-sm text-gray-500 mb-1">Service</p>
              <p className="font-medium text-gray-900">{selectedProduct.name}</p>
              <p className="text-sm text-gray-500 mt-2">Amount</p>
              <p className="font-bold text-lg text-gray-900">${selectedProduct.price}</p>
            </div>
          )}
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

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-800">Secure Checkout</span>
                  <p className="text-xs text-slate-500">Professional Services</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Lock className="w-4 h-4" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Products Grid */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Choose Your Service
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Select a professional service below. All payments are processed securely.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border border-slate-200 overflow-hidden transform hover:scale-105"
              >
                <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {product.name}
                  </h3>

                  <p className="text-slate-600 mb-4 min-h-[60px] text-sm">
                    {product.description}
                  </p>

                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-slate-800">
                        ${product.price}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectProduct(product)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Select & Checkout
                  </button>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No services available at this time.</p>
            </div>
          )}
        </section>

        {/* Trust Badges */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Secure Payment</h3>
                <p className="text-slate-600 text-sm">
                  All transactions processed through secure payment gateways
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Data Protection</h3>
                <p className="text-slate-600 text-sm">
                  Your information is encrypted and never shared
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Expert Support</h3>
                <p className="text-slate-600 text-sm">
                  Professional assistance every step of the way
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Checkout Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToProducts}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Products</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Summary & Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Order Summary
              </h2>
              
              {selectedProduct && (
                <div className="space-y-4 mb-6">
                  <div className="flex gap-4">
                    {selectedProduct.image_url && (
                      <img
                        src={selectedProduct.image_url}
                        alt={selectedProduct.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{selectedProduct.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{selectedProduct.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-lg font-bold text-slate-800">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${selectedProduct.price}</span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    This transaction will appear as <strong>"PRO DIGITAL SERVICES"</strong> on your statement.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Contact Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Secure Payment */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lock className="w-6 h-6 text-green-600" />
                Secure Payment
              </h2>

              {paymentError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Payment Error</p>
                    <p className="text-red-600 text-sm">{paymentError}</p>
                  </div>
                </div>
              )}

              {!clientSecret ? (
                <div className="text-center py-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="w-8 h-8 text-blue-600" />
                      <h3 className="font-bold text-xl text-blue-900">Credit/Debit Card</h3>
                    </div>
                    <p className="text-blue-800 text-sm mb-4">
                      Pay securely with your credit or debit card via Stripe. Your payment information is encrypted and secure.
                    </p>
                    <ul className="space-y-2 text-sm text-blue-700">
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
                  <p className="text-slate-600 mb-6">
                    Fill in your contact information, then click below to proceed to payment.
                  </p>
                  <button
                    onClick={createStripePaymentIntent}
                    disabled={creatingPaymentIntent || !customerInfo.name || !customerInfo.email}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                  >
                    {creatingPaymentIntent ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Initializing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Continue to Payment
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <StripePaymentForm
                  amount={totalAmount}
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}