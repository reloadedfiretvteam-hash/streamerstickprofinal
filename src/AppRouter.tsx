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
import ConciergePage from './pages/ConciergePage';

// Check if current host is a Stripe payment subdomain
function isStripePaymentHost(): boolean {
  const host = window.location.hostname;
  const stripeHosts = (import.meta.env.VITE_STRIPE_HOSTS || 'pay.streamstickpro.com').split(',').map((h: string) => h.trim());
  return stripeHosts.includes(host);
}

// Check if current host is a concierge subdomain
function isConciergeDomainHost(): boolean {
  const host = window.location.hostname;
  const conciergeHosts = (import.meta.env.VITE_CONCIERGE_HOSTS || '').split(',').map((h: string) => h.trim()).filter(Boolean);
  return conciergeHosts.length > 0 && conciergeHosts.includes(host);
}

// Check if current host is a secure checkout subdomain  
function isSecureDomainHost(): boolean {
  const host = window.location.hostname;
  const secureHosts = (import.meta.env.VITE_SECURE_HOSTS || '').split(',').map((h: string) => h.trim()).filter(Boolean);
  return secureHosts.length > 0 && secureHosts.some((h: string) => host === h || host.includes(h));
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

  // Handle Stripe payment subdomain (pay.streamstickpro.com) - Shadow/Carnage products
  if (isStripePaymentHost()) {
    return <StripeSecureCheckoutPage />;
  }

  // Handle Concierge subdomain - Special products/services
  if (isConciergeDomainHost()) {
    return <ConciergePage />;
  }

  // Handle Secure checkout subdomain - Alternative payment methods
  if (isSecureDomainHost()) {
    return <StripeSecureCheckoutPage />;
  }

  // Handle path-based routing for concierge and secure
  if (currentPath.startsWith('/concierge')) {
    return <ConciergePage />;
  }

  if (currentPath.startsWith('/secure') || currentPath.startsWith('/checkout-secure')) {
    return <StripeSecureCheckoutPage />;
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
