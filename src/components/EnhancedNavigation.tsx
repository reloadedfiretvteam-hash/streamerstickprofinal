import { Flame, Menu, X, ShoppingCart, Tv, Smartphone, BookOpen, HelpCircle, Package, Search } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  cartItemCount?: number;
  onCartClick?: () => void;
}

export default function EnhancedNavigation({ cartItemCount = 0, onCartClick }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    // If on homepage, scroll to section
    if (window.location.pathname === '/' || window.location.pathname === '') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // If on another page, navigate to homepage with hash
      window.location.href = `/#${id}`;
    }
    setIsMenuOpen(false);
  };

  // Simple, clear navigation items with direct paths
  const navItems = [
    { label: 'Home', action: () => window.location.href = '/' },
    { label: 'Fire Sticks', action: () => scrollToSection('shop'), icon: <Tv className="w-4 h-4" /> },
    { label: 'IPTV Subscriptions', action: () => scrollToSection('shop'), icon: <Smartphone className="w-4 h-4" /> },
    { label: 'Shop All', action: () => scrollToSection('shop'), icon: <Package className="w-4 h-4" /> },
    { label: 'FAQ', action: () => window.location.href = '/faq', icon: <HelpCircle className="w-4 h-4" /> },
    { label: 'Track Order', action: () => window.location.href = '/track-order', icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-xl border-b border-orange-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Stream Stick Pro
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                className="px-4 py-2 hover:text-orange-400 transition-colors font-semibold flex items-center gap-1"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            
            {/* Cart Button */}
            <button
              onClick={() => onCartClick?.()}
              className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg transition-all transform hover:scale-105 font-semibold shadow-lg ml-2"
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

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 space-y-2 bg-gray-800 rounded-lg p-4 mt-2 border border-orange-500/20">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.action();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 py-3 px-4 hover:bg-orange-500/10 hover:text-orange-400 transition-colors font-semibold rounded-lg text-left"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            
            {/* Mobile Cart Button */}
            <button
              onClick={() => { onCartClick?.(); setIsMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg transition-all font-semibold mt-2"
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
