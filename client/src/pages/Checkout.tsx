import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { apiCall } from "@/lib/api";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ArrowLeft, CreditCard, Lock, ShieldCheck, Zap, CheckCircle, Loader2, Globe, MessageSquare, Phone, Shield, ChevronRight, Sparkles, Truck } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { setPageMeta } from "@/lib/seo";
import { trackVpnClick } from "@/lib/vpn-tracking";

/** Stripe-hosted checkout may show a subset; chips signal trust + brand polish. */
const PAYMENT_METHOD_CHIPS: {
  name: string;
  abbr: string;
  pill: string;
  dot: string;
}[] = [
  {
    name: "Visa",
    abbr: "V",
    pill: "border-blue-500/35 bg-gradient-to-br from-blue-600/25 via-blue-950/30 to-slate-950/50 text-blue-50 shadow-sm shadow-blue-500/10",
    dot: "bg-[#1434CB] ring-2 ring-blue-400/25",
  },
  {
    name: "Mastercard",
    abbr: "MC",
    pill: "border-orange-500/35 bg-gradient-to-br from-orange-600/20 via-red-950/25 to-slate-950/50 text-orange-50 shadow-sm shadow-orange-500/10",
    dot: "bg-gradient-to-br from-[#EB001B] to-[#F79E1B] ring-2 ring-orange-400/20",
  },
  {
    name: "Amex",
    abbr: "AX",
    pill: "border-cyan-500/35 bg-gradient-to-br from-cyan-600/20 via-sky-950/30 to-slate-950/50 text-cyan-50 shadow-sm shadow-cyan-500/10",
    dot: "bg-[#2E77BC] ring-2 ring-cyan-400/20",
  },
  {
    name: "Discover",
    abbr: "D",
    pill: "border-amber-500/35 bg-gradient-to-br from-amber-600/20 to-orange-950/40 text-amber-50 shadow-sm shadow-amber-500/10",
    dot: "bg-[#FF6000] ring-2 ring-amber-400/20",
  },
  {
    name: "Apple Pay",
    abbr: "",
    pill: "border-violet-500/30 bg-gradient-to-br from-violet-600/15 via-slate-900/50 to-slate-950/60 text-violet-100 shadow-sm shadow-violet-500/10",
    dot: "bg-gradient-to-br from-violet-500 to-fuchsia-600 ring-2 ring-violet-400/20",
  },
  {
    name: "Google Pay",
    abbr: "",
    pill: "border-emerald-500/30 bg-gradient-to-br from-emerald-600/18 via-teal-950/25 to-slate-950/50 text-emerald-50 shadow-sm shadow-emerald-500/10",
    dot: "bg-gradient-to-br from-emerald-500 to-cyan-500 ring-2 ring-emerald-400/15",
  },
  {
    name: "Cash App",
    abbr: "$",
    pill: "border-green-500/35 bg-gradient-to-br from-green-600/22 to-emerald-950/40 text-green-50 shadow-sm shadow-green-500/10",
    dot: "bg-[#00D632] ring-2 ring-green-400/25",
  },
  {
    name: "Affirm",
    abbr: "A",
    pill: "border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 to-slate-950/55 text-indigo-100 shadow-sm shadow-indigo-500/10",
    dot: "bg-indigo-500 ring-2 ring-indigo-400/25",
  },
  {
    name: "Klarna",
    abbr: "K",
    pill: "border-rose-500/25 bg-gradient-to-br from-rose-600/15 via-pink-950/20 to-slate-950/55 text-rose-100 shadow-sm shadow-rose-500/10",
    dot: "bg-gradient-to-br from-pink-500 to-rose-600 ring-2 ring-rose-400/15",
  },
  {
    name: "Link",
    abbr: "",
    pill: "border-[#FAD02C]/40 bg-gradient-to-br from-[#FAD02C]/15 via-orange-950/25 to-slate-950/50 text-[#FAD02C] shadow-sm shadow-[#FAD02C]/15",
    dot: "bg-gradient-to-r from-orange-400 to-[#FAD02C] ring-2 ring-[#FAD02C]/30",
  },
];

