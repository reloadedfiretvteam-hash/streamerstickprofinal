import { useState, useEffect } from 'react';
import { Shield, Lock, AlertCircle, Settings } from 'lucide-react';

interface SquarePaymentFormProps {
  amount: number;
  onSubmit: (token: string) => Promise<void>;
}

declare global {
  interface Window {
    Square: any;
  }
}

// Check for missing environment variables at module load time
const SQUARE_APP_ID = import.meta.env.VITE_SQUARE_APP_ID;
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID;

function getMissingEnvVars(): string[] {
  const missing: string[] = [];
  if (!SQUARE_APP_ID) missing.push('VITE_SQUARE_APP_ID');
  if (!SQUARE_LOCATION_ID) missing.push('VITE_SQUARE_LOCATION_ID');
  return missing;
}

export default function SquarePaymentForm({ amount, onSubmit }: SquarePaymentFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [card, setCard] = useState<any>(null);
  const [configError, setConfigError] = useState<string[]>([]);

  useEffect(() => {
    const initializeSquare = async () => {
      // Check for missing environment variables first
      const missingVars = getMissingEnvVars();
      if (missingVars.length > 0) {
        setConfigError(missingVars);
        return;
      }

      // Wait for Square SDK to load
      if (!window.Square) {
        // Square SDK not loaded yet - this is expected if the script hasn't loaded
        setErrorMessage('Square payment SDK is loading...');
        return;
      }

      try {
        const payments = await window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        const card = await payments.card();
        await card.attach('#card-container');
        setCard(card);
        setErrorMessage(''); // Clear any loading message
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

  // Show configuration error if environment variables are missing
  if (configError.length > 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Payment Configuration Required</h3>
            <p className="text-sm text-gray-600">Square payment is not configured yet</p>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-800 mb-2">
            <strong>Missing environment variables:</strong>
          </p>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {configError.map((varName) => (
              <li key={varName}>
                <code className="bg-amber-100 px-1 rounded">{varName}</code>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>To enable credit card payments:</strong>
          </p>
          <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
            <li>Create a Square Developer account at <a href="https://developer.squareup.com" target="_blank" rel="noopener noreferrer" className="underline">developer.squareup.com</a></li>
            <li>Get your Application ID and Location ID from the Square Dashboard</li>
            <li>Add the environment variables to your deployment platform</li>
          </ol>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-4">
          Please contact the site administrator if you need assistance.
        </p>
      </div>
    );
  }

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

