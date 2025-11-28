import { XCircle, ArrowLeft, RefreshCw, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function OrderCancelPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation cartItemCount={0} onCartClick={() => {}} />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          {/* Cancel Card */}
          <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 rounded-2xl p-8 border border-red-500/30 text-center mb-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              Payment Cancelled
            </h1>

            <p className="text-xl text-red-200 mb-6">
              Your payment was not completed. No charges have been made.
            </p>
          </div>

          {/* What You Can Do */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">
              What Would You Like To Do?
            </h2>

            <div className="space-y-4">
              <a
                href="/shop"
                className="flex items-center gap-4 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                    Try Again
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Return to the shop and complete your purchase
                  </p>
                </div>
              </a>

              <a
                href="/"
                className="flex items-center gap-4 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                    Return Home
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Go back to the home page
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Common Issues */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Common Reasons for Cancelled Payments
            </h2>

            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Payment was manually cancelled by clicking "Back" or closing the window</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Card was declined by your bank</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Insufficient funds in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-400">•</span>
                <span>Session timed out during the payment process</span>
              </li>
            </ul>
          </div>

          {/* Support Info */}
          <div className="bg-blue-900/30 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-1">Need Help?</h3>
                <p className="text-gray-300 text-sm">
                  If you're experiencing issues with payment, please contact us at{' '}
                  <a href="mailto:reloadedfiretvteam@gmail.com" className="text-blue-400 hover:text-blue-300">
                    reloadedfiretvteam@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
