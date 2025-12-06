import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ArrowLeft, CreditCard, Lock, ShieldCheck, Zap, CheckCircle, Loader2 } from "lucide-react";

const productIdMap: Record<string, string> = {
  "fs-hd": "firestick-hd",
  "fs-4k": "firestick-4k",
  "fs-max": "firestick-4k-max",
  "iptv-1": "iptv-1mo",
  "iptv-3": "iptv-3mo",
  "iptv-6": "iptv-6mo",
  "iptv-12": "iptv-1yr",
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
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

    setIsProcessing(true);
    setError(null);

    try {
      const checkoutItems = items.map(item => ({
        productId: productIdMap[item.id] || item.id,
        quantity: item.quantity,
      }));

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: checkoutItems,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        }),
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
            Browse our selection of premium streaming devices and IPTV subscriptions.
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
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
                        >-</button>
                        <span className="px-3 py-2 bg-white/5 min-w-[40px] text-center">{item.quantity}</span>
                        <button 
                          className="px-3 py-2 hover:bg-white/10 transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.id}`}
                        >+</button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(item.id)} 
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-card/50 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Contact Information</CardTitle>
                <CardDescription>We'll send your login credentials here</CardDescription>
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
