import type { ReactNode } from "react";
import { Link } from "wouter";

const links = [
  { href: "/", label: "Home" },
  { href: "/devices", label: "Google TV Devices" },
  { href: "/plans", label: "Plans & Services" },
  { href: "/guides", label: "Setup Guides" },
  { href: "/support", label: "Support" },
];

export function StorefrontChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="shrink-0 text-sm font-semibold tracking-tight text-white">
            StreamStick Pro
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Store">
            {links.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="rounded-lg px-2.5 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <Link href="/devices">
            <span className="inline-flex rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
              Shop devices
            </span>
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden" aria-label="Store">
          {links.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className="inline-flex whitespace-nowrap rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-200">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-8 text-sm text-slate-600">
          {links.map((item) => (
            <Link key={`f-${item.href}`} href={item.href} className="hover:text-slate-900">
              {item.label}
            </Link>
          ))}
          <Link href="/shop" className="hover:text-slate-900">
            Shop
          </Link>
          <Link href="/track-order" className="hover:text-slate-900">
            Track order
          </Link>
          <Link href="/terms" className="hover:text-slate-900">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-slate-900">
            Privacy
          </Link>
          <Link href="/refund" className="hover:text-slate-900">
            Refunds
          </Link>
        </div>
      </footer>
    </div>
  );
}
