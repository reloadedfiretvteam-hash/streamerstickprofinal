import { useEffect, useState } from 'react';
import { CheckCircle, Package, Mail, ArrowRight, Home } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function OrderSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session_id from URL params (Stripe redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session_id');
    if (session) {
      setSessionId(session);
    }

    // Clear cart from localStorage
    localStorage.removeItem('cart');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation cartItemCount={0} onCartClick={() => {}} />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl p-8 border border-green-500/30 text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              Payment Successful!
            </h1>

            <p className="text-xl text-green-200 mb-6">
              Thank you for your purchase. Your order is being processed.
            </p>

            {sessionId && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm mb-1">Session ID</p>
                <p className="text-white font-mono text-sm break-all">{sessionId}</p>
              </div>
            )}
          </div>

          {/* What's Next */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-400" />
              What Happens Next?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-white font-semibold">Order Confirmation Email</h3>
                  <p className="text-gray-400 text-sm">
                    You'll receive an email confirmation with your order details within a few minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-white font-semibold">Order Processing</h3>
                  <p className="text-gray-400 text-sm">
                    Our team will process your order and prepare it for delivery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-white font-semibold">Service Activation</h3>
                  <p className="text-gray-400 text-sm">
                    For IPTV subscriptions, you'll receive your login credentials via email.
                    For Fire Stick orders, we'll ship your device with tracking information.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Info */}
          <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-500/30 mb-8">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Need Help?</h3>
                <p className="text-gray-300 text-sm">
                  If you have any questions about your order, please contact us at{' '}
                  <a href="mailto:reloadedfiretvteam@gmail.com" className="text-blue-400 hover:text-blue-300">
                    reloadedfiretvteam@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              <Home className="w-5 h-5" />
              Return Home
            </a>
            <a
              href="/track-order"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
            >
              Track Your Order
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
