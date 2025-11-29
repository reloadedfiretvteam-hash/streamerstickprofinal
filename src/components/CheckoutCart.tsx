import { useState } from 'react';
import { X, Plus, Minus, CreditCard, Lock, AlertCircle, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import OrderConfirmation from './OrderConfirmation';
import LegalDisclaimer from './LegalDisclaimer';
import StripePaymentForm from './StripePaymentForm';
import ValidatedImage from './ValidatedImage';

// Fallback image for cart items
const FALLBACK_CART_IMAGE = 'https://images.pexels.com/photos/5474028/pexels-photo-5474028.jpeg?auto=compress&cs=tinysrgb&w=200';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart?: () => void;
}

export default function CheckoutCart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onClearCart }: Props) {
  // Customer form fields - ALL REQUIRED
  const [customerName, setCustomerName] = useState('');
  const [username, setUsername] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [processing, setProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    purchaseCode: string;
    items: Array<{ product_name: string; quantity: number; total_price: number }>;
    total: number;
    paymentMethod: string;
    customerEmail: string;
    btcAmount?: string | null;
    btcAddress?: string | null;
    cashAppTag?: string | null;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Stripe payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [creatingPaymentIntent, setCreatingPaymentIntent] = useState(false);

  const SHOP_OWNER_EMAIL = 'reloadedfiretvteam@gmail.com';
  const SERVICE_PORTAL_URL = 'http://ky-tv.cc';

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const generatePurchaseCode = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('generate_purchase_code');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating purchase code:', error);
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 7).toUpperCase();
      return `PC-${timestamp}-${random}`;
    }
  };

  // Generate 8–9 character username/password using customer name + random letters/numbers
  const generateCredential = (baseName: string): string => {
    const cleaned = (baseName || 'user')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
    const prefix = cleaned.slice(0, 4) || 'user';
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = 8 + Math.floor(Math.random() * 2); // 8 or 9
    let suffix = '';
    while ((prefix + suffix).length < length) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return (prefix + suffix).slice(0, length);
  };

  const createStripePaymentIntent = async () => {
    // Validate form first
    if (!validateAllFields()) {
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
          amount: total,
          customerEmail: customerEmail,
          customerName: customerName,
          customerPhone: customerPhone,
          shippingAddress: customerAddress,
          orderDescription: items.map(item => `${item.name} x${item.quantity}`).join(', '),
          items: items.map(item => ({
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            price: item.price
          }))
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
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    setProcessing(true);
    try {
      const purchaseCode = await generatePurchaseCode();
      const generatedUsername = username.trim() || generateCredential(customerName);
      const generatedPassword = generateCredential(customerName);

      // Store order in database
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || null,
          shipping_address: customerAddress || null,
          total_amount: total.toFixed(2),
          payment_method: 'stripe',
          payment_intent_id: paymentIntentId,
          purchase_code: purchaseCode,
          status: 'paid',
          items: items.map(item => ({
            product_id: item.productId,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity
          }))
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error storing order:', orderError);
      }

      // Set order data for confirmation
      setOrderData({
        purchaseCode,
        orderNumber: orderResult?.id || purchaseCode,
        items: items.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          total_price: item.price * item.quantity
        })),
        total,
        paymentMethod: 'Credit Card (Stripe)',
        customerEmail,
        btcAmount: null,
        btcAddress: null,
        cashAppTag: null
      });

      // Send email notification
      try {
        await supabase.functions.invoke('send-order-emails', {
          body: {
            customerEmail,
            customerName,
            purchaseCode,
            orderId: orderResult?.id,
            items: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            total,
            paymentMethod: 'Credit Card (Stripe)',
            adminEmail: SHOP_OWNER_EMAIL,
            generatedUsername,
            generatedPassword,
            portalUrl: SERVICE_PORTAL_URL
          }
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }

      // Clear cart and show confirmation
      if (onClearCart) onClearCart();
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error processing order:', error);
      setPaymentError('Payment successful but order processing failed. Please contact support with your payment confirmation.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'name':
        if (!value.trim()) errors.name = 'Full name is required';
        else if (value.trim().length < 2) errors.name = 'Name must be at least 2 characters';
        break;
      case 'username':
        if (!value.trim()) errors.username = 'Username is required';
        else if (value.trim().length < 3) errors.username = 'Username must be at least 3 characters';
        break;
      case 'email':
        if (!value.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Invalid email format';
        break;
      case 'phone':
        if (!value.trim()) errors.phone = 'Phone number is required';
        else if (!/^\+?[\d\s\-()]{10,}$/.test(value)) errors.phone = 'Invalid phone number';
        break;
      case 'address':
        if (!value.trim()) errors.address = 'Shipping address is required';
        else if (value.trim().length < 10) errors.address = 'Please enter complete address';
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      ...errors,
      [field]: errors[field] || ''
    }));
  };

  const validateAllFields = () => {
    const errors: Record<string, string> = {};

    if (!customerName.trim()) errors.name = 'Full name is required';
    if (!username.trim()) errors.username = 'Username is required';
    if (!customerEmail.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) errors.email = 'Invalid email format';
    if (!customerPhone.trim()) errors.phone = 'Phone number is required';
    if (!customerAddress.trim()) errors.address = 'Shipping address is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 bottom-0 w-full sm:max-w-xl md:max-w-2xl bg-gray-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-gray-800 bg-gray-900">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Your Cart ({items.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={item.productId} className="bg-gray-800 rounded-lg p-4 flex gap-4">
                    {item.image && (
                      <ValidatedImage
                        src={item.image}
                        fallbackSrc={FALLBACK_CART_IMAGE}
                        alt={item.name}
                        className="w-20 h-20 object-contain rounded"
                        minBytes={1000}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-2 text-sm">{item.name}</h3>
                      <p className="text-orange-400 font-bold text-lg">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-gray-700 rounded">
                          <Minus className="w-4 h-4 text-gray-400" />
                        </button>
                        <span className="text-white w-8 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)} className="p-1 hover:bg-gray-700 rounded">
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => onRemoveItem(item.productId)} className="ml-auto text-red-400 hover:text-red-300 text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span className="text-orange-400">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Secure Payment Section */}
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-green-400" />
                  Secure Payment
                </h3>

                {paymentError && (
                  <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-medium">Payment Error</p>
                      <p className="text-red-300 text-sm">{paymentError}</p>
                    </div>
                  </div>
                )}

                {!clientSecret ? (
                  <div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-6 h-6 text-blue-400" />
                        <h4 className="text-white font-bold">Credit/Debit Card</h4>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">
                        Pay securely with your credit or debit card via Stripe.
                      </p>
                      <ul className="text-gray-400 text-xs space-y-1">
                        <li className="flex items-center gap-2">
                          <Shield className="w-3 h-3 text-blue-400" />
                          PCI-compliant secure payment processing
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-3 h-3 text-blue-400" />
                          Your card details are never stored
                        </li>
                      </ul>
                    </div>
                    <p className="text-gray-400 text-sm text-center">
                      Fill in your information below, then click "Continue to Payment"
                    </p>
                  </div>
                ) : (
                  <StripePaymentForm
                    amount={total}
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </div>

              {/* Customer Information Form */}
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Your Information (All Fields Required)</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        validateField('name', e.target.value);
                      }}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                      required
                    />
                    {validationErrors.name && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Username *</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        validateField('username', e.target.value);
                      }}
                      placeholder="johndoe123"
                      className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                      required
                    />
                    {validationErrors.username && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Email Address *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        validateField('email', e.target.value);
                      }}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                      required
                    />
                    {validationErrors.email && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Phone Number *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        validateField('phone', e.target.value);
                      }}
                      placeholder="(555) 123-4567"
                      className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                      required
                    />
                    {validationErrors.phone && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2 text-sm">Shipping Address *</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => {
                        setCustomerAddress(e.target.value);
                        validateField('address', e.target.value);
                      }}
                      placeholder="123 Main Street, City, State, ZIP"
                      className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.address ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-orange-500'
                      }`}
                      required
                    />
                    {validationErrors.address && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Disclaimer - Before Purchase */}
              <div className="mb-6">
                <LegalDisclaimer variant="checkout" />
              </div>

              {/* Continue to Payment / Processing Button */}
              {!clientSecret && (
                <button
                  onClick={createStripePaymentIntent}
                  disabled={processing || creatingPaymentIntent}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 mb-8"
                >
                  {creatingPaymentIntent ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Initializing Payment...
                    </>
                  ) : processing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Continue to Payment - ${total.toFixed(2)}
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showConfirmation && orderData && (
        <OrderConfirmation
          {...orderData}
          onClose={() => {
            setShowConfirmation(false);
            setCustomerName('');
            setUsername('');
            setCustomerEmail('');
            setCustomerPhone('');
            setCustomerAddress('');
            if (onClearCart) onClearCart();
            onClose();
          }}
        />
      )}
    </div>
  );
}
