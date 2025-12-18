import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiCall } from "@/lib/api";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ArrowLeft, CreditCard, Lock, ShieldCheck, Zap, CheckCircle, Loader2, RefreshCw, UserPlus, Globe, MessageSquare, Phone } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const productIdMap: Record<string, string> = {
  "fs-hd": "firestick-hd",
  "fs-4k": "firestick-4k",
  "fs-max": "firestick-4k-max",
  "iptv-1mo-1d": "iptv-1mo-1d",
  "iptv-1mo-2d": "iptv-1mo-2d",
  "iptv-1mo-3d": "iptv-1mo-3d",
  "iptv-1mo-4d": "iptv-1mo-4d",
  "iptv-1mo-5d": "iptv-1mo-5d",
  "iptv-3mo-1d": "iptv-3mo-1d",
  "iptv-3mo-2d": "iptv-3mo-2d",
  "iptv-3mo-3d": "iptv-3mo-3d",
  "iptv-3mo-4d": "iptv-3mo-4d",
  "iptv-3mo-5d": "iptv-3mo-5d",
  "iptv-6mo-1d": "iptv-6mo-1d",
  "iptv-6mo-2d": "iptv-6mo-2d",
  "iptv-6mo-3d": "iptv-6mo-3d",
  "iptv-6mo-4d": "iptv-6mo-4d",
  "iptv-6mo-5d": "iptv-6mo-5d",
  "iptv-1yr-1d": "iptv-1yr-1d",
  "iptv-1yr-2d": "iptv-1yr-2d",
  "iptv-1yr-3d": "iptv-1yr-3d",
  "iptv-1yr-4d": "iptv-1yr-4d",
  "iptv-1yr-5d": "iptv-1yr-5d",
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<"new" | "renewal">("new");
  const [existingUsername, setExistingUsername] = useState("");
  const [countryOptions, setCountryOptions] = useState({
    usaOnly: false,
    usaCanadaUk: false,
    allCountries: true,
  });
  const [customCountries, setCustomCountries] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    document.title = "Checkout | StreamStickPro";
  }, []);

  const hasIPTVProduct = items.some(item => 
    item.id.includes('iptv') || item.name?.toLowerCase().includes('iptv') ||
    item.name?.toLowerCase().includes('subscription') || item.name?.toLowerCase().includes('month')
  );

  const hasFireStickProduct = items.some(item => 
    item.id.includes('firestick') || item.id.includes('fs-') ||
    item.name?.toLowerCase().includes('fire stick') || item.name?.toLowerCase().includes('firestick')
  );

  const hasFreeTrial = items.some(item => 
    item.id.includes('trial') || item.name?.toLowerCase().includes('trial') || item.price === 0
  );

  const showCountryOptions = hasIPTVProduct || hasFireStickProduct || hasFreeTrial;

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
          totalAmount: total,
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

    if (accountType === "renewal" && hasIPTVProduct && !existingUsername.trim()) {
      setError("Please enter your existing username");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const checkoutItems = items.map(item => ({
        productId: productIdMap[item.id] || item.id,
        quantity: item.quantity,
      }));

      const checkoutPayload: any = {
        items: checkoutItems,
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
      };

      if (accountType === "renewal" && hasIPTVProduct && existingUsername.trim()) {
        checkoutPayload.isRenewal = true;
        checkoutPayload.existingUsername = existingUsername.trim();
      }

      if (showCountryOptions) {
        checkoutPayload.countryPreference = buildCountryPreference();
      }

      if (formData.phone.trim()) {
        checkoutPayload.customerPhone = formData.phone.trim();
      }

      if (formData.message.trim()) {
        checkoutPayload.customerMessage = formData.message.trim();
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
        clearCart();
        window.location.href = data.url;
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
    <div className="min-h-screen bg-gradient-to-b from-background to-black text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")} 
          className="mb-8 hover:bg-white/10"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
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
                          className="px-3 py-2 hover:bg-white/10 transition-colors"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          data-testid={`button-decrease-${item.id}`}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >-</button>
                        <span className="px-3 py-2 bg-white/5 min-w-[40px] text-center">{item.quantity}</span>
                        <button 
                          className="px-3 py-2 hover:bg-white/10 transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.id}`}
                          aria-label={`Increase quantity of ${item.name}`}
                        >+</button>
                      </div>
                      <Button 
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

            {hasIPTVProduct && (
              <Card className="border-white/10 bg-card/50 backdrop-blur">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    Account Type
                  </CardTitle>
                  <CardDescription>Are you a new customer or renewing an existing subscription?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup 
                    value={accountType} 
                    onValueChange={(value) => setAccountType(value as "new" | "renewal")}
                    className="space-y-3"
                  >
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        accountType === "new" 
                          ? "border-primary bg-primary/10" 
                          : "border-white/10 hover:border-white/20"
                      }`}
                      onClick={() => setAccountType("new")}
                      data-testid="radio-new-account"
                    >
                      <RadioGroupItem value="new" id="new" />
                      <div className="flex items-center gap-3 flex-1">
                        <UserPlus className="w-5 h-5 text-green-400" />
                        <div>
                          <Label htmlFor="new" className="font-semibold cursor-pointer">New Account</Label>
                          <p className="text-sm text-muted-foreground">I'm a new customer - generate new login credentials for me</p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        accountType === "renewal" 
                          ? "border-primary bg-primary/10" 
                          : "border-white/10 hover:border-white/20"
                      }`}
                      onClick={() => setAccountType("renewal")}
                      data-testid="radio-renewal"
                    >
                      <RadioGroupItem value="renewal" id="renewal" />
                      <div className="flex items-center gap-3 flex-1">
                        <RefreshCw className="w-5 h-5 text-blue-400" />
                        <div>
                          <Label htmlFor="renewal" className="font-semibold cursor-pointer">Renew Existing Account</Label>
                          <p className="text-sm text-muted-foreground">I already have an account - extend my subscription</p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {accountType === "renewal" && (
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="existingUsername">Your Existing Username *</Label>
                      <Input 
                        id="existingUsername"
                        placeholder="Enter your current Live TV username" 
                        value={existingUsername}
                        onChange={(e) => setExistingUsername(e.target.value)}
                        className="bg-background/50 border-white/20 h-12"
                        data-testid="input-existing-username"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the username you currently use to access Live TV. Your subscription will be extended.
                      </p>
                    </div>
                  )}
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
                  {accountType === "new" && hasIPTVProduct 
                    ? "We'll send your new login credentials here" 
                    : "We'll send your order confirmation here"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    Phone Number (Optional)
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
                    For order updates and shipping notifications
                  </p>
                </div>
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
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-white/10 bg-gradient-to-b from-card/80 to-card/50 backdrop-blur sticky top-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                      <span>${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="bg-white/10" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${total()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                </div>
                
                <Separator className="bg-white/10" />
                
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total()}</span>
                </div>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 h-14 text-lg font-semibold shadow-lg shadow-primary/25"
                    onClick={handlePayment}
                    disabled={isProcessing}
                    data-testid="button-pay"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Pay Securely
                      </>
                    )}
                  </Button>

                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl space-y-3">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                      <div className="text-sm text-blue-200">
                        <p className="font-medium mb-1">Discrete Billing</p>
                        <p className="text-blue-300/80">Your bank statement will show "Digital Services" for privacy.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Instant delivery via email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>24/7 customer support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Secure 256-bit encryption</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center items-center gap-3 pt-2">
                    <CreditCard className="w-8 h-8 text-muted-foreground" />
                    <div className="text-xs text-muted-foreground">
                      Powered by Stripe
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
