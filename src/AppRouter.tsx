import { useState, useEffect } from 'react';
import App from './App';
import UnifiedAdminLogin from './pages/UnifiedAdminLogin';
import ModalAdminDashboard from './pages/ModalAdminDashboard';
import OrderTracking from './pages/OrderTracking';
import FAQPage from './pages/FAQPage';
import EnhancedBlogPost from './pages/EnhancedBlogPost';
import ShopPage from './pages/ShopPage';
import NewCheckoutPage from './pages/NewCheckoutPage';
import FireSticksPage from './pages/FireSticksPage';
import IPTVServicesPage from './pages/IPTVServicesPage';

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

  if (currentPath === '/custom-admin/dashboard') {
    if (isAuthenticated) {
      return <ModalAdminDashboard />;
    }
    window.location.href = '/';
    return null;
  }

  // Handle all admin routes - /admin, /admin/, /admin/dashboard, /custom-admin, /custom-admin/
  if (currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/dashboard' ||
      currentPath === '/custom-admin' || currentPath === '/custom-admin/') {
    if (isAuthenticated) {
      return <ModalAdminDashboard />;
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
