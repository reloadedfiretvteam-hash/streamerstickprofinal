import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NavEliteSEO() {
  return (
    <Link href="/elite-seo">
      <Button
        variant="ghost"
        className="text-slate-300 hover:text-white hover:bg-blue-500/10 flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">Elite SEO</span>
      </Button>
    </Link>
  );
}
