import { Flame, Menu, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  cartItemCount?: number;
  onCartClick?: () => void;
}

export default function Navigation({ cartItemCount = 0, onCartClick }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white sticky top-0 z-50 shadow-2xl backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="relative">
              <Flame className="w-10 h-10 text-orange-500 group-hover:animate-pulse" />
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/40 transition-all"></div>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent">Stream Stick Pro</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-orange-400 transition-all font-semibold text-base hover:scale-110 transform"
            >
              Home
            </a>
            <a
              href="#about"
              onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="hover:text-orange-400 transition-all font-semibold text-base hover:scale-110 transform"
            >
              About
            </a>
            <a
              href="#shop"
              onClick={(e) => { 
                e.preventDefault(); 
                const shopElement = document.getElementById('shop');
                if (shopElement) {
                  shopElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hover:text-orange-400 transition-all font-semibold text-base hover:scale-110 transform"
            >
              Shop
            </a>
            <a
              href="#blog"
              onClick={(e) => { e.preventDefault(); document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="hover:text-orange-400 transition-all font-semibold text-base hover:scale-110 transform"
            >
              Blog
            </a>
            <a
              href="/faq"
              className="hover:text-orange-400 transition-all font-semibold text-base hover:scale-110 transform"
            >
              FAQ
            </a>
            <a
              href="/track-order"
              className="hover:text-orange-400 transition-all font-semibold text-base hover:scale-110 transform"
            >
              Track
            </a>
            <a
              href="/checkout"
              className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 hover:from-orange-600 hover:via-red-600 hover:to-orange-600 rounded-xl transition-all transform hover:scale-110 font-bold shadow-lg shadow-orange-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <ShoppingCart className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-bold animate-bounce shadow-lg z-20">
                  {cartItemCount}
                </span>
              )}
            </a>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-3 bg-gray-800 rounded-lg p-4 mt-2">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMenuOpen(false); }}
              className="block py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Home
            </a>
            <a
              href="#about"
              onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
              className="block py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              About
            </a>
            <a
              href="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Shop
            </a>
            <a
              href="#blog"
              onClick={(e) => { e.preventDefault(); document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
              className="block py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Blog
            </a>
            <a
              href="/faq"
              className="block py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              FAQ
            </a>
            <a
              href="/track-order"
              className="block py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Track Order
            </a>
            <button
              onClick={() => { onCartClick?.(); setIsMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg transition-all font-semibold"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart ({cartItemCount})</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
