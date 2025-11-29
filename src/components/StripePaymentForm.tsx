import { useState, useEffect } from 'react';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

interface StripePaymentFormProps {
  amount: number;
  onSubmit: (paymentMethodId: string) => Promise<void>;
}

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe publishable key not configured');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default function StripePaymentForm({ amount, onSubmit }: StripePaymentFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [, setElements] = useState<StripeElements | null>(null);
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await getStripe();
      
      if (!stripeInstance) {
        setErrorMessage('Stripe configuration missing');
        return;
      }

      setStripe(stripeInstance);

      const elementsInstance = stripeInstance.elements();
      setElements(elementsInstance);

      const card = elementsInstance.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
          invalid: {
            color: '#9e2146',
          },
        },
      });

      const container = document.getElementById('stripe-card-element');
      if (container) {
        card.mount('#stripe-card-element');
        setCardElement(card);
        
        card.on('ready', () => {
          setIsReady(true);
        });

        card.on('change', (event) => {
          if (event.error) {
            setErrorMessage(event.error.message);
          } else {
            setErrorMessage('');
          }
        });
      }
    };

    initializeStripe();

    return () => {
      if (cardElement) {
        cardElement.destroy();
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!stripe || !cardElement) return;
    
    setPaymentStatus('loading');
    setErrorMessage('');

    try {
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentMethod) {
        await onSubmit(paymentMethod.id);
        setPaymentStatus('success');
      }
    } catch (e: unknown) {
      setPaymentStatus('error');
      setErrorMessage(e instanceof Error ? e.message : 'Payment failed');
    }
  };

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
        </div>
      </div>

      <div 
        id="stripe-card-element" 
        className="min-h-[50px] p-4 border border-gray-300 rounded-lg bg-white"
      ></div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={paymentStatus === 'loading' || !isReady}
        className="w-full mt-6 py-4 bg-black text-white rounded-lg font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {paymentStatus === 'loading' ? (
          <span className="animate-pulse">Processing...</span>
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
