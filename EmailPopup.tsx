import { X, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-3xl font-bold text-gray-900 text-center mb-3">
            Get 10% Off Your First Month!
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Subscribe to our newsletter and receive exclusive deals, setup guides, and early access to new features.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              Claim My Discount
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
