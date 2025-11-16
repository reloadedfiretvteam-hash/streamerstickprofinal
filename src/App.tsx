import { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import FeatureIconRow from './components/FeatureIconRow';
import ReviewsCarousel from './components/ReviewsCarousel';
import Shop from './components/Shop';
import HowItWorksSteps from './components/HowItWorksSteps';
import FreeTrialBadge from './components/FreeTrialBadge';
import WhatYouGetVideo from './components/WhatYouGetVideo';
import BlogDisplay from './components/BlogDisplay';
import FAQ from './components/FAQ';
import LegalDisclaimer from './components/LegalDisclaimer';
import Footer from './components/Footer';
import EmailPopup from './components/EmailPopup';
import CheckoutCart from './components/CheckoutCart';
import SEOHead from './components/SEOHead';
import VisitorTracker from './components/VisitorTracker';
import GoogleAnalytics from './components/GoogleAnalytics';
import StructuredData from './components/StructuredData';
import StickyBuyButton from './components/StickyBuyButton';
import WhatsAppWidget from './components/WhatsAppWidget';
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

function App() {
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useAnalytics();

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('email_popup_seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowEmailPopup(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, []);

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
        
        {/* Above the Fold - Optimized for Conversions */}
        <Hero />
        <FeatureIconRow />
        <ReviewsCarousel />
        
        {/* Product Grid with Prominent Buy Buttons */}
        <Shop onAddToCart={handleAddToCart} />
        
        {/* How It Works Visual Steps */}
        <HowItWorksSteps />
        
        {/* What You Get Video Box */}
        <WhatYouGetVideo />
        
        {/* Below the Fold - Supporting Content */}
        <BlogDisplay />
        <FAQ />
        <LegalDisclaimer />
        
        {/* Clean Footer */}
        <Footer />
        
        {/* Floating Elements */}
        <FreeTrialBadge />
        <StickyBuyButton />
        <WhatsAppWidget />

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
