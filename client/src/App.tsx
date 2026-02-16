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
const IptvServices = lazy(() => import("@/pages/IptvServices"));
const IptvFirestick = lazy(() => import("@/pages/IptvFirestick"));
const JailbrokenFireSticks = lazy(() => import("@/pages/JailbrokenFireSticks"));
const FirestickDevices = lazy(() => import("@/pages/FirestickDevices"));
const BestIptvFirestick = lazy(() => import("@/pages/BestIptvFirestick"));
const IptvMediaPlayers = lazy(() => import("@/pages/IptvMediaPlayers"));
const LocationPage = lazy(() => import("@/pages/LocationPage"));
const LocationsHub = lazy(() => import("@/pages/LocationsHub"));
const Resources = lazy(() => import("@/pages/Resources"));
const Trial36hr = lazy(() => import("@/pages/Trial36hr"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const OnnGoogleTv = lazy(() => import("@/pages/OnnGoogleTv"));
const IptvSmartersPro = lazy(() => import("@/pages/IptvSmartersPro"));
const Tivimate = lazy(() => import("@/pages/Tivimate"));
const VsCompetitor = lazy(() => import("@/pages/VsCompetitor"));
const UltimateIptvCatalog = lazy(() => import("@/pages/UltimateIptvCatalog"));
const ToolsCatalog = lazy(() => import("@/pages/ToolsCatalog"));
const Tutorials = lazy(() => import("@/pages/Tutorials"));
const SeoAds = lazy(() => import("@/pages/SeoAds"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900" role="status" aria-live="polite" aria-busy="true">
    <div className="text-center">
      <Spinner className="w-8 h-8 text-orange-500 mx-auto mb-4" aria-hidden="true" />
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
        <Route path="/iptv-services" component={IptvServices} />
        <Route path="/iptv-firestick" component={IptvFirestick} />
        <Route path="/jailbroken-fire-sticks" component={JailbrokenFireSticks} />
        <Route path="/firestick-devices" component={FirestickDevices} />
        <Route path="/best-iptv-firestick" component={BestIptvFirestick} />
        <Route path="/iptv-media-players" component={IptvMediaPlayers} />
        <Route path="/resources" component={Resources} />
        <Route path="/36hr-trial" component={Trial36hr} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/onn-google-tv" component={OnnGoogleTv} />
        <Route path="/iptv-smarters-pro" component={IptvSmartersPro} />
        <Route path="/tivimate" component={Tivimate} />
        <Route path="/vs-:competitor" component={VsCompetitor} />
        <Route path="/ultimate-iptv-catalog-2026" component={UltimateIptvCatalog} />
        <Route path="/tools/catalog" component={ToolsCatalog} />
        <Route path="/tutorials" component={Tutorials} />
        <Route path="/seo-ads" component={SeoAds} />
        <Route path="/seo-ads/:slug" component={SeoAds} />
        <Route path="/l/:country/:pageType/:slug" component={LocationPage} />
        <Route path="/locations" component={LocationsHub} />
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
