import { useState, useEffect } from 'react';
import { Shield, Lock, Package, CheckCircle, AlertCircle, ArrowRight, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import StripePaymentForm from '../components/StripePaymentForm';
import { generateCredentials } from '../utils/credentialsGenerator';

interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  category: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export default function StripeSecureCheckoutPage() {
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
    phone: ''
  });

  // Check for product ID in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product') || window.location.pathname.split('/').pop();
    
    if (productId && productId !== 'stripe-checkout') {
      loadSingleProduct(productId);
    } else {
      loadProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSingleProduct(productId: string) {
    try {
      const { data, error } = await supabase
        .from('real_products')
        .select('*')
        .eq('id', productId)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      
      if (data) {
        setSelectedProduct(data);
        setStep('checkout');
      } else {
        // Product not found, load all products
        loadProducts();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      loadProducts();
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from('real_products')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    setStep('checkout');
    setClientSecret(null);
    setPaymentError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBackToProducts() {
    setStep('select');
    setSelectedProduct(null);
    setClientSecret(null);
    setPaymentError(null);
  }

  async function createPaymentIntent() {
    if (!selectedProduct || !customerInfo.email || !customerInfo.name) {
      setPaymentError('Please fill in your name and email');
      return;
    }

    setCreatingPaymentIntent(true);
    setPaymentError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          realProductId: selectedProduct.id,
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
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
    console.log('Payment successful:', paymentIntentId);
    
    if (!selectedProduct) {
      console.error('No product selected when payment succeeded');
      setPaymentError('Payment succeeded but order could not be created. Please contact support.');
      return;
    }

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      // Prepare order items
      const orderItems = [{
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: 1,
        unit_price: selectedProduct.sale_price || selectedProduct.price,
        total_price: selectedProduct.sale_price || selectedProduct.price
      }];

      const totalAmount = selectedProduct.sale_price || selectedProduct.price;

      // Save order to database
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone || null,
          shipping_address: null, // Digital product, no shipping needed
          subtotal: totalAmount,
          tax: 0,
          total: totalAmount,
          total_amount: totalAmount.toString(),
          payment_method: 'stripe',
          payment_intent_id: paymentIntentId,
          payment_status: 'completed',
          order_status: 'processing',
          status: 'processing',
          items: orderItems,
          notes: `Payment method: stripe, Payment Intent ID: ${paymentIntentId}`
        })
        .select();

      if (error) {
        console.error('Order creation failed:', error);
        throw error;
      }

      console.log('Order created successfully:', data);
      
      // Generate username and password for customer
      const credentials = generateCredentials(customerInfo.name);
      
      // Save credentials to order (update order with credentials)
      if (data && data[0]) {
        await supabase
          .from('orders')
          .update({
            customer_username: credentials.username,
            customer_password: credentials.password,
            service_url: credentials.serviceUrl,
            notes: `${data[0].notes || ''}\n\nCredentials Generated:\nUsername: ${credentials.username}\nPassword: ${credentials.password}\nService URL: ${credentials.serviceUrl}`
          })
          .eq('id', data[0].id);
      }

      // Send first email (greeting/confirmation)
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/send-order-emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderCode: orderNumber,
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            totalUsd: totalAmount,
            paymentMethod: 'stripe',
            products: orderItems.map(item => ({
              name: item.product_name,
              price: item.unit_price,
              quantity: item.quantity
            })),
            shippingAddress: 'Digital Product - No Shipping Required',
            adminEmail: 'reloadedfirestvteam@gmail.com',
            orderId: data?.[0]?.id,
            paymentIntentId: paymentIntentId
          }),
        });
        console.log('First email (confirmation) sent');
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the order if email fails
      }

      // Send second email (credentials) - can be immediate or delayed
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        await fetch(`${supabaseUrl}/functions/v1/send-credentials-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            username: credentials.username,
            password: credentials.password,
            serviceUrl: credentials.serviceUrl,
            orderNumber: orderNumber,
            productName: selectedProduct.name,
            totalAmount: totalAmount,
            youtubeTutorialUrl: 'https://www.youtube.com/watch?v=fDjDH_WAvYI'
          }),
        });
        console.log('Second email (credentials) sent');
      } catch (emailError) {
        console.error('Error sending credentials email:', emailError);
        // Don't fail the order if email fails
      }

      setStep('success');
    } catch (error) {
      console.error('Error saving order after payment:', error);
      setPaymentError('Payment succeeded but order could not be saved. Please contact support with your payment ID: ' + paymentIntentId);
      // Still show success since payment went through, but warn user
    }
  }

  function handlePaymentError(error: string) {
    setPaymentError(error);
  }

  const totalAmount = selectedProduct 
    ? (selectedProduct.sale_price || selectedProduct.price) 
    : 0;

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
              <p className="font-bold text-lg text-gray-900">${totalAmount.toFixed(2)}</p>
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
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg flex items-center justify-center">
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
              Select a professional service below. All payments are processed securely via Stripe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border border-slate-200 overflow-hidden transform hover:scale-105"
              >
                <div className="h-48 overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 relative">
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
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-purple-600">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {product.name}
                  </h3>

                  <p className="text-slate-600 mb-4 min-h-[60px] text-sm">
                    {product.short_description || product.description}
                  </p>

                  <div className="flex items-end justify-between mb-4">
                    <div>
                      {product.sale_price ? (
                        <>
                          <span className="text-lg text-slate-400 line-through mr-2">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-3xl font-bold text-slate-800">
                            ${product.sale_price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-slate-800">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectProduct(product)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Secure Payment</h3>
                <p className="text-slate-600 text-sm">
                  All transactions processed through Stripe's secure payment gateway
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
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
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
                <Package className="w-5 h-5 text-purple-600" />
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
                      <p className="text-sm text-slate-500 mt-1">{selectedProduct.short_description}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-lg font-bold text-slate-800">Total</span>
                    <span className="text-2xl font-bold text-purple-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-purple-800">
                    This transaction will appear as <strong>"PRO DIGITAL SERVICES"</strong> on your statement.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Contact Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-md">
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
                  <p className="text-slate-600 mb-6">
                    Fill in your contact information above, then click below to proceed to payment.
                  </p>
                  <button
                    onClick={createPaymentIntent}
                    disabled={creatingPaymentIntent || !customerInfo.name || !customerInfo.email}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 text-white rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                  >
                    {creatingPaymentIntent ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Initializing...
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
