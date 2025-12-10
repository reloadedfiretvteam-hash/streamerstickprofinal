import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

/**
 * NavEliteSEO Component
 * Small navigation link component to add to the header for accessing Elite SEO tools
 */
export function NavEliteSEO() {
  const [, setLocation] = useLocation();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocation("/elite-seo")}
      className="text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
      data-testid="nav-elite-seo"
    >
      <Zap className="w-4 h-4 text-yellow-400" />
      <span className="hidden sm:inline">SEO Tools</span>
    </Button>
  );
}
