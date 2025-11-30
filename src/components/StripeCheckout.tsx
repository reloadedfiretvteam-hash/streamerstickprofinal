import { useState, useEffect } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface StripeCheckoutProps {
  items: CartItem[];
  total: number;
  customerInfo: {
    email: string;
    fullName: string;
    address: string;
    city: string;
    zipCode: string;
  };
}

// Initialize Stripe with publishable key from Supabase
let stripePromise: Promise<Stripe | null> | null = null;

const getStripePublishableKey = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'stripe_publishable_key')
      .single();

    if (error || !data) {
      // Fallback to environment variable
      return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || null;
    }

    return data.setting_value || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || null;
  } catch (error) {
    console.error('Error fetching Stripe key:', error);
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || null;
  }
};

const initializeStripe = async (): Promise<Stripe | null> => {
  if (stripePromise) return stripePromise;
  
  stripePromise = (async () => {
    const publishableKey = await getStripePublishableKey();
    if (!publishableKey) {
      console.error('Stripe publishable key not found');
      return null;
    }
    return loadStripe(publishableKey);
  })();
  
  return stripePromise;
};

// Inner component that uses Stripe hooks
function StripeCheckoutForm({ items, total: _total, customerInfo, onSuccess, onError }: StripeCheckoutProps & { onSuccess: () => void; onError: (error: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please wait...');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      return;
    }

    setIsProcessing(true);

    try {
      // Create PaymentIntent using the unified stripe-payment-intent function
      // For cart checkout, we use the first product ID
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('Payment service configuration error. Please contact support.');
      }
      
      const productId = items.length > 0 ? items[0].productId : 'cart-checkout';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          customerEmail: customerInfo.email,
          customerName: customerInfo.fullName,
        }),
      });

      const paymentIntentData = await response.json();

      if (!response.ok) {
        throw new Error(paymentIntentData.error || 'Unable to initialize payment. Please verify product is active and Stripe keys are set.');
      }

      const clientSecret = paymentIntentData?.clientSecret;

      if (!clientSecret) {
        throw new Error('Unable to initialize payment. Please verify product is active and Stripe keys are set.');
      }

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.fullName,
            email: customerInfo.email,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              postal_code: customerInfo.zipCode,
            }
          }
        }
      });

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        // Save order to database
        const orderItems = items.map(item => ({
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }));

        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_name: customerInfo.fullName,
            customer_email: customerInfo.email,
            shipping_address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.zipCode}`,
            payment_method: 'stripe',
            payment_status: 'completed',
            payment_intent_id: paymentIntent.id,
            order_status: 'processing',
            subtotal: total,
            tax: 0,
            total: total,
            items: orderItems
          });

        if (orderError) {
          console.error('Order save error:', orderError);
          // Payment succeeded but order save failed - this should be handled
          throw new Error('Payment succeeded but order could not be saved. Please contact support.');
        }

        onSuccess();
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred processing your payment');
      onError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, sans-serif',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: false,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-white font-semibold mb-2">
          Card Information
        </label>
        <div className="px-4 py-4 bg-white/5 border border-white/20 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <strong>Your payment is secure:</strong> We use Stripe's secure payment processing.
            Your card details are never stored on our servers and are processed directly by Stripe.
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isProcessing ? (
          <>
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-6 h-6" />
            Pay ${total.toFixed(2)} Securely
          </>
        )}
      </button>

      <p className="text-center text-gray-400 text-sm">
        By completing this purchase, you agree to our Terms of Service
      </p>
    </form>
  );
}

// Main component
export default function StripeCheckout({ items, total, customerInfo }: StripeCheckoutProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initializeStripe().then(stripeInstance => {
      setStripe(stripeInstance);
      setLoading(false);
      if (!stripeInstance) {
        setError('Stripe could not be initialized. Please check your Stripe publishable key in admin settings.');
      }
    });
  }, []);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Payment Successful!</h2>
          <p className="text-blue-200 mb-6">
            Your order has been confirmed. Redirecting to order details...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading secure payment form...</p>
        </div>
      </div>
    );
  }

  if (error && !stripe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/50 max-w-md w-full text-center">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Configuration Error</h2>
          <p className="text-red-200 mb-6">{error}</p>
          <p className="text-gray-400 text-sm">
            Please configure your Stripe publishable key in the admin panel under Payment Settings.
          </p>
        </div>
      </div>
    );
  }

  if (!stripe) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-green-400" />
            <h1 className="text-4xl font-bold text-white">Secure Payment</h1>
          </div>
          <p className="text-blue-200 text-lg">
            SSL Encrypted • PCI Compliant • 100% Secure
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="mb-8 pb-6 border-b border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between text-white">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-white/20 flex justify-between text-xl font-bold text-white">
                <span>Total</span>
                <span className="text-green-400">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Elements stripe={stripe}>
            <StripeCheckoutForm
              items={items}
              total={total}
              customerInfo={customerInfo}
              onSuccess={() => {
                setSuccess(true);
                setTimeout(() => {
                  window.location.href = '/order-confirmation';
                }, 2000);
              }}
              onError={(err) => {
                setError(err);
              }}
            />
          </Elements>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-gray-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-sm">256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">PCI Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Money Back Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
