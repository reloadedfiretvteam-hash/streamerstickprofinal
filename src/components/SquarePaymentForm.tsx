import { useState, useEffect } from 'react';
import { Shield, Lock, CreditCard, AlertCircle } from 'lucide-react';

interface SquarePaymentFormProps {
  amount: number;
  onSubmit: (token: string) => Promise<void>;
}

declare global {
  interface Window {
    Square: any;
  }
}

export default function SquarePaymentForm({ amount, onSubmit }: SquarePaymentFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [card, setCard] = useState<any>(null);

  useEffect(() => {
    const initializeSquare = async () => {
      // Wait for Square SDK to load if not already available
      let retries = 0;
      while (!window.Square && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!window.Square) {
        setErrorMessage('Square payment system is loading. Please wait...');
        // Try loading the script dynamically
        const script = document.createElement('script');
        script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
        script.async = true;
        script.onload = () => {
          setTimeout(initializeSquare, 500);
        };
        script.onerror = () => {
          setErrorMessage('Failed to load Square payment system. Please refresh the page.');
        };
        document.head.appendChild(script);
        return;
      }

      const applicationId = import.meta.env.VITE_SQUARE_APP_ID;
      const locationId = import.meta.env.VITE_SQUARE_LOCATION_ID;

      if (!applicationId || !locationId) {
        setErrorMessage('Square configuration missing. Please contact support.');
        return;
      }

      try {
        const payments = await window.Square.payments(applicationId, locationId);
        const card = await payments.card();
        await card.attach('#card-container');
        setCard(card);
        setErrorMessage(''); // Clear any previous errors
      } catch (e) {
        console.error('Square initialization failed:', e);
        setErrorMessage('Failed to load secure payment form. Please refresh the page.');
      }
    };

    initializeSquare();
  }, []);

  const handlePayment = async () => {
    if (!card) return;
    setPaymentStatus('loading');
    setErrorMessage('');

    try {
      const result = await card.tokenize();
      if (result.status === 'OK') {
        await onSubmit(result.token);
        setPaymentStatus('success');
      } else {
        throw new Error(result.errors[0].message);
      }
    } catch (e: any) {
      setPaymentStatus('error');
      setErrorMessage(e.message || 'Payment failed');
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

      <div id="card-container" className="min-h-[100px]"></div>

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={paymentStatus === 'loading' || !card}
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
        Payments processed securely by Square
      </p>
    </div>
  );
}

