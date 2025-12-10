import { Link } from "wouter";
import { Search } from "lucide-react";

/**
 * NavEliteSEO Component
 * 
 * A navigation link component for the Elite SEO page.
 * 
 * INTEGRATION INSTRUCTIONS:
 * 
 * Option 1 - Add to Admin Navigation:
 * If you have an admin panel, add this link to your admin navigation menu:
 * 
 *   import { NavEliteSEO } from "@/components/NavEliteSEO";
 *   
 *   // In your admin nav JSX:
 *   <NavEliteSEO />
 * 
 * Option 2 - Add to Main Navigation:
 * Add to your main site navigation (consider restricting to admin users):
 * 
 *   import { NavEliteSEO } from "@/components/NavEliteSEO";
 *   
 *   // In your main nav JSX:
 *   {user?.isAdmin && <NavEliteSEO />}
 * 
 * Option 3 - Direct Access:
 * Users can directly navigate to /elite-seo once the route is added to App.tsx
 */

export function NavEliteSEO() {
  return (
    <Link href="/elite-seo">
      <a className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-purple-500/10 rounded-lg transition-colors">
        <Search className="w-4 h-4" />
        <span>Elite SEO</span>
      </a>
    </Link>
  );
}

// Alternative compact version for tight spaces
export function NavEliteSEOCompact() {
  return (
    <Link href="/elite-seo">
      <a className="flex items-center justify-center w-10 h-10 text-slate-300 hover:text-white hover:bg-purple-500/10 rounded-lg transition-colors" title="Elite SEO Tools">
        <Search className="w-5 h-5" />
      </a>
    </Link>
  );
}
