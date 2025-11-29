import { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, AlertCircle, CreditCard } from 'lucide-react';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';

interface StripePaymentFormProps {
  amount: number;
  onSubmit: (token: string) => Promise<void>;
}

// Get the Stripe publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                              import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export default function StripePaymentForm({ amount, onSubmit }: StripePaymentFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeStripe = async () => {
      if (!stripePublishableKey) {
        setErrorMessage('Stripe configuration missing. Please contact support.');
        return;
      }

      try {
        const stripeInstance = await loadStripe(stripePublishableKey);
        if (!stripeInstance) {
          setErrorMessage('Failed to load payment system');
          return;
        }
        setStripe(stripeInstance);
        
        // Create and mount the card element
        const elements = stripeInstance.elements();
        const card = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#1f2937',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              '::placeholder': {
                color: '#9ca3af',
              },
              iconColor: '#6366f1',
            },
            invalid: {
              color: '#ef4444',
              iconColor: '#ef4444',
            },
          },
          hidePostalCode: false,
        });
        
        // Wait for the container to be available
        const mountCard = () => {
          const container = document.getElementById('stripe-card-element');
          if (container) {
            card.mount('#stripe-card-element');
            setCardElement(card);
            setIsReady(true);
            
            card.on('change', (event) => {
              if (event.error) {
                setErrorMessage(event.error.message);
              } else {
                setErrorMessage('');
              }
            });
          } else {
            // Retry mounting if container not ready
            setTimeout(mountCard, 100);
          }
        };
        
        mountCard();
      } catch (e) {
        console.error('Stripe initialization failed:', e);
        setErrorMessage('Failed to load secure payment form');
      }
    };

    initializeStripe();
    
    return () => {
      // Cleanup: unmount card element when component unmounts
      if (cardElement) {
        cardElement.unmount();
      }
    };
  }, []);

  const handlePayment = useCallback(async () => {
    if (!stripe || !cardElement) {
      setErrorMessage('Payment system not ready. Please refresh and try again.');
      return;
    }
    
    setPaymentStatus('loading');
    setErrorMessage('');

    try {
      // Create a payment method using Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      if (paymentMethod) {
        // Pass the payment method ID to the onSubmit handler
        await onSubmit(paymentMethod.id);
        setPaymentStatus('success');
      }
    } catch (e: unknown) {
      setPaymentStatus('error');
      setErrorMessage(e instanceof Error ? e.message : 'Payment failed. Please try again.');
    }
  }, [stripe, cardElement, onSubmit]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Secure Payment
        </h3>
        <div className="flex gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1280px-PayPal.svg.png" alt="PayPal" className="h-6 object-contain" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <CreditCard className="w-4 h-4 inline mr-1" />
          Card Details
        </label>
        <div 
          id="stripe-card-element" 
          className="p-4 border border-gray-300 rounded-lg bg-gray-50 min-h-[50px] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
        />
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={paymentStatus === 'loading' || !isReady}
        className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {paymentStatus === 'loading' ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>
      
      <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Payments processed securely by Stripe
      </p>
    </div>
  );
}

