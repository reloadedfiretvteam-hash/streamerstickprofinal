import { useState, useEffect } from 'react';
import App from './App';
import UnifiedAdminLogin from './pages/UnifiedAdminLogin';
import RealAdminDashboard from './pages/RealAdminDashboard';
import OrderTracking from './pages/OrderTracking';
import FAQPage from './pages/FAQPage';
import EnhancedBlogPost from './pages/EnhancedBlogPost';
import SEOAdPage from './pages/SEOAdPage';
import ShopPage from './pages/ShopPage';
import NewCheckoutPage from './pages/NewCheckoutPage';
import CompleteCheckoutPage from './pages/CompleteCheckoutPage';
import FireSticksPage from './pages/FireSticksPage';
import IPTVServicesPage from './pages/IPTVServicesPage';
import StripeSecureCheckoutPage from './pages/StripeSecureCheckoutPage';
import SecureCheckoutPage from './pages/SecureCheckoutPage';
import StripeConnectionTest from './pages/StripeConnectionTest';
import VisitorTracker from './components/VisitorTracker';

// Check if current host is a Stripe payment subdomain
function isStripePaymentHost(): boolean {
  const host = window.location.hostname;
  const stripeHosts = (import.meta.env.VITE_STRIPE_HOSTS || 'pay.streamstickpro.com').split(',').map((h: string) => h.trim());
  return stripeHosts.includes(host);
}

export default function AppRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    const token = localStorage.getItem('custom_admin_token');
    setIsAuthenticated(token === 'authenticated');

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Stripe payment subdomain (pay.streamstickpro.com)
  if (isStripePaymentHost()) {
    return (
      <>
        <VisitorTracker />
        <StripeSecureCheckoutPage />
      </>
    );
  }

  if (currentPath === '/shop' || currentPath === '/shop/') {
    return (
      <>
        <VisitorTracker />
        <ShopPage />
      </>
    );
  }

  // Fire Sticks page route
  if (currentPath === '/fire-sticks' || currentPath === '/fire-sticks/') {
    return (
      <>
        <VisitorTracker />
        <FireSticksPage />
      </>
    );
  }

  // IPTV Services page route
  if (currentPath === '/iptv-services' || currentPath === '/iptv-services/') {
    return (
      <>
        <VisitorTracker />
        <IPTVServicesPage />
      </>
    );
  }

  if (currentPath === '/checkout' || currentPath === '/checkout/') {
    return (
      <>
        <VisitorTracker />
        <CompleteCheckoutPage />
      </>
    );
  }

  // Legacy checkout route
  if (currentPath === '/old-checkout' || currentPath === '/old-checkout/') {
    return (
      <>
        <VisitorTracker />
        <NewCheckoutPage />
      </>
    );
  }

  // Secure/Shadow checkout route - uses shadow products for Carnage/compliance
  if (currentPath === '/secure-checkout' || currentPath === '/secure-checkout/') {
    return (
      <>
        <VisitorTracker />
        <SecureCheckoutPage />
      </>
    );
  }

  // Stripe checkout route - /stripe-checkout or /stripe-checkout/:productId
  if (currentPath === '/stripe-checkout' || currentPath === '/stripe-checkout/' || currentPath.startsWith('/stripe-checkout/')) {
    return (
      <>
        <VisitorTracker />
        <StripeSecureCheckoutPage />
      </>
    );
  }

  if (currentPath === '/custom-admin/dashboard') {
    if (isAuthenticated) {
      return (
        <>
          <VisitorTracker />
          <RealAdminDashboard />
        </>
      );
    }
    window.location.href = '/';
    return null;
  }

  // Handle all admin routes - /admin, /admin/, /admin/dashboard, /custom-admin, /custom-admin/
  if (currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/dashboard' ||
      currentPath === '/custom-admin' || currentPath === '/custom-admin/') {
    if (isAuthenticated) {
      return (
        <>
          <VisitorTracker />
          <RealAdminDashboard />
        </>
      );
    }
    return (
      <>
        <VisitorTracker />
        <UnifiedAdminLogin />
      </>
    );
  }

  if (currentPath === '/track-order' || currentPath === '/track-order/') {
    return (
      <>
        <VisitorTracker />
        <OrderTracking />
      </>
    );
  }

  if (currentPath === '/faq' || currentPath === '/faq/') {
    return (
      <>
        <VisitorTracker />
        <FAQPage />
      </>
    );
  }

  // Stripe connection test page
  if (currentPath === '/test-stripe' || currentPath === '/test-stripe/') {
    return (
      <>
        <VisitorTracker />
        <StripeConnectionTest />
      </>
    );
  }

  // Blog post routing
  if (currentPath.startsWith('/blog/tag/') && currentPath !== '/blog/tag/') {
    // Tag page - will be handled by a new component or EnhancedBlogPost
    return (
      <>
        <VisitorTracker />
        <EnhancedBlogPost />
      </>
    );
  }

  if (currentPath.startsWith('/blog/') && currentPath !== '/blog/') {
    return (
      <>
        <VisitorTracker />
        <EnhancedBlogPost />
      </>
    );
  }

  // SEO Ads routing - /ads/[slug]
  if (currentPath.startsWith('/ads/') && currentPath !== '/ads/') {
    return (
      <>
        <VisitorTracker />
        <SEOAdPage />
      </>
    );
  }

  return (
    <>
      <VisitorTracker />
      <App />
    </>
  );
}
