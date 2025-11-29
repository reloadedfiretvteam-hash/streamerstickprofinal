import { useState, useEffect } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';

interface StripePaymentFormProps {
  amount: number;
  customerInfo?: {
    email: string;
    fullName: string;
    address?: string;
    city?: string;
    zipCode?: string;
  };
  onSubmit: (paymentIntentId: string) => Promise<void>;
  onError?: (error: string) => void;
}

let stripePromise: Promise<Stripe | null> | null = null;

const getStripePublishableKey = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'stripe_publishable_key')
      .single();

    if (error || !data) {
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

function StripeFormInner({ amount, customerInfo, onSubmit, onError }: StripePaymentFormProps) {
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
      // Create PaymentIntent via Supabase Edge Function or API
      const { data: paymentIntentData, error: intentError } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          customerInfo: customerInfo
        }
      });

      if (intentError) {
        throw new Error(intentError.message || 'Failed to create payment intent. Please configure your backend.');
      }

      const clientSecret = paymentIntentData?.clientSecret;

      if (!clientSecret) {
        throw new Error('Backend error: No client secret returned. Please configure your Stripe backend endpoint.');
      }

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo?.fullName || 'Customer',
            email: customerInfo?.email,
            address: customerInfo?.address ? {
              line1: customerInfo.address,
              city: customerInfo.city,
              postal_code: customerInfo.zipCode,
            } : undefined
          }
        }
      });

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded' && paymentIntent.id) {
        await onSubmit(paymentIntent.id);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred processing your payment';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
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
          color: '#9ca3af',
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white font-semibold mb-2 text-sm">
          Card Information
        </label>
        <div className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200">
            <strong>Secure:</strong> Your payment is processed securely by Stripe. Card details are never stored on our servers.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
}

export default function StripePaymentForm({ amount, customerInfo, onSubmit, onError }: StripePaymentFormProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeStripe().then(stripeInstance => {
      setStripe(stripeInstance);
      setLoading(false);
      if (!stripeInstance) {
        const errorMsg = 'Stripe could not be initialized. Please configure your Stripe publishable key in admin settings.';
        setError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      }
    });
  }, [onError]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading payment form...</span>
        </div>
      </div>
    );
  }

  if (error && !stripe) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
        <div className="flex items-center gap-2 text-red-200 text-sm">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stripe) {
    return null;
  }

  return (
    <Elements stripe={stripe}>
      <StripeFormInner
        amount={amount}
        customerInfo={customerInfo}
        onSubmit={onSubmit}
        onError={onError}
      />
    </Elements>
  );
}

