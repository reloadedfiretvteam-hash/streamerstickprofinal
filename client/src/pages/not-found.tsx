import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";
import { setPageMeta } from "@/lib/seo";

export default function NotFound() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setPageMeta({
      title: "Page Not Found | StreamStickPro",
      description: "Page not found. StreamStickPro—IPTV, Fire Sticks, 18,000+ channels. Return to home or shop.",
      noindex: true,
    });
    document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
    const robots = document.querySelector('meta[name="robots"]');
    return () => {
      if (robots) robots.setAttribute("content", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            <a href="/" className="text-orange-400 hover:underline">Home</a>
            {" · "}
            <a href="/shop" className="text-orange-400 hover:underline">Shop</a>
            {" · "}
            <a href="/blog" className="text-orange-400 hover:underline">Blog</a>
          </p>
          <Button 
            onClick={() => setLocation("/")}
            className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            data-testid="button-back-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
