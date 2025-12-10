import { Link } from "wouter";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Navigation link component for Elite SEO Tools
 * Add this to your main navigation/header component
 */
export default function NavEliteSEO() {
  return (
    <Link href="/elite-seo">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-300 hover:text-white hover:bg-gray-800"
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        SEO Tools
      </Button>
    </Link>
  );
}
