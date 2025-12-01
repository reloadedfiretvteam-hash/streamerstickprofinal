import { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Shield, Lock, AlertCircle, CreditCard, Smartphone } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  onSubmit: (paymentIntentId: string) => Promise<void>;
  customerEmail?: string;
  customerName?: string;
}

// Initialize Stripe outside of render to avoid recreating on each render
let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = () => {
  if (!stripePromise) {
    const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (stripePublicKey) {
      stripePromise = loadStripe(stripePublicKey);
    }
  }
  return stripePromise;
};

export default function StripePaymentForm({ amount, onSubmit, customerEmail, customerName }: StripePaymentFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
  const [walletAvailable, setWalletAvailable] = useState<{ applePay: boolean; googlePay: boolean }>({ applePay: false, googlePay: false });

  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await getStripe();
      if (!stripeInstance) {
        setErrorMessage('Stripe configuration missing. Please check VITE_STRIPE_PUBLIC_KEY.');
        return;
      }
      setStripe(stripeInstance);

      // Create payment intent
      try {
        const response = await createPaymentIntent(amount);
        if (!response.clientSecret) {
          setErrorMessage('Unable to initialize payment. Please try again.');
          return;
        }
        
        setClientSecret(response.clientSecret);
        
        // Initialize Elements
        const elementsInstance = stripeInstance.elements({
          clientSecret: response.clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#3b82f6',
              colorBackground: '#ffffff',
              colorText: '#1f2937',
              colorDanger: '#dc2626',
              fontFamily: 'system-ui, sans-serif',
              spacingUnit: '4px',
              borderRadius: '8px',
            },
          },
        });
        setElements(elementsInstance);

        // Mount payment element - use MutationObserver to wait for container
        const mountPaymentElement = () => {
          const container = document.getElementById('stripe-payment-element');
          if (container && container.childNodes.length === 0) {
            // Mount payment element
            const paymentElement = elementsInstance.create('payment', {
              layout: 'tabs',
              paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
              wallets: {
                applePay: 'auto',
                googlePay: 'auto',
              },
            });
            
            paymentElement.mount('#stripe-payment-element');
            
            paymentElement.on('change', () => {
              // Payment element errors are shown inline by Stripe
              setErrorMessage('');
            });
          }
        };
        
        // Try to mount immediately, or wait for container to be ready
        if (document.getElementById('stripe-payment-element')) {
          mountPaymentElement();
        } else {
          // Use requestAnimationFrame to wait for next paint cycle
          requestAnimationFrame(mountPaymentElement);
        }

        // Check wallet availability
        const paymentRequest = stripeInstance.paymentRequest({
          country: 'US',
          currency: 'usd',
          total: {
            label: 'Total',
            amount: Math.round(amount * 100),
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        paymentRequest.canMakePayment().then((result) => {
          if (result) {
            setWalletAvailable({
              applePay: !!result.applePay,
              googlePay: !!result.googlePay,
            });
          }
        });
      } catch (e) {
        console.error('Stripe initialization failed:', e);
        setErrorMessage('Failed to load secure payment form. Please try again.');
      }
    };

    initializeStripe();
  }, [amount]);

  const createPaymentIntent = async (paymentAmount: number): Promise<{ clientSecret: string }> => {
    // Call backend to create a PaymentIntent via Supabase Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Check if environment variables are configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
      throw new Error('Payment system configuration error. Please contact support.');
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-stripe-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          amount: Math.round(paymentAmount * 100), // Convert to cents
          currency: 'usd',
          customerEmail,
          customerName,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (!data.clientSecret) {
          throw new Error('Invalid response from payment server');
        }
        return data;
      }
      
      // Handle non-200 responses
      let errorMessage = 'Failed to initialize payment';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If we can't parse error JSON, use status text
        errorMessage = `Payment server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Payment request timed out. Please check your connection and try again.');
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Unable to connect to payment server. Please check your internet connection and try again.');
        }
        console.error('Error creating payment intent:', error.message);
        throw error;
      }
      throw new Error('An unexpected error occurred. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('Payment system not ready. Please refresh the page.');
      return;
    }
    
    setPaymentStatus('loading');
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          payment_method_data: {
            billing_details: {
              name: customerName,
              email: customerEmail,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentStatus('error');
        setErrorMessage(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('success');
        await onSubmit(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Handle 3D Secure authentication
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/order-confirmation`,
          },
        });
        
        if (confirmError) {
          setPaymentStatus('error');
          setErrorMessage(confirmError.message || 'Authentication failed. Please try again.');
        }
      } else {
        setPaymentStatus('error');
        setErrorMessage('Payment processing failed. Please try again.');
      }
    } catch (e: unknown) {
      setPaymentStatus('error');
      setErrorMessage(e instanceof Error ? e.message : 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Secure Payment
        </h3>
        <div className="flex gap-2 items-center">
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
            className="h-5 object-contain" 
          />
        </div>
      </div>

      {/* Payment Method Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setPaymentMethod('card')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            paymentMethod === 'card'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          Card
        </button>
        {walletAvailable.applePay && (
          <button
            onClick={() => setPaymentMethod('apple_pay')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              paymentMethod === 'apple_pay'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            Apple Pay
          </button>
        )}
        {walletAvailable.googlePay && (
          <button
            onClick={() => setPaymentMethod('google_pay')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              paymentMethod === 'google_pay'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            Google Pay
          </button>
        )}
      </div>

      {/* Stripe Payment Element */}
      <div id="stripe-payment-element" className="min-h-[150px] mb-4"></div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={paymentStatus === 'loading' || !stripe || !elements || !clientSecret}
        className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {paymentStatus === 'loading' ? (
          <span className="animate-pulse flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </span>
        ) : paymentStatus === 'success' ? (
          <span className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Payment Successful!
          </span>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>
      
      <div className="mt-4 space-y-2">
        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Payments processed securely by Stripe
        </p>
        <p className="text-center text-xs text-gray-400">
          Your payment information is encrypted and secure
        </p>
      </div>
    </div>
  );
}
