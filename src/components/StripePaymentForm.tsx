import { useState, useEffect, useRef } from 'react';
import { Shield, Lock, CreditCard, AlertCircle, Smartphone, Wallet, RefreshCw } from 'lucide-react';
import type { Stripe, StripeElements as StripeElementsType, StripePaymentElement, StripePaymentElementChangeEvent, Appearance } from '@stripe/stripe-js';

interface StripePaymentFormProps {
  amount: number;
  clientSecret: string | null;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onRetry?: () => void; // Optional retry callback when clientSecret is missing
}

// Stripe Payment Element appearance configuration
// These styles match the site's design system
const STRIPE_APPEARANCE: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#3b82f6',      // Blue-500 - matches site primary color
    colorBackground: '#ffffff',   // White background
    colorText: '#1f2937',         // Gray-800 - matches site text color
    colorDanger: '#ef4444',       // Red-500 - for error states
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Label': {
      fontWeight: '600',
      marginBottom: '8px',
    },
    '.Input': {
      padding: '12px',
      borderRadius: '8px',
    },
    '.Tab': {
      borderRadius: '8px',
      padding: '12px 16px',
    },
    '.Tab--selected': {
      backgroundColor: '#eff6ff',  // Blue-50 - light blue highlight
      borderColor: '#3b82f6',      // Blue-500 - matching primary
    },
  },
};

/**
 * Stripe Payment Element Form
 * 
 * Uses Stripe's Payment Element which automatically displays ALL payment methods
 * enabled in your Stripe Dashboard, including:
 * - Credit/Debit Cards (Visa, Mastercard, Amex, Discover)
 * - Apple Pay (on supported devices/browsers)
 * - Google Pay (on supported devices/browsers)
 * - Klarna (Buy Now, Pay Later)
 * - Afterpay/Clearpay
 * - And any other methods enabled in Stripe Dashboard
 * 
 * The Payment Element handles all the complexity of displaying appropriate
 * payment methods based on the customer's device, location, and your settings.
 */
export default function StripePaymentForm({ 
  amount, 
  clientSecret, 
  onSuccess, 
  onError,
  onRetry 
}: StripePaymentFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'ready' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElementsType | null>(null);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const paymentElementRef = useRef<StripePaymentElement | null>(null);
  const elementMounted = useRef(false);

  useEffect(() => {
    const initializeStripe = async () => {
      if (!window.Stripe) {
        setErrorMessage('Stripe.js failed to load. Please refresh the page.');
        setPaymentStatus('error');
        return;
      }

      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

      if (!publishableKey) {
        setErrorMessage('Stripe configuration missing. Please contact support.');
        setPaymentStatus('error');
        return;
      }

      setPaymentStatus('loading');

      try {
        const stripeInstance = window.Stripe(publishableKey);
        setStripe(stripeInstance);

        // Create Elements instance with Payment Element appearance
        const elementsInstance = stripeInstance.elements({
          clientSecret,
          appearance: STRIPE_APPEARANCE,
        });
        setElements(elementsInstance);

        // Create the Payment Element - this automatically shows ALL enabled payment methods
        // including Cards, Apple Pay, Google Pay, Klarna, Afterpay, etc.
        const paymentElement = elementsInstance.create('payment', {
          layout: {
            type: 'tabs',
            defaultCollapsed: false,
          },
          // Let Stripe determine which payment methods to display based on
          // - Your Stripe Dashboard settings
          // - Customer's location and device
          // - Payment amount and currency
          business: {
            name: 'Stream Stick Pro',
          },
          fields: {
            billingDetails: {
              name: 'auto',
              email: 'auto',
            },
          },
        });
        
        paymentElementRef.current = paymentElement;
        
        // Listen for when the Payment Element is ready
        paymentElement.on('ready', () => {
          setPaymentStatus('ready');
          setIsPaymentReady(true);
        });

        // Listen for element changes to enable/disable submit button
        paymentElement.on('change', (event: StripePaymentElementChangeEvent) => {
          // StripePaymentElementChangeEvent has 'complete' and 'empty' properties
          // Clear any previous error message when user makes changes
          if (event.complete) {
            setErrorMessage('');
          }
        });
        
        // Wait for the container to be in the DOM, then mount
        setTimeout(() => {
          const container = document.getElementById('stripe-payment-element');
          if (container && !elementMounted.current) {
            paymentElement.mount('#stripe-payment-element');
            elementMounted.current = true;
          }
        }, 100);
      } catch (e) {
        console.error('Stripe initialization failed:', e);
        setErrorMessage('Failed to load secure payment form. Please refresh and try again.');
        setPaymentStatus('error');
      }
    };

    if (clientSecret) {
      initializeStripe();
    }

    return () => {
      if (paymentElementRef.current && elementMounted.current) {
        try {
          paymentElementRef.current.unmount();
        } catch {
          // Element may already be unmounted
        }
        elementMounted.current = false;
      }
    };
  }, [clientSecret]);

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    
    setPaymentStatus('processing');
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
        setPaymentStatus('ready');
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('success');
        onSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Handle 3D Secure or other authentication - Stripe will handle redirect
        setPaymentStatus('processing');
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // Payment is still processing (common with bank transfers)
        setPaymentStatus('processing');
      } else {
        setPaymentStatus('ready');
        setErrorMessage('Payment could not be completed. Please try a different payment method.');
        onError('Payment could not be completed');
      }
    } catch (e: unknown) {
      setPaymentStatus('ready');
      const errorMsg = e instanceof Error ? e.message : 'Payment failed';
      setErrorMessage(errorMsg);
      onError(errorMsg);
    }
  };

  // Handle missing clientSecret - display error with retry option
  if (!clientSecret) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Payment Form</h3>
          <p className="text-gray-600 mb-4">
            We couldn't initialize the payment form. This may be due to a temporary issue.
          </p>
          {onRetry ? (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          ) : (
            <p className="text-sm text-gray-500">Please refresh the page and try again.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      {/* Header with Payment Method Indicators */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Secure Payment
          </h3>
        </div>
        {/* Payment method icons - Stripe Payment Element shows all enabled methods */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <CreditCard className="w-4 h-4" />
            <span>Cards</span>
          </div>
          <div className="flex items-center gap-1">
            <Smartphone className="w-4 h-4" />
            <span>Apple Pay</span>
          </div>
          <div className="flex items-center gap-1">
            <Wallet className="w-4 h-4" />
            <span>Google Pay</span>
          </div>
          <span className="text-gray-400">& more</span>
        </div>
      </div>

      {/* Stripe Payment Element Container */}
      {/* The Payment Element automatically displays all payment methods enabled in your Stripe Dashboard */}
      <div 
        id="stripe-payment-element" 
        className="min-h-[200px] p-4 border border-gray-200 rounded-lg bg-gray-50 transition-all"
      >
        {paymentStatus === 'loading' && (
          <div className="flex flex-col items-center justify-center h-[180px]">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-500">Loading payment options...</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handlePayment}
        disabled={paymentStatus === 'processing' || !stripe || !elements || !isPaymentReady}
        className="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {paymentStatus === 'processing' ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
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
