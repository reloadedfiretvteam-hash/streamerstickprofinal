import { useState } from "react";
import { useLocation } from "wouter";
import { apiCall } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiCall("/api/customer/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send reset email");
      }

      setIsEmailSent(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-white">Check Your Email</CardTitle>
            <CardDescription className="text-gray-400">
              If an account exists with <span className="text-orange-400">{email}</span>, 
              you will receive a password reset link shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setIsEmailSent(false)}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                data-testid="button-try-again"
              >
                Try Different Email
              </Button>
              <Button
                onClick={() => navigate("/customer-login")}
                className="w-full bg-orange-500 hover:bg-orange-600"
                data-testid="button-back-to-login"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Forgot Password?</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  data-testid="input-forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              data-testid="button-send-reset-link"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="text-gray-400 hover:text-white"
              onClick={() => navigate("/customer-login")}
              data-testid="link-back-to-login"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
