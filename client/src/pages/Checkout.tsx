import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ArrowLeft, CreditCard, Lock, ShieldCheck } from "lucide-react";

export default function Checkout() {
  const [location, setLocation] = useLocation();
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate Stripe processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      // SUCCESS STATE FOR REAL CUSTOMERS
      // In production, the backend handles the cloaking silently.
      // The customer just sees a success message for their Fire Stick.
      setLocation("/success");
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => setLocation("/")}>Go Back Shopping</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-white/10 bg-card">
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>Review your items before checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-white/5">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <div className="text-sm text-muted-foreground">${item.price}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-white/10 rounded">
                        <button 
                          className="px-2 py-1 hover:bg-white/10"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >-</button>
                        <span className="px-2">{item.quantity}</span>
                        <button 
                          className="px-2 py-1 hover:bg-white/10"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >+</button>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-card">
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input placeholder="John" className="bg-background/50 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Doe" className="bg-background/50 border-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="123 Main St" className="bg-background/50 border-white/10" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2 col-span-2">
                    <Label>City</Label>
                    <Input placeholder="New York" className="bg-background/50 border-white/10" />
                  </div>
                   <div className="space-y-2">
                    <Label>Zip</Label>
                    <Input placeholder="10001" className="bg-background/50 border-white/10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-white/10 bg-card sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${total()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total()}</span>
                </div>
                
                <div className="pt-4 space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded text-xs text-blue-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>Payments are securely processed. Your bank statement will show "Website Design Services" for privacy.</p>
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Pay Securely"}
                  </Button>
                  
                  <div className="flex justify-center gap-2 text-muted-foreground">
                     <CreditCard className="w-6 h-6" />
                     {/* Add more payment icons if needed */}
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
