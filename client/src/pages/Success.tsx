import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Success() {
  const [location, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full border-primary/50 bg-card shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Order Confirmed!</CardTitle>
          <CardDescription className="text-lg">
            Thank you for your purchase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-sm text-muted-foreground text-center">
            <p>Your payment has been successfully processed.</p>
            <p>Check your email inbox (and spam folder) in the next 5 minutes for your setup instructions and credentials.</p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border border-white/10 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" /> Next Steps:
            </h4>
            <ol className="list-decimal list-inside text-sm space-y-2 text-muted-foreground">
              <li>Wait for the "Welcome" email.</li>
              <li>Follow the setup guide video.</li>
              <li>Enter your username/password.</li>
            </ol>
          </div>

          <Button onClick={() => setLocation("/")} className="w-full bg-primary hover:bg-primary/90">
            Return to Store
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
