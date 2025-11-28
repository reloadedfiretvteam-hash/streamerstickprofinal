import { CheckCircle, Package, Mail, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import Navigation from '../components/EnhancedNavigation';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

interface SessionData {
  customer_email?: string;
  amount_total?: number;
  payment_status?: string;
}

export default function OrderSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [_sessionData, setSessionData] = useState<SessionData | null>(null);
  const { clearCart, getItemCount } = useCart();

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sid = urlParams.get('session_id');
    setSessionId(sid);

    // Clear the cart on successful order
    clearCart();

    // Optionally fetch session details from Stripe
    // For now, we just show a success message
    if (sid) {
      setSessionData({
        payment_status: 'paid'
      });
    }
  }, [clearCart]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoToAccount = () => {
    window.location.href = '/account';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation cartItemCount={getItemCount()} onCartClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Order Confirmed! 🎉
            </h1>
            <p className="text-xl text-gray-400">
              Thank you for your purchase
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-gray-800 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Package className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold">Order Details</h2>
            </div>

            {sessionId && (
              <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Order Reference</p>
                <p className="font-mono text-lg">{sessionId.slice(0, 20)}...</p>
              </div>
            )}

            <div className="space-y-4 text-left mb-6">
              <div className="flex items-start gap-3 p-4 bg-gray-700/50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold">Confirmation Email</p>
                  <p className="text-sm text-gray-400">
                    A confirmation email with your order details has been sent to your email address.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-700/50 rounded-lg">
                <Package className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <p className="font-semibold">What's Next?</p>
                  <p className="text-sm text-gray-400">
                    For digital products, you'll receive access information via email shortly.
                    For physical products, we'll ship your order within 1-2 business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 font-semibold">
                ✓ Payment Successful
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Your payment has been processed securely via Stripe.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoHome}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </button>
            <button
              onClick={handleGoToAccount}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              View My Orders
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Need help? Contact our support team at</p>
            <a 
              href="mailto:reloadedfiretvteam@gmail.com" 
              className="text-blue-400 hover:text-blue-300"
            >
              reloadedfiretvteam@gmail.com
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
