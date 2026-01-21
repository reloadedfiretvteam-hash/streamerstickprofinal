import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTracking } from "@/hooks/useTracking";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import RetargetingPixels from "@/components/RetargetingPixels";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { Spinner } from "@/components/ui/spinner";

// Critical routes - load immediately
import MainStore from "@/pages/MainStore";
import ShadowStore from "@/pages/ShadowStore";
import Checkout from "@/pages/Checkout";
import Shop from "@/pages/Shop";

// Non-critical routes - lazy load for better performance
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const Blog = lazy(() => import("@/pages/Blog"));
const Success = lazy(() => import("@/pages/Success"));
const CustomerLogin = lazy(() => import("@/pages/CustomerLogin"));
const CustomerPortal = lazy(() => import("@/pages/CustomerPortal"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("@/pages/RefundPolicy"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900">
    <div className="text-center">
      <Spinner className="w-8 h-8 text-orange-500 mx-auto mb-4" />
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import CanonicalTag from "@/components/CanonicalTag";

const SECURE_HOSTS = (import.meta.env.VITE_SECURE_HOSTS || 'secure.streamstickpro.com').split(',').map((h: string) => h.trim().toLowerCase());

function isShadowDomain(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  return SECURE_HOSTS.some((host: string) => hostname === host || hostname.endsWith('.' + host));
}

function Router() {
  const isShadow = isShadowDomain();
  
  if (isShadow) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/" component={ShadowStore} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/success" component={Success} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }
  
  return (
    <Suspense fallback={<LoadingFallback />}>
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
    </Suspense>
  );
}

function AppContent() {
  useTracking();
  
  return (
    <>
      <CanonicalTag />
      <RetargetingPixels />
      <ExitIntentPopup 
        onClose={() => {}} 
        onAction={() => {
          // Optional: Scroll to shop section or open cart
        }}
      />
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
