import { useState, useEffect } from 'react';
import App from './App';
import UnifiedAdminLogin from './pages/UnifiedAdminLogin';
import RealAdminDashboard from './pages/RealAdminDashboard';
import OrderTracking from './pages/OrderTracking';
import FAQPage from './pages/FAQPage';
import EnhancedBlogPost from './pages/EnhancedBlogPost';
import ShopPage from './pages/ShopPage';
import NewCheckoutPage from './pages/NewCheckoutPage';
import FireSticksPage from './pages/FireSticksPage';
import IPTVServicesPage from './pages/IPTVServicesPage';
import StripeSecureCheckoutPage from './pages/StripeSecureCheckoutPage';

// Check if current host is a Stripe payment subdomain
function isStripePaymentHost(): boolean {
  const host = window.location.hostname;
  const stripeHosts = (import.meta.env.VITE_STRIPE_HOSTS || 'pay.streamstickpro.com').split(',').map((h: string) => h.trim());
  return stripeHosts.includes(host);
}

// Check if current host is a Square secure checkout subdomain
function isSecureHost(): boolean {
  const host = window.location.hostname;
  const secureHosts = (import.meta.env.VITE_SECURE_HOSTS || 'secure.streamstickpro.com').split(',').map((h: string) => h.trim());
  return secureHosts.includes(host);
}

// Check if current host is a secure domain (concierge/secure)
// This includes both VITE_SECURE_HOSTS and VITE_CONCIERGE_HOSTS
function isSecureDomainHost(): boolean {
  const host = window.location.hostname;
  const conciergeHosts = (import.meta.env.VITE_CONCIERGE_HOSTS || '').split(',').map((h: string) => h.trim()).filter(Boolean);
  return isSecureHost() || conciergeHosts.includes(host);
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
    return <StripeSecureCheckoutPage />;
  }

  // Handle secure/concierge checkout subdomains (secure.streamstickpro.com, concierge domains)
  // If VITE_SECURE_HOST_RENDER_FULL_APP is 'true', render full app instead of cloaked checkout
  if (isSecureDomainHost()) {
    const renderFullApp = import.meta.env.VITE_SECURE_HOST_RENDER_FULL_APP === 'true';
    if (!renderFullApp) {
      return <StripeSecureCheckoutPage />;
    }
    // If renderFullApp is true, continue to normal routing below for full app
  }

  if (currentPath === '/shop' || currentPath === '/shop/') {
    return <ShopPage />;
  }

  // Fire Sticks page route
  if (currentPath === '/fire-sticks' || currentPath === '/fire-sticks/') {
    return <FireSticksPage />;
  }

  // IPTV Services page route
  if (currentPath === '/iptv-services' || currentPath === '/iptv-services/') {
    return <IPTVServicesPage />;
  }

  if (currentPath === '/checkout' || currentPath === '/checkout/') {
    return <NewCheckoutPage />;
  }

  // Stripe checkout route - /stripe-checkout or /stripe-checkout/:productId
  if (currentPath === '/stripe-checkout' || currentPath === '/stripe-checkout/' || currentPath.startsWith('/stripe-checkout/')) {
    return <StripeSecureCheckoutPage />;
  }

  if (currentPath === '/custom-admin/dashboard') {
    if (isAuthenticated) {
      return <RealAdminDashboard />;
    }
    window.location.href = '/';
    return null;
  }

  // Handle all admin routes - /admin, /admin/, /admin/dashboard, /custom-admin, /custom-admin/
  if (currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/dashboard' ||
      currentPath === '/custom-admin' || currentPath === '/custom-admin/') {
    if (isAuthenticated) {
      return <RealAdminDashboard />;
    }
    return <UnifiedAdminLogin />;
  }

  if (currentPath === '/track-order' || currentPath === '/track-order/') {
    return <OrderTracking />;
  }

  if (currentPath === '/faq' || currentPath === '/faq/') {
    return <FAQPage />;
  }

  // Blog post routing
  if (currentPath.startsWith('/blog/tag/') && currentPath !== '/blog/tag/') {
    // Tag page - will be handled by a new component or EnhancedBlogPost
    return <EnhancedBlogPost />;
  }

  if (currentPath.startsWith('/blog/') && currentPath !== '/blog/') {
    return <EnhancedBlogPost />;
  }

  return <App />;
}
