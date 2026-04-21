import { useState, useEffect } from 'react';
import { Shield, Lock, Package, AlertCircle, ArrowRight, Info } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  /** price in cents */
  price: number;
  /** salePrice in cents or null */
  salePrice: number | null;
  imageUrl: string;
  category: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

function displayPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default function StripeSecureCheckoutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [step, setStep] = useState<'select' | 'checkout'>('select');
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product') || window.location.pathname.split('/').pop();
    if (productId && productId !== 'stripe-checkout') {
      loadSingleProduct(productId);
    } else {
      loadAllProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSingleProduct(productId: string) {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}`);
      if (res.ok) {
        const json = await res.json() as { data?: any };
        if (json.data) {
          setSelectedProduct(mapProduct(json.data));
          setStep('checkout');
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error loading single product:', err);
    }
    // Fall back to listing all products
    loadAllProducts();
  }

  async function loadAllProducts() {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json() as { data?: any[] };
        setProducts((json.data || []).map(mapProduct));
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }

  function mapProduct(p: any): Product {
    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: Number(p.price || 0),
      salePrice: p.salePrice != null ? Number(p.salePrice) : null,
      imageUrl: p.imageUrl || '',
      category: p.category || '',
    };
  }

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    setStep('checkout');
    setPaymentError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBackToProducts() {
    setStep('select');
    setSelectedProduct(null);
    setPaymentError(null);
  }

  async function handleCheckout() {
    if (!selectedProduct) return;
    if (!customerInfo.name.trim() || !customerInfo.email.trim()) {
      setPaymentError('Please enter your name and email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      setPaymentError('Please enter a valid email address');
      return;
    }

    setCheckingOut(true);
    setPaymentError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: selectedProduct.id, quantity: 1 }],
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone || undefined,
        }),
      });

      const data = await response.json() as { url?: string; error?: string; details?: string };

      if (!response.ok) {
        throw new Error(data.error || data.details || `Checkout failed (${response.status})`);
      }

      if (!data.url) {
        throw new Error('No checkout URL returned');
      }

      window.location.href = data.url;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.';
      setPaymentError(msg);
      setCheckingOut(false);
    }
  }

  const effectivePriceCents = selectedProduct
    ? (selectedProduct.salePrice ?? selectedProduct.price)
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

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-800">Secure Checkout</span>
                  <p className="text-xs text-slate-500">StreamStick Pro</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Lock className="w-4 h-4" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </nav>

        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Choose Your Service</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Select a product below. All payments are processed securely via Stripe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const priceCents = product.salePrice ?? product.price;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border border-slate-200 overflow-hidden transform hover:scale-105"
                >
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 relative">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
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
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{product.name}</h3>
                    <p className="text-slate-600 mb-4 min-h-[60px] text-sm">{product.description}</p>

                    <div className="flex items-end justify-between mb-4">
                      <div>
                        {product.salePrice != null ? (
                          <>
                            <span className="text-lg text-slate-400 line-through mr-2">
                              ${displayPrice(product.price)}
                            </span>
                            <span className="text-3xl font-bold text-slate-800">
                              ${displayPrice(product.salePrice)}
                            </span>
                          </>
                        ) : (
                          <span className="text-3xl font-bold text-slate-800">
                            ${displayPrice(priceCents)}
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
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No services available at this time. <a href="/shop" className="text-blue-600 underline">Browse our shop</a>.</p>
            </div>
          )}
        </section>
      </div>
    );
  }

  // Checkout step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={handleBackToProducts}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Products</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Summary + Contact */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Order Summary
              </h2>

              {selectedProduct && (
                <div className="space-y-4 mb-6">
                  <div className="flex gap-4">
                    {selectedProduct.imageUrl && (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{selectedProduct.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{selectedProduct.description.substring(0, 80)}{selectedProduct.description.length > 80 ? '...' : ''}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-lg font-bold text-slate-800">Total</span>
                    <span className="text-2xl font-bold text-purple-600">${displayPrice(effectivePriceCents)}</span>
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

            {/* Contact Info */}
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
                    placeholder="John Doe"
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
                    placeholder="john@example.com"
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
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Payment */}
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

              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">
                  You'll be securely redirected to Stripe to complete your payment for{' '}
                  <strong>{selectedProduct?.name}</strong>.
                </p>
                <p className="text-2xl font-bold text-purple-600 mb-8">
                  ${displayPrice(effectivePriceCents)}
                </p>

                <div className="flex flex-wrap justify-center gap-3 mb-8 text-sm text-slate-500">
                  <span>✓ Visa / Mastercard</span>
                  <span>✓ Apple Pay</span>
                  <span>✓ Google Pay</span>
                  <span>✓ Cash App Pay</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut || !customerInfo.name || !customerInfo.email}
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 text-white rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto min-w-[200px]"
                >
                  {checkingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Continue to Payment
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-400 mt-4">
                  By continuing, you agree to our terms of service. You will be redirected to Stripe's secure checkout page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
