import { XCircle, ShoppingCart, RefreshCw } from 'lucide-react';
import Navigation from '../components/EnhancedNavigation';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function OrderCancelPage() {
  const { getItemCount } = useCart();

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRetryCheckout = () => {
    window.location.href = '/cart';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation cartItemCount={getItemCount()} onCartClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* Cancel Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Order Cancelled
            </h1>
            <p className="text-xl text-gray-400">
              Your checkout was cancelled
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-gray-800 rounded-2xl p-8 mb-8">
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3 p-4 bg-gray-700/50 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold">Your Cart is Saved</p>
                  <p className="text-sm text-gray-400">
                    Don't worry! Your cart items are still saved. You can return to checkout whenever you're ready.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-700/50 rounded-lg">
                <RefreshCw className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <p className="font-semibold">Ready to Try Again?</p>
                  <p className="text-sm text-gray-400">
                    If you experienced any issues, please try again or contact our support team for assistance.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> No charges have been made to your account.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetryCheckout}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Return to Cart
            </button>
            <button
              onClick={handleGoHome}
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Having trouble? Contact our support team at</p>
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