function ProgressBar({ step }: { step: number }) {
  const steps = [
    { label: "Cart", num: 1 },
    { label: "Info", num: 2 },
    { label: "Payment", num: 3 },
  ];
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center flex-1 last:flex-initial">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                step >= s.num
                  ? "bg-gradient-to-br from-orange-500 to-red-500 border-orange-400 text-white shadow-lg shadow-orange-500/30"
                  : "border-white/20 text-white/40 bg-white/5"
              }`}
            >
              {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-[11px] mt-1.5 font-medium ${step >= s.num ? "text-orange-300" : "text-white/40"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${step > s.num ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CheckoutTrustReassuranceSection({
  hasIPTVProduct,
  hasPhysicalProduct,
  hasFreeTrial,
}: {
  hasIPTVProduct: boolean;
  hasPhysicalProduct: boolean;
  hasFreeTrial: boolean;
}) {
  const showServiceDelivery = hasIPTVProduct || hasFreeTrial;
  return (
    <div className="mb-8 rounded-2xl border border-orange-500/25 bg-gradient-to-br from-gray-900/85 via-gray-950/95 to-black/90 p-5 md:p-6 shadow-xl shadow-orange-500/10 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/25 to-red-500/20 border border-orange-500/35">
          <Sparkles className="w-6 h-6 text-orange-300" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Secure checkout & what happens next</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            When you continue, you&apos;ll finish payment on <strong className="text-gray-200">Stripe&apos;s secure hosted page</strong>. Major cards and{" "}
            <strong className="text-gray-200">Link</strong> are always available; Apple Pay, Google Pay, Klarna, Affirm, and other methods appear automatically when Stripe supports them for your device and region.
          </p>
        </div>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        <li className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-gray-200">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold text-white">Bank-grade security</span>
            <span className="text-gray-400"> — Card data stays with Stripe (PCI). We don&apos;t store your full card on our servers.</span>
          </span>
        </li>
        {showServiceDelivery && (
          <li className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-gray-200">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-white">Instant credentials</span>
              <span className="text-gray-400"> — For live TV / service plans, login details are emailed right after successful payment (check spam).</span>
            </span>
          </li>
        )}
        <li className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-gray-200">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold text-white">Setup tutorial</span>
            <span className="text-gray-400"> — A separate step-by-step video link is emailed after purchase so you can get running quickly.</span>
          </span>
        </li>
        {hasPhysicalProduct ? (
          <li className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-gray-200">
            <Truck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-white">Device orders</span>
              <span className="text-gray-400">
                {" "}
                — We confirm shipping details by email and fulfill as quickly as possible. Questions? Our team is here for setup and tracking help.
              </span>
            </span>
          </li>
        ) : (
          <li className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-gray-200">
            <MessageSquare className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <span>
              <span className="font-semibold text-white">Human support</span>
              <span className="text-gray-400"> — If anything is unclear after checkout, reach out and we&apos;ll walk you through it.</span>
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

function TrustBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-r from-gray-950/90 via-emerald-950/35 to-gray-950/90 p-4 mb-6 backdrop-blur shadow-lg shadow-orange-500/5">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500/70 to-transparent"
        aria-hidden
      />
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white/95">SSL Encrypted</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-gradient-to-b from-orange-500/40 to-cyan-500/40" />
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-orange-100/95">Powered by Stripe</span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-gradient-to-b from-orange-500/40 to-cyan-500/40" />
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-100/95">PCI Compliant</span>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, total, removeItem, updateQuantity } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryOptions, setCountryOptions] = useState({
    usaOnly: false,
    usaCanadaUk: false,
    allCountries: true,
  });
  const [customCountries, setCustomCountries] = useState("");
  const [vpnUpsellInterest, setVpnUpsellInterest] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    message: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    setPageMeta({
      title: "Checkout | StreamStickPro",
      description: "Secure checkout for premium Reloaded Fire TV access and optional Fire Stick / ONN bundles. Instant credentials, tutorial video, 24/7 support. 18K+ channels. 36-hour trial on subscription plans.",
      path: "/checkout",
      noindex: true,
    });
    const robots = document.querySelector('meta[name="robots"]');
    return () => {
      if (robots) robots.setAttribute("content", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    };
  }, []);

  const hasIPTVProduct = items.some(item => 
    item.id.includes('iptv') || item.name?.toLowerCase().includes('iptv') ||
    item.name?.toLowerCase().includes('subscription') || item.name?.toLowerCase().includes('month')
  );

  const hasFireStickProduct = items.some(item => 
    item.id.includes('firestick') || item.id.includes('fs-') ||
    item.name?.toLowerCase().includes('fire stick') || item.name?.toLowerCase().includes('firestick')
  );

  const hasONNProduct = items.some(item => 
    item.id.includes('onn') || item.id.includes('android-onn') ||
    item.name?.toLowerCase().includes('onn') || item.name?.toLowerCase().includes('streaming device')
  );

  const hasPhysicalProduct = hasFireStickProduct || hasONNProduct;

  const hasFreeTrial = items.some(item => 
    item.id.includes('trial') || item.name?.toLowerCase().includes('trial') || item.price === 0
  );

  const showCountryOptions = hasIPTVProduct || hasFireStickProduct || hasFreeTrial;
  const orderTotal = Number(total() || 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  // Track abandoned cart when user enters email (for recovery emails)
  const trackAbandonedCart = async () => {
    if (!formData.email || !formData.email.includes('@') || items.length === 0) return;
    
    try {
      await apiCall("/api/track-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`.trim() || null,
          cartItems: items.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
          totalAmount: total(),
        }),
      });
    } catch (err) {
      // Silently fail - this is just for recovery
      console.log("Cart tracking skipped");
    }
  };

  // Track cart when email field loses focus
  const handleEmailBlur = () => {
    trackAbandonedCart();
  };

  const buildCountryPreference = () => {
    const preferences: string[] = [];
    if (countryOptions.usaOnly) preferences.push("USA Only");
    if (countryOptions.usaCanadaUk) preferences.push("USA, Canada, UK");
    if (countryOptions.allCountries) preferences.push("All Countries");
    if (customCountries.trim()) preferences.push(`Custom: ${customCountries.trim()}`);
    return preferences.join("; ") || "All Countries";
  };

  const handleCountryOptionChange = (option: keyof typeof countryOptions, checked: boolean) => {
    setCountryOptions(prev => ({ ...prev, [option]: checked }));
  };

  const handlePayment = async () => {
    if (!formData.email || !formData.firstName) {
      setError("Please enter your email and name");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (hasPhysicalProduct) {
      if (!formData.phone.trim()) {
        setError("Please enter your phone number for shipping");
        return;
      }
      if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
        setError("Please enter your complete shipping address");
        return;
      }
    }

    setIsProcessing(true);
    setError(null);

    try {
      const checkoutItems = items.map((item) => {
        const base: { productId: string; quantity: number; applySitePromotion?: boolean } = {
          productId: item.id,
          quantity: item.quantity,
        };
        if (item.applySitePromotion) base.applySitePromotion = true;
        return base;
      });

      const checkoutPayload: any = {
        items: checkoutItems,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
      };

      if (showCountryOptions) {
        checkoutPayload.countryPreference = buildCountryPreference();
      }

      if (formData.phone.trim()) {
        checkoutPayload.customerPhone = formData.phone.trim();
      }

      const baseMsg = formData.message.trim();
      const vpnNote = vpnUpsellInterest
        ? "Add Surfshark VPN? (Customer checked interest — see https://streamstickpro.com/vpn)"
        : "";
      const mergedMsg = [baseMsg, vpnNote].filter(Boolean).join("\n\n");
      if (mergedMsg) {
        checkoutPayload.customerMessage = mergedMsg;
      }

      if (hasPhysicalProduct) {
        checkoutPayload.shippingAddress = {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
        };
      }

      // Include customer token if logged in
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const customerToken = localStorage.getItem("customerToken");
      if (customerToken) {
        headers["Authorization"] = `Bearer ${customerToken}`;
      }

      const response = await apiCall("/api/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify(checkoutPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        // Clear cart only after paid checkout on /success — clearing here empties the cart if
        // Stripe navigation is blocked, gated, or the user cancels, which feels like a "refresh".
        window.location.assign(data.url);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-black text-foreground flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground max-w-md">
            Browse our selection of premium streaming devices and Live TV plans.
          </p>
          <Button 
            onClick={() => setLocation("/")} 
            size="lg"
            className="bg-primary hover:bg-primary/90"
            data-testid="button-back-to-store"
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-background to-black text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")} 
            className="hover:bg-white/10"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight hidden sm:inline">StreamStickPro</span>
            <span className="text-lg font-bold text-white tracking-tight sm:hidden">SSP</span>
          </div>
        </div>

        <TrustBanner />
        <ProgressBar step={2} />

        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-foreground text-center">Complete Your Order</h1>
        <p className="text-center text-sm text-gray-300 mb-3">
          Typical checkout time: under 2 minutes. Secure Stripe checkout. One-time payment, no auto-renew subscription.
        </p>
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          {[
            { label: "Stripe secured", className: "border-orange-500/30 bg-orange-500/10 text-orange-100" },
            { label: "Cards + Link", className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100" },
            { label: "Klarna / Affirm when eligible", className: "border-violet-500/25 bg-violet-500/10 text-violet-100" },
            { label: "Coupon codes accepted", className: "border-[#FAD02C]/35 bg-[#FAD02C]/10 text-[#F5E6A3]" },
          ].map((item) => (
            <span
              key={item.label}
              className={`rounded-full border px-3 py-1.5 font-medium shadow-sm backdrop-blur ${item.className}`}
            >
              {item.label}
            </span>
          ))}
        </div>

        <CheckoutTrustReassuranceSection
          hasIPTVProduct={hasIPTVProduct}
          hasPhysicalProduct={hasPhysicalProduct}
          hasFreeTrial={hasFreeTrial}
        />

        <form
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            void handlePayment();
          }}
        >
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-white/10 bg-card/50 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Zap className="w-6 h-6 text-primary" />
                  Your Order
                </CardTitle>
                <CardDescription>Review your items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" width={64} height={64} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <div className="text-primary font-bold">${item.price}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-white/20 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          className="px-3 py-2 hover:bg-white/10 transition-colors"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          data-testid={`button-decrease-${item.id}`}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >-</button>
                        <span className="px-3 py-2 bg-white/5 min-w-[40px] text-center">{item.quantity}</span>
                        <button
                          type="button"
                          className="px-3 py-2 hover:bg-white/10 transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.id}`}
                          aria-label={`Increase quantity of ${item.name}`}
                        >+</button>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(item.id)} 
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        data-testid={`button-remove-${item.id}`}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#0DD9D2]/30 bg-[#0DD9D2]/5 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-[#0DD9D2]">
                  <ShieldCheck className="w-5 h-5" />
                  Add Surfshark VPN?
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Reduce ISP throttling and buffering. We&apos;ll note your interest on this order.{" "}
                  <Link href="/vpn">
                    <span
                      className="text-[#0DD9D2] hover:underline font-medium cursor-pointer"
                      onClick={() => trackVpnClick({ source: "/checkout", placement: "checkout_vpn_link" })}
                    >
                      Learn more on our VPN page
                    </span>
                  </Link>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${
                    vpnUpsellInterest ? "border-[#0DD9D2] bg-[#0DD9D2]/10" : "border-white/10"
                  }`}
                  data-testid="checkbox-vpn-upsell"
                >
                  <Checkbox checked={vpnUpsellInterest} onCheckedChange={(c) => setVpnUpsellInterest(!!c)} id="vpn-upsell" />
                  <Label htmlFor="vpn-upsell" className="font-medium cursor-pointer flex-1 leading-snug">
                    Yes — I want Surfshark VPN info with my order
                  </Label>
                </div>
              </CardContent>
            </Card>

            {hasIPTVProduct && (
              <Card className="border-white/10 bg-card/50 backdrop-blur">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Returning Customer Note
                  </CardTitle>
                  <CardDescription>
                    If you are a returning customer, please message us your username. Thank you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    id="returning-user-message"
                    placeholder="If you are a returning customer, please message us your username. Thank you."
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="bg-background/50 border-white/20 min-h-[90px] resize-none"
                    data-testid="input-returning-customer-message"
                  />
                </CardContent>
              </Card>
            )}

            {showCountryOptions && (
              <Card className="border-white/10 bg-card/50 backdrop-blur">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Channel Preferences
                  </CardTitle>
                  <CardDescription>Which regions/countries would you like channels from?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        countryOptions.usaOnly 
                          ? "border-primary bg-primary/10" 
                          : "border-white/10 hover:border-white/20"
                      }`}
                      onClick={() => handleCountryOptionChange("usaOnly", !countryOptions.usaOnly)}
                      data-testid="checkbox-usa-only"
                    >
                      <Checkbox 
                        checked={countryOptions.usaOnly}
                        onCheckedChange={(checked) => handleCountryOptionChange("usaOnly", !!checked)}
                        id="usa-only"
                      />
                      <div className="flex-1">
                        <Label htmlFor="usa-only" className="font-semibold cursor-pointer">USA Only</Label>
                        <p className="text-sm text-muted-foreground">Only US-based channels</p>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        countryOptions.usaCanadaUk 
                          ? "border-primary bg-primary/10" 
                          : "border-white/10 hover:border-white/20"
                      }`}
                      onClick={() => handleCountryOptionChange("usaCanadaUk", !countryOptions.usaCanadaUk)}
                      data-testid="checkbox-usa-canada-uk"
                    >
                      <Checkbox 
                        checked={countryOptions.usaCanadaUk}
                        onCheckedChange={(checked) => handleCountryOptionChange("usaCanadaUk", !!checked)}
                        id="usa-canada-uk"
                      />
                      <div className="flex-1">
                        <Label htmlFor="usa-canada-uk" className="font-semibold cursor-pointer">USA + Canada + UK</Label>
                        <p className="text-sm text-muted-foreground">English-speaking countries</p>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        countryOptions.allCountries 
                          ? "border-primary bg-primary/10" 
                          : "border-white/10 hover:border-white/20"
                      }`}
                      onClick={() => handleCountryOptionChange("allCountries", !countryOptions.allCountries)}
                      data-testid="checkbox-all-countries"
                    >
                      <Checkbox 
                        checked={countryOptions.allCountries}
                        onCheckedChange={(checked) => handleCountryOptionChange("allCountries", !!checked)}
                        id="all-countries"
                      />
                      <div className="flex-1">
                        <Label htmlFor="all-countries" className="font-semibold cursor-pointer">All Countries</Label>
                        <p className="text-sm text-muted-foreground">Full international channel package</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="customCountries">Other Countries/Languages (Optional)</Label>
                    <Input 
                      id="customCountries"
                      placeholder="e.g., Spanish, Portuguese, Arabic channels..." 
                      value={customCountries}
                      onChange={(e) => setCustomCountries(e.target.value)}
                      className="bg-background/50 border-white/20 h-12"
                      data-testid="input-custom-countries"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tell us any specific countries or language channels you'd like
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-white/10 bg-card/50 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Contact Information</CardTitle>
                <CardDescription>
                  We'll send your order confirmation here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                  We only use your details for order delivery, account setup, and support updates.
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleEmailBlur}
                    className="bg-background/50 border-white/20 h-12 text-lg"
                    data-testid="input-email"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName"
                      name="firstName"
                      placeholder="John" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-background/50 border-white/20 h-12"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      name="lastName"
                      placeholder="Doe" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-background/50 border-white/20 h-12"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number {hasPhysicalProduct ? "*" : "(Optional)"}
                  </Label>
                  <Input 
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(555) 123-4567" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-background/50 border-white/20 h-12"
                    data-testid="input-phone"
                  />
                  <p className="text-xs text-muted-foreground">
                    {hasPhysicalProduct ? "Required for shipping your device" : "For order updates and shipping notifications"}
                  </p>
                </div>

                {hasPhysicalProduct && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Zap className="w-5 h-5" />
                        <span className="font-semibold">Shipping Address</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Where should we ship your device? (US & Canada only)
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address *</Label>
                        <Input 
                          id="address"
                          name="address"
                          placeholder="123 Main Street, Apt 4B" 
                          value={formData.address}
                          onChange={handleInputChange}
                          className="bg-background/50 border-white/20 h-12"
                          data-testid="input-address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input 
                            id="city"
                            name="city"
                            placeholder="New York" 
                            value={formData.city}
                            onChange={handleInputChange}
                            className="bg-background/50 border-white/20 h-12"
                            data-testid="input-city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province *</Label>
                          <Input 
                            id="state"
                            name="state"
                            placeholder="NY" 
                            value={formData.state}
                            onChange={handleInputChange}
                            className="bg-background/50 border-white/20 h-12"
                            data-testid="input-state"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                        <Input 
                          id="zipCode"
                          name="zipCode"
                          placeholder="10001" 
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="bg-background/50 border-white/20 h-12"
                          data-testid="input-zipcode"
                        />
                      </div>
                    </div>
                  </>
                )}
                {!hasIPTVProduct && (
                  <div className="space-y-2">
                    <Label htmlFor="message" className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Message (Optional)
                    </Label>
                    <Textarea 
                      id="message"
                      name="message"
                      placeholder="Any special requests, questions, or notes for your order..." 
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="bg-background/50 border-white/20 min-h-[100px] resize-none"
                      data-testid="input-message"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground pt-1">
                  Required fields are marked with *.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-orange-500/20 bg-gradient-to-b from-gray-900/90 to-gray-950/90 backdrop-blur sticky top-8 shadow-xl shadow-orange-500/5">
              <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
                      <span className="font-medium text-white">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="bg-white/10" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${orderTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-emerald-400 font-medium">FREE</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">${orderTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">One-time payment. No automatic renewal.</p>
                </div>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4 pt-1">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-14 text-lg font-bold shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01]"
                    disabled={isProcessing}
                    data-testid="button-pay"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Redirecting to Stripe...
                      </>
                    ) : (
                      <>
                        Continue to Secure Payment
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-gray-400">
                    Next step opens secure Stripe checkout where available payment options are shown automatically.
                  </p>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <Lock className="w-3 h-3" />
                    <span>256-bit SSL encryption by Stripe</span>
                  </div>

                  <div className="rounded-xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 via-slate-900/40 to-orange-500/5 p-3 shadow-sm shadow-cyan-500/5">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-cyan-100/90">
                        <p className="font-semibold text-white">Discrete billing</p>
                        <p className="text-cyan-200/75 mt-0.5">Your statement will show &quot;Digital Services&quot; for privacy.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {[
                      "Instant credentials sent by email",
                      "Separate setup tutorial video emailed after purchase",
                      "24/7 human support if you get stuck",
                      "Coupon codes accepted inside Stripe checkout",
                    ].map((text) => (
                      <div key={text} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-gray-300">{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <p className="text-xs uppercase tracking-wider text-cyan-300 mb-3">What happens after payment</p>
                    <div className="space-y-2 text-sm">
                      {[
                        "Reloaded Fire TV orders: credentials are delivered by email right after payment.",
                        "Device orders: we email your order details and send the device-specific setup tutorial separately.",
                        "Physical devices: shipping details are reviewed right after checkout.",
                        "Support stays available if email delivery or setup needs help.",
                      ].map((text) => (
                        <div key={text} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="text-gray-200">{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator className="bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                  <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-500/[0.07] via-slate-950/40 to-cyan-500/[0.06] p-4 shadow-inner shadow-black/20">
                    <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-[#FAD02C] to-cyan-300 mb-1">
                      Accepted payment methods
                    </p>
                    <p className="text-center text-[10px] text-gray-400 mb-3.5">
                      Final options depend on your device &amp; region on Stripe&apos;s page
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {PAYMENT_METHOD_CHIPS.map((m) => (
                        <span
                          key={m.name}
                          title={m.name}
                          className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold tracking-wide transition-transform hover:scale-[1.02] ${m.pill}`}
                        >
                          <span
                            className={`flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-md ${m.dot}`}
                            aria-hidden
                          >
                            {m.abbr ? (
                              <span className="text-[9px] font-black text-white drop-shadow-sm">{m.abbr}</span>
                            ) : null}
                          </span>
                          <span className="truncate max-w-[5.5rem] sm:max-w-none">{m.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 text-center leading-relaxed">
                    By continuing, you agree to our{" "}
                    <Link href="/terms"><span className="underline hover:text-gray-300">Terms</span></Link>,{" "}
                    <Link href="/privacy"><span className="underline hover:text-gray-300">Privacy</span></Link>, and{" "}
                    <Link href="/refund"><span className="underline hover:text-gray-300">Refund Policy</span></Link>.
                  </p>
                </div>
              </CardContent>
             </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
