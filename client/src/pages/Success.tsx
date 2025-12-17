import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { CheckCircle, ArrowRight, Download, Youtube, Mail, Clock, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface OrderDetails {
  order: {
    id: string;
    realProductName: string;
    amount: number;
    customerEmail: string;
  };
  paymentStatus: string;
}

export default function Success() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Order Confirmed | StreamStickPro";
    
    const params = new URLSearchParams(search);
    const sessionId = params.get("session_id");
    
    if (sessionId) {
      fetch(`/api/checkout/session/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.order) {
            setOrderDetails(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-black text-foreground flex flex-col items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-primary/30 bg-card/50 backdrop-blur shadow-2xl shadow-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Order Confirmed!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orderDetails ? (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-sm">{orderDetails.order.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Product</span>
                <span className="font-semibold">{orderDetails.order.realProductName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-primary">${(orderDetails.order.amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email</span>
                <span className="text-sm">{orderDetails.order.customerEmail}</span>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Mail className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-200">Check Your Email</h4>
                <p className="text-sm text-blue-300/80 mt-1">
                  You'll receive an order confirmation email right away.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <Clock className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-200">Credentials Coming Soon</h4>
                <p className="text-sm text-purple-300/80 mt-1">
                  Your login credentials will be sent within 5 minutes. Check your spam folder!
                </p>
              </div>
            </div>
          </div>
          
          <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10 relative group">
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80">
              <Youtube className="w-16 h-16 text-red-600 mb-3" />
              <p className="text-white font-medium text-lg">Setup Guide Video</p>
              <p className="text-sm text-gray-400 mt-1">Coming Soon</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-primary" /> Quick Start Guide
            </h4>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">1</span>
                <span>Check your email for login credentials</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">2</span>
                <span>Download the Live TV app on your device</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">3</span>
                <span>Enter your credentials and start streaming!</span>
              </li>
            </ol>
          </div>

          <Button 
            onClick={() => setLocation("/")} 
            className="w-full bg-primary hover:bg-primary/90 h-14 text-lg font-semibold shadow-lg shadow-primary/25"
            data-testid="button-return-store"
          >
            Return to Store
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
