import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useTracking } from "@/hooks/useTracking";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import RetargetingPixels from "@/components/RetargetingPixels";

import MainStore from "@/pages/MainStore";
import ShadowStore from "@/pages/ShadowStore";
import AdminPanel from "@/pages/AdminPanel";
import Checkout from "@/pages/Checkout";
import Success from "@/pages/Success";
import Blog from "@/pages/Blog";
import Shop from "@/pages/Shop";
import CustomerLogin from "@/pages/CustomerLogin";
import CustomerPortal from "@/pages/CustomerPortal";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import RefundPolicy from "@/pages/RefundPolicy";
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
      <Route path="/shop" component={Shop} />
      <Route path="/shadow-services" component={ShadowStore} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/success" component={Success} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={Blog} />
      <Route path="/customer-login" component={CustomerLogin} />
      <Route path="/my-account" component={CustomerPortal} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/refund" component={RefundPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  useTracking();
  
  return (
    <>
      <RetargetingPixels />
      <Toaster />
      <CartDrawer />
      <WishlistDrawer />
      <Router />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
