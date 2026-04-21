import { useState, useEffect } from 'react';
import { CheckCircle, Package, Mail, Phone, ArrowRight, Home } from 'lucide-react';

export default function CheckoutSuccess() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id') || '';
    setSessionId(sid);

    // Set page title
    document.title = 'Order Confirmed! | StreamStick Pro';

    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl p-8 text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-white mb-3">
            Order Confirmed! 🎉
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Thank you for your purchase! We're setting up your streaming experience now.
          </p>

          {/* What happens next */}
          <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-400" />
              What Happens Next
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Payment Confirmed</p>
                  <p className="text-gray-400 text-sm">Your payment has been successfully processed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Account Setup (within 1 hour)</p>
                  <p className="text-gray-400 text-sm">Our team is activating your account and preparing your credentials.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-medium flex items-center gap-1">
                    <Mail className="w-4 h-4" /> Email Delivery
                  </p>
                  <p className="text-gray-400 text-sm">Your login credentials and setup instructions will be emailed to you shortly.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mb-8 text-left">
            <p className="text-orange-300 text-sm font-medium mb-1">Need help? We're here for you.</p>
            <p className="text-gray-300 text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-400" />
              Email: <a href="mailto:support@streamstickpro.com" className="text-orange-400 hover:text-orange-300 transition-colors">support@streamstickpro.com</a>
            </p>
            <p className="text-gray-400 text-xs mt-1">Business hours: 5 AM – 11 PM EST, 7 days a week</p>
          </div>

          {/* Order reference */}
          {sessionId && (
            <p className="text-gray-500 text-xs mb-6">
              Reference: {sessionId.slice(0, 20)}...
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </a>
            <a
              href="/track-order"
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all"
            >
              Track My Order
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
