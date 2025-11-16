import { ShoppingCart, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function StickyBuyButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 800) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const goToShop = () => {
    window.location.href = '/shop';
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <button
        onClick={goToShop}
        className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:scale-110 flex items-center gap-3 animate-pulse"
      >
        <ShoppingCart className="w-6 h-6 text-white group-hover:animate-bounce" />
        <span className="text-white font-bold text-lg hidden sm:inline">Shop Now</span>
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
          <Zap className="w-4 h-4 inline" />
          SALE
        </div>
      </button>
    </div>
  );
}
