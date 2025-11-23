import { Flame, Menu, X, ShoppingCart, ChevronDown, Download, Tv, Radio, Smartphone, Settings, BookOpen, HelpCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface NavigationProps {
  cartItemCount?: number;
  onCartClick?: () => void;
}

export default function EnhancedNavigation({ cartItemCount = 0, onCartClick }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const megaMenuItems = {
    'Fire Stick': {
      icon: <Tv className="w-5 h-5" />,
      items: [
        { name: 'Fire Stick HD Setup', href: '/blog/fire-stick-hd-setup-guide-2025', keywords: 'fire stick hd setup, downloader setup, jailbreak fire stick' },
        { name: 'Fire Stick 4K Setup', href: '/blog/fire-stick-4k-setup-guide-2025', keywords: 'fire stick 4k setup, 4k streaming setup' },
        { name: 'Fire Stick 4K Max Setup', href: '/blog/fire-stick-4k-max-setup-guide-2025', keywords: 'fire stick 4k max setup, premium streaming' },
        { name: 'Downloader App Setup', href: '/blog/downloader-app-setup-fire-stick-2025', keywords: 'downloader app, downloader setup, fire stick downloader' },
        { name: 'Jailbreak Fire Stick', href: '/blog/how-to-jailbreak-fire-stick-safely-2025', keywords: 'jailbreak fire stick, unlock fire stick' },
        { name: 'Fire Stick Troubleshooting', href: '/blog/fire-stick-troubleshooting-guide', keywords: 'fire stick problems, fire stick fixes' }
      ]
    },
    'IPTV Players': {
      icon: <Radio className="w-5 h-5" />,
      items: [
        { name: 'TV Mate Setup Guide', href: '/blog/tv-mate-setup-guide-fire-stick-2025', keywords: 'tv mate, tv mate setup, tv mate iptv' },
        { name: 'Smarters Pro Setup', href: '/blog/smarters-pro-iptv-player-setup-2025', keywords: 'smarters pro, smarters iptv, smarters pro setup' },
        { name: 'Best IPTV Media Players', href: '/blog/best-iptv-media-players-fire-stick-2025', keywords: 'iptv media players, best iptv apps' },
        { name: 'IPTV Player Comparison', href: '/blog/iptv-player-comparison-2025', keywords: 'iptv players comparison, best iptv app' },
        { name: 'IPTV Player Troubleshooting', href: '/blog/iptv-player-troubleshooting-guide', keywords: 'iptv player problems, iptv app fixes' }
      ]
    },
    'IPTV Subscriptions': {
      icon: <Smartphone className="w-5 h-5" />,
      items: [
        { name: '1 Month IPTV Subscription', href: '/blog/1-month-iptv-subscription-trial', keywords: '1 month iptv, iptv subscription, live tv subscription' },
        { name: '3 Month IPTV Subscription', href: '/blog/3-month-iptv-subscription-best-deal', keywords: '3 month iptv, iptv deals' },
        { name: '6 Month IPTV Subscription', href: '/blog/6-month-iptv-subscription-save-more', keywords: '6 month iptv, iptv savings' },
        { name: '1 Year IPTV Subscription', href: '/blog/1-year-iptv-subscription-best-value', keywords: '1 year iptv, annual iptv subscription' },
        { name: 'Live TV Subscriptions', href: '/blog/live-tv-subscription-guide-2025', keywords: 'live tv subscription, streaming tv' }
      ]
    },
    'Guides & Tutorials': {
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        { name: 'Complete Setup Guide', href: '/blog/complete-fire-stick-iptv-setup-guide-2025', keywords: 'fire stick setup, iptv setup guide' },
        { name: 'Downloader Setup Tutorial', href: '/blog/downloader-setup-tutorial-2025', keywords: 'downloader tutorial, downloader guide' },
        { name: 'IPTV Setup for Beginners', href: '/blog/iptv-setup-beginners-guide-2025', keywords: 'iptv for beginners, iptv setup tutorial' },
        { name: 'Fire Stick Optimization', href: '/blog/fire-stick-optimization-guide-2025', keywords: 'fire stick optimization, speed up fire stick' }
      ]
    }
  };

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-xl border-b border-orange-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Stream Stick Pro
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
              className="px-4 py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Home
            </a>

            {/* Mega Menu Dropdowns */}
            {Object.entries(megaMenuItems).map(([key, menu]) => (
              <div key={key} className="relative" ref={key === 'Fire Stick' ? dropdownRef : null}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
                  className="px-4 py-2 hover:text-orange-400 transition-colors font-semibold flex items-center gap-1"
                >
                  {menu.icon}
                  <span>{key}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === key && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-2xl border border-orange-500/20 p-4 z-50">
                    <div className="space-y-2">
                      {menu.items.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = item.href;
                            setActiveDropdown(null);
                          }}
                          className="block px-4 py-3 rounded-lg hover:bg-orange-500/10 hover:text-orange-400 transition-all group"
                        >
                          <div className="font-semibold text-white group-hover:text-orange-400">{item.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{item.keywords}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <a
              href="#shop"
              onClick={(e) => { e.preventDefault(); scrollToSection('shop'); }}
              className="px-4 py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Shop
            </a>
            <a
              href="#blog"
              onClick={(e) => { e.preventDefault(); scrollToSection('blog'); }}
              className="px-4 py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Blog
            </a>
            <a
              href="/faq"
              className="px-4 py-2 hover:text-orange-400 transition-colors font-semibold flex items-center gap-1"
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </a>
            <a
              href="/track-order"
              className="px-4 py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Track Order
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
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
              className="block py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Home
            </a>
            {Object.entries(megaMenuItems).map(([key, menu]) => (
              <div key={key} className="space-y-1">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
                  className="w-full flex items-center justify-between py-2 hover:text-orange-400 transition-colors font-semibold"
                >
                  <div className="flex items-center gap-2">
                    {menu.icon}
                    <span>{key}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === key ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === key && (
                  <div className="pl-6 space-y-1 border-l-2 border-orange-500/30">
                    {menu.items.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = item.href;
                          setIsMenuOpen(false);
                          setActiveDropdown(null);
                        }}
                        className="block py-2 text-sm text-gray-300 hover:text-orange-400 transition-colors"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a
              href="#shop"
              onClick={(e) => { e.preventDefault(); scrollToSection('shop'); }}
              className="block py-2 hover:text-orange-400 transition-colors font-semibold"
            >
              Shop
            </a>
            <a
              href="#blog"
              onClick={(e) => { e.preventDefault(); scrollToSection('blog'); }}
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

