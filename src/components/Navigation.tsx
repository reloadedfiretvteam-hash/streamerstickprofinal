import { Flame, Menu, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

// Updated: Cart button now opens modal instead of redirecting

interface NavigationProps {
  cartItemCount?: number;
  onCartClick?: () => void;
}

export default function Navigation({ cartItemCount = 0, onCartClick }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold">Stream Stick Pro</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-orange-400 transition-colors font-semibold"
            >
              Home
            </a>
            <a
              href="#about"
              onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="hover:text-orange-400 transition-colors font-semibold"
            >
              About
            </a>
            <a
              href="/shop"
              className="hover:text-orange-400 transition-colors font-semibold"
            >
              Shop
            </a>
            <a
              href="#blog"
              onClick={(e) => { e.preventDefault(); document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="hover:text-orange-400 transition-colors font-semibold"
            >
              Blog
            </a>
            <a
              href="/blog"
              className="hover:text-orange-400 transition-colors font-semibold"
            >
              All Posts
            </a>
            <a
              href="/faq"
              className="hover:text-orange-400 transition-colors font-semibold"
            >
              FAQ
            </a>
            <a
              href="/track-order"
              className="hover:text-orange-400 transition-colors font-semibold"
            >
              Track Order
            </a>
            <a
              href="/account"
              className="hover:text-orange-400 transition-colors font-semibold"
            >
              Account
            </a>
            <button
              onClick={() => onCartClick?.()}
              className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg transition-all transform hover:scale-105 font-semibold shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>
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
              href="/blog"
              className="block py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              All Posts
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
            <a
              href="/account"
              className="block py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Account
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
