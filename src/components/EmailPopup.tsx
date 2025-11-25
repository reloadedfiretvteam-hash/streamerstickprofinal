import { X, Gift, Sparkles } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface EmailPopupProps {
  onCapture: (email: string) => void;
  onClose: () => void;
}

export default function EmailPopup({ onCapture, onClose }: EmailPopupProps) {
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Show popup after 30 seconds or on scroll (50% of page)
  const handleTrigger = useCallback(() => {
    if (showPopup) return;
    setShowPopup(true);
    setTimeout(() => setIsVisible(true), 100);
  }, [showPopup]);

  useEffect(() => {
    // Timer trigger: 30 seconds
    const timer = setTimeout(handleTrigger, 30000);

    // Scroll trigger: 50% of page
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage > 50) {
        handleTrigger();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleTrigger]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onCapture(email);
      onClose();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!showPopup) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleDismiss}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          aria-label="Close popup"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>

          <h3 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Unlock 10% Off! 🎉
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Join 10,000+ subscribers and get exclusive deals, setup guides, and early access to new features.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Claim My 10% Discount
            </button>
          </form>

          <button
            onClick={handleDismiss}
            className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            No thanks, I'll pay full price
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            🔒 We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
