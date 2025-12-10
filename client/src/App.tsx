import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useTracking } from "@/hooks/useTracking";

import MainStore from "@/pages/MainStore";
import ShadowStore from "@/pages/ShadowStore";
import AdminPanel from "@/pages/AdminPanel";
import Checkout from "@/pages/Checkout";
import Success from "@/pages/Success";
import Blog from "@/pages/Blog";
import CustomerLogin from "@/pages/CustomerLogin";
import CustomerPortal from "@/pages/CustomerPortal";
import FireSticksPage from "@/pages/FireSticksPage";
import IPTVPage from "@/pages/IPTVPage";
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistDrawer } from "@/components/WishlistDrawer";

const SECURE_HOSTS = (import.meta.env.VITE_SECURE_HOSTS || 'secure.streamstickpro.com').split(',').map((h: string) => h.trim().toLowerCase());

function isShadowDomain(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  return SECURE_HOSTS.some((host: string) => hostname === host || hostname.endsWith('.' + host));
}

function Router() {
  const isShadow = isShadowDomain();
  
  if (isShadow) {
    return (
      <Switch>
        <Route path="/" component={ShadowStore} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/success" component={Success} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  return (
    <Switch>
      <Route path="/" component={MainStore} />
      <Route path="/products/fire-sticks" component={FireSticksPage} />
      <Route path="/products/iptv" component={IPTVPage} />
      <Route path="/shadow-services" component={ShadowStore} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/success" component={Success} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={Blog} />
      <Route path="/customer-login" component={CustomerLogin} />
      <Route path="/my-account" component={CustomerPortal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  useTracking();
  
  return (
    <>
      <Toaster />
      <CartDrawer />
      <WishlistDrawer />
      <Router />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
