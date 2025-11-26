import { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/EnhancedNavigation';
import Hero from './components/Hero';
import About from './components/About';
import WhyChooseUs from './components/WhyChooseUs';
import Shop from './components/Shop';
import MediaCarousel from './components/MediaCarousel';
import IPTVPreviewVideo from './components/IPTVPreviewVideo';
import WhatYouGetVideo from './components/WhatYouGetVideo';
import WhatIsIPTV from './components/WhatIsIPTV';
import FAQ from './components/FAQ';
import Devices from './components/Devices';
import YouTubeTutorials from './components/YouTubeTutorials';
import BlogDisplay from './components/BlogDisplay';
import LegalDisclaimer from './components/LegalDisclaimer';
import EmailCaptureBottom from './components/EmailCaptureBottom';
import Footer from './components/Footer';
import EmailPopup from './components/EmailPopup';
import CheckoutCart from './components/CheckoutCart';
import SEOHead from './components/SEOHead';
import VisitorTracker from './components/VisitorTracker';
import GoogleAnalytics from './components/GoogleAnalytics';
import StructuredData from './components/StructuredData';
import ReviewsCarousel from './components/ReviewsCarousel';
import TrustBadges from './components/TrustBadges';
import StickyBuyButton from './components/StickyBuyButton';
import ComparisonTable from './components/ComparisonTable';
import SocialProof from './components/SocialProof';
import MoneyBackGuarantee from './components/MoneyBackGuarantee';
import FeatureIconRow from './components/FeatureIconRow';
import HowItWorksSteps from './components/HowItWorksSteps';
import ConciergePage from './pages/ConciergePage';
import ConciergeCheckout from './pages/ConciergeCheckout';
import SecureCheckoutPage from './pages/SecureCheckoutPage';
import { useAnalytics, trackEmailCapture } from './hooks/useAnalytics';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  type: 'firestick' | 'iptv';
  image: string;
  badge: string;
  popular: boolean;
  period?: string;
  savings?: string;
  features: string[];
}

const conciergeHosts = (import.meta.env.VITE_CONCIERGE_HOSTS || '')
  .split(',')
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

// Optional: comma‑separated list of secure/Square-only hosts.
// Example value in env: secure.streamstickpro.com
const secureHosts = (import.meta.env.VITE_SECURE_HOSTS || '')
  .split(',')
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

function App() {
  const [isConciergeDomain, setIsConciergeDomain] = useState(false);
  const [isSecureDomain, setIsSecureDomain] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useAnalytics();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const forcedMode = searchParams.get('mode');

    if (forcedMode === 'main') {
      setIsConciergeDomain(false);
      return;
    }

    if (forcedMode === 'concierge') {
      setIsConciergeDomain(true);
      return;
    }

    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname;

    const isConciergeHost =
      conciergeHosts.length > 0 &&
      conciergeHosts.some((allowedHost) => hostname === allowedHost);

    const isConciergePath = pathname.startsWith('/concierge');

    setIsConciergeDomain(isConciergeHost || isConciergePath);

    // Secure domain: lock to Square-safe checkout experience.
    const isSecureHost =
      secureHosts.length > 0 &&
      secureHosts.some((allowedHost) => hostname === allowedHost || hostname.includes(allowedHost));

    // Also treat direct /secure path on any host as secure mode.
    const isSecurePath = pathname.startsWith('/secure') || pathname.startsWith('/checkout-secure');

    const isSecure = isSecureHost || isSecurePath;
    
    // Debug logging
    if (isSecure) {
      console.log('🔒 Secure domain detected:', { hostname, pathname, secureHosts, isSecureHost, isSecurePath });
    }
    
    setIsSecureDomain(isSecure);
  }, []);

  useEffect(() => {
    if (isConciergeDomain) return;
    const hasSeenPopup = localStorage.getItem('email_popup_seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowEmailPopup(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isConciergeDomain]);

  const handleEmailCapture = async (email: string, source: string = 'bottom') => {
    const success = await trackEmailCapture(email, source);
    if (success) {
      setEmailCaptured(true);
      localStorage.setItem('captured_email', email);
      alert('Thank you! Check your email for exclusive offers.');
    }
  };

  const handleClosePopup = () => {
    setShowEmailPopup(false);
    localStorage.setItem('email_popup_seen', 'true');
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Secure domain: show Square-safe checkout only (no IPTV UI).
  if (isSecureDomain) {
    return (
      <ErrorBoundary>
        <SecureCheckoutPage />
      </ErrorBoundary>
    );
  }

  // Concierge domain: dedicated concierge landing experience.
  if (isConciergeDomain) {
    return <ConciergePage />;
  }

  return (
    <ErrorBoundary>
      <SEOHead />
      <GoogleAnalytics />
      <StructuredData />
      <VisitorTracker />
      <div className="min-h-screen bg-gray-900">
        <Navigation
          cartItemCount={cartItemCount}
          onCartClick={() => setIsCartOpen(true)}
        />
        <Hero />
        <FeatureIconRow />
        <TrustBadges />
        <About />
        <WhyChooseUs />
        <MediaCarousel />
        <HowItWorksSteps />
        <WhatYouGetVideo />
        <Shop onAddToCart={handleAddToCart} />
        <YouTubeTutorials />
        <ReviewsCarousel />
        <ComparisonTable />
        <IPTVPreviewVideo />
        <WhatIsIPTV />
        <Devices />
        <BlogDisplay />
        <MoneyBackGuarantee />
        <FAQ />
        <EmailCaptureBottom onEmailCapture={handleEmailCapture} />
        <LegalDisclaimer />
        <Footer />
        <StickyBuyButton />
        <SocialProof />

        {showEmailPopup && !emailCaptured && (
          <EmailPopup
            onCapture={(email) => handleEmailCapture(email, 'popup')}
            onClose={handleClosePopup}
          />
        )}

        <CheckoutCart
          isOpen={isCartOpen}
          onClose={() => {
            setIsCartOpen(false);
          }}
          items={cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          }))}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={() => setCartItems([])}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
