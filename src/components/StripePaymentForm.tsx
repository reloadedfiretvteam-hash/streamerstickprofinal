import { useState, useEffect, useRef } from 'react';
import { Shield, Lock, CreditCard, AlertCircle } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

// Stripe types - using interface to avoid 'any'
interface StripeInstance {
  elements: (options: Record<string, unknown>) => StripeElements;
  confirmPayment: (options: Record<string, unknown>) => Promise<StripePaymentResult>;
}

interface StripeElements {
  create: (type: string) => StripeElement;
}

interface StripeElement {
  mount: (selector: string) => void;
  unmount: () => void;
}

interface StripePaymentIntentResult {
  id: string;
  status: string;
}

interface StripePaymentResult {
  error?: { message?: string };
  paymentIntent?: StripePaymentIntentResult;
}

declare global {
  interface Window {
    Stripe: (key: string) => StripeInstance;
  }
}

export default function StripePaymentForm({ 
  amount, 
  clientSecret, 
  onSuccess, 
  onError 
}: StripePaymentFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [stripe, setStripe] = useState<StripeInstance | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const cardElementRef = useRef<StripeElement | null>(null);
  const cardMounted = useRef(false);

  useEffect(() => {
    const initializeStripe = async () => {
      if (!window.Stripe) {
        setErrorMessage('Stripe.js failed to load');
        return;
      }

      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

      if (!publishableKey) {
        setErrorMessage('Stripe configuration missing');
        return;
      }

      try {
        const stripeInstance = window.Stripe(publishableKey);
        setStripe(stripeInstance);

        const elementsInstance = stripeInstance.elements({
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#3b82f6',
              colorBackground: '#ffffff',
              colorText: '#1f2937',
              colorDanger: '#ef4444',
              fontFamily: 'system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '8px',
            },
          },
        });
        setElements(elementsInstance);

        // Create and mount card element
        const cardElement = elementsInstance.create('payment');
        cardElementRef.current = cardElement;
        
        // Wait for the container to be in the DOM
        setTimeout(() => {
          const container = document.getElementById('stripe-card-element');
          if (container && !cardMounted.current) {
            cardElement.mount('#stripe-card-element');
            cardMounted.current = true;
          }
        }, 100);
      } catch (e) {
        console.error('Stripe initialization failed:', e);
        setErrorMessage('Failed to load secure payment form');
      }
    };

    if (clientSecret) {
      initializeStripe();
    }

    return () => {
      if (cardElementRef.current && cardMounted.current) {
        try {
          cardElementRef.current.unmount();
        } catch {
          // Element may already be unmounted
        }
        cardMounted.current = false;
      }
    };
  }, [clientSecret]);

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    
    setPaymentStatus('loading');
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-success',
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentStatus('error');
        setErrorMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        if (paymentIntent.status === 'succeeded') {
          setPaymentStatus('success');
          // Extract payment intent ID - paymentIntent should have an id property
          const paymentIntentId = paymentIntent.id || '';
          if (paymentIntentId) {
            onSuccess(paymentIntentId);
          } else {
            // Fallback: extract from clientSecret (format: pi_xxxxx_secret_yyyyy)
            const secretParts = clientSecret.split('_secret_');
            if (secretParts.length > 0 && secretParts[0].startsWith('pi_')) {
              onSuccess(secretParts[0]);
            } else {
              onError('Payment succeeded but could not retrieve payment ID');
            }
          }
        } else if (paymentIntent.status === 'requires_action') {
          // Handle 3D Secure or other authentication
          setPaymentStatus('loading');
        } else {
          setPaymentStatus('error');
          setErrorMessage(`Payment status: ${paymentIntent.status}`);
          onError(`Payment status: ${paymentIntent.status}`);
        }
      } else {
        setPaymentStatus('error');
        setErrorMessage('Payment could not be completed');
        onError('Payment could not be completed');
      }
    } catch (e: unknown) {
      setPaymentStatus('error');
      const errorMsg = e instanceof Error ? e.message : 'Payment failed';
      setErrorMessage(errorMsg);
      onError(errorMsg);
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
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" 
            alt="Visa" 
            className="h-6 object-contain" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" 
            alt="Mastercard" 
            className="h-6 object-contain" 
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" 
            alt="American Express" 
            className="h-6 object-contain" 
          />
        </div>
      </div>

      <div id="stripe-card-element" className="min-h-[100px] p-4 border border-gray-200 rounded-lg bg-gray-50"></div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={paymentStatus === 'loading' || !stripe || !elements}
        className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          <span>PCI Compliant</span>
        </div>
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Payments processed securely by Stripe
      </p>
    </div>
  );
}
