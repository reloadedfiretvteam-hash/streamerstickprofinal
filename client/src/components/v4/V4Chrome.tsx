import { useState } from "react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandLogo";
import { useCart } from "@/lib/store";

const NAV = [
  { label: "Devices", href: "/devices" },
  { label: "Subscriptions", href: "/plans" },
  { label: "Trial", href: "/36hr-trial" },
  { label: "Support", href: "/support" },
] as const;

function Wordmark() {
  return (
    <span className="v4-wordmark inline-flex items-center gap-2 text-[25px] font-bold tracking-tight text-[#F8FAFC]">
      <BrandMark className="h-8 w-8" />
      StreamStick<span className="text-[#23C768]">Pro</span>
    </span>
  );
}

export function V4Header() {
  const { items, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-[100] border-b border-[#233145] bg-[#08111F] text-[#F8FAFC]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[200] focus:bg-white focus:px-3 focus:py-2 focus:text-[#0B1220]">
        Skip to content
      </a>
      <div className="v4-shell flex h-16 items-center justify-between gap-3 lg:h-20">
        <Link href="/">
          <span className="inline-flex items-center">
            <Wordmark />
          </span>
        </Link>
        <nav className="hidden items-center justify-center gap-8 text-[17px] font-semibold md:flex" aria-label="Store">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className="min-h-11 px-1 py-2 hover:text-[#79D5FF]">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/36hr-trial">
            <span className="v4-btn v4-btn-primary hidden min-h-11 px-4 text-sm sm:inline-flex">Free Trial</span>
          </Link>
          <button type="button" className="v4-btn v4-btn-secondary-dark min-h-11 px-3 text-sm" onClick={openCart}>
            Cart{count ? ` (${count})` : ""}
          </button>
          <button
            type="button"
            className="v4-btn v4-btn-secondary-dark min-h-11 min-w-11 px-3 md:hidden"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-[#233145] bg-[#08111F] md:hidden">
          <div className="v4-shell flex flex-col gap-1 py-4">
            <Link href="/36hr-trial">
              <span className="v4-btn v4-btn-primary w-full" onClick={() => setOpen(false)}>
                Start the 36-hour trial
              </span>
            </Link>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="block min-h-11 py-3 font-semibold" onClick={() => setOpen(false)}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function V4Footer() {
  return (
    <footer className="bg-[#040A12] text-[#F8FAFC]">
      <div className="v4-shell grid gap-8 py-16 md:grid-cols-4">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-[#A8B6C8]">
            Google TV device packages and plans for a compatible device you already own. United States and Canada checkout.
          </p>
        </div>
        {[
          { title: "Shop", links: [["Google packages", "/devices"], ["Subscriptions", "/plans"], ["36-hour trial", "/36hr-trial"]] },
          { title: "Help", links: [["Compatibility", "/compatibility"], ["Setup", "/setup"], ["Support", "/support"]] },
          { title: "Company", links: [["Learn", "/learn"], ["Device finder", "/device-finder"], ["Refunds", "/refund"]] },
        ].map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#A8B6C8]">{group.title}</h2>
            <ul className="mt-3 space-y-2">
              {group.links.map(([label, href]) => (
                <li key={href + label}>
                  <Link href={href}>
                    <span className="text-[#F8FAFC] underline-offset-4 hover:underline">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[#233145]">
        <div className="v4-shell flex flex-wrap gap-4 py-6 text-sm text-[#A8B6C8]">
          <Link href="/terms"><span>Terms</span></Link>
          <Link href="/privacy"><span>Privacy</span></Link>
          <Link href="/refund"><span>Refunds</span></Link>
        </div>
      </div>
    </footer>
  );
}
