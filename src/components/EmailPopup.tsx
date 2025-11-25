import { X, Gift, Percent, Tv, Star } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface EmailPopupProps {
  onCapture: (email: string) => void;
  onClose: () => void;
}

export default function EmailPopup({ onCapture, onClose }: EmailPopupProps) {
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onCapture(email);
      onClose();
    }
  };

  // Handle ESC key to close popup
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle clicking outside the popup to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Easy Dismiss Button - More Prominent */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors shadow-lg border border-gray-200 z-10"
          aria-label="Close popup"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl px-8 py-6 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h3 id="popup-title" className="text-2xl md:text-3xl font-bold text-white mb-2">
            Exclusive IPTV Deal: 10% OFF!
          </h3>
          <p className="text-orange-100 text-sm">
            Limited time offer for new subscribers
          </p>
        </div>

        <div className="p-8">
          {/* Value Props */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Percent className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">10% Off First Purchase</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Tv className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Exclusive Deals & Tips</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Early Access</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="popup-email" className="sr-only">Email address</label>
              <input
                id="popup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
                autoComplete="email"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-orange-500/25"
            >
              🎁 Claim My 10% Discount
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              No thanks, I'll pay full price
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            🔒 We respect your privacy. Unsubscribe anytime with one click.
          </p>
        </div>
      </div>
    </div>
  );
}
