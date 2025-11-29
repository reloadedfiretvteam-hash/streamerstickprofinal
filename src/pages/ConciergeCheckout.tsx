import { useState } from 'react';
import { Shield, Info, Lock, AlertCircle, User } from 'lucide-react';
import StripePaymentForm from '../components/StripePaymentForm';

export default function ConciergeCheckout() {
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [creatingPaymentIntent, setCreatingPaymentIntent] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // This would come from your cart/session
  const product = {
    name: "Professional Website Page Design",
    price: 149.99,
    description: "Complete website page design and development service."
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!customerName.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!customerEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errors.email = 'Invalid email format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createStripePaymentIntent = async () => {
    if (!validateForm()) {
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
          amount: product.price,
          customerEmail: customerEmail,
          customerName: customerName,
          orderDescription: product.name,
          items: [{
            productId: 'concierge-service',
            productName: product.name,
            quantity: 1,
            price: product.price
          }]
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

  const handlePaymentSuccess = () => {
    setStep(2); // Success step
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your secure transaction has been completed.</p>
          <div className="p-4 bg-gray-50 rounded-lg text-left mb-6">
            <p className="text-sm text-gray-500 mb-1">Service</p>
            <p className="font-medium">{product.name}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-black text-white rounded-lg font-bold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow-sm h-full">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                </div>
                <span className="font-bold">${product.price}</span>
              </div>
              
              <div className="flex justify-between items-center text-lg font-bold pt-2">
                <span>Total</span>
                <span>${product.price}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                This transaction will appear as "PRO DIGITAL SERVICES" on your statement.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div>
          {paymentError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Payment Error</p>
                <p className="text-red-600 text-sm">{paymentError}</p>
              </div>
            </div>
          )}

          {!clientSecret ? (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Contact Information
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
              </div>
              
              <button
                onClick={createStripePaymentIntent}
                disabled={creatingPaymentIntent}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingPaymentIntent ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Initializing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Continue to Payment
                  </>
                )}
              </button>
            </div>
          ) : (
            <StripePaymentForm 
              amount={product.price} 
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </div>
      </div>
    </div>
  );
}

