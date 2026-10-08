import { useEffect, useId, useRef, useState } from "react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandLogo";
import { FooterAdminSlot } from "@/components/OwnerStoreUtils";
import { useCart } from "@/lib/store";

export const STAGING_NAV = [
  { label: "Devices", href: "/devices/" },
  { label: "Plans", href: "/plans/" },
  { label: "Compatibility", href: "/compatibility/" },
  { label: "Setup", href: "/setup/" },
  { label: "Learn", href: "/learn/" },
  { label: "Support", href: "/support/" },
] as const;

function Wordmark() {
  return (
    <span className="stg-wordmark inline-flex items-center gap-2 text-[22px] font-bold tracking-tight text-[#F8FAFC]">
      <BrandMark className="h-8 w-8" />
      StreamStick<span className="text-[#23C768]">Pro</span>
    </span>
  );
}

export function StagingHeader() {
  const { items, openCart } = useCart();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>("a,button");
    focusables?.[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (event.key !== "Tab" || !focusables?.length) return;
      const list = Array.from(focusables);
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="stg-header">
      <div className="stg-shell stg-header-row">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[200] focus:bg-white focus:px-3 focus:py-2 focus:text-[#0B1220]">
          Skip to content
        </a>
        <Link href="/">
          <span className="inline-flex items-center">
            <Wordmark />
          </span>
        </Link>
        <nav className="stg-nav" aria-label="Store">
          {STAGING_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className="min-h-11 py-2 hover:text-[#79D5FF]">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/device-finder/">
            <span className="hidden min-h-11 px-2 py-2 text-[15px] font-semibold text-[#79D5FF] min-[1180px]:inline-flex">Device Finder</span>
          </Link>
          <button type="button" className="stg-btn stg-btn-secondary px-4" onClick={openCart}>
            Cart{count ? ` (${count})` : ""}
          </button>
          <button
            ref={buttonRef}
            type="button"
            className="stg-btn stg-btn-secondary stg-menu-btn px-3"
            aria-expanded={open}
            aria-controls={titleId}
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </div>
      </div>
      <div className="stg-drawer" data-open={open ? "true" : "false"} onClick={() => setOpen(false)}>
        <div
          ref={panelRef}
          id={titleId}
          className="stg-drawer-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onClick={(event) => event.stopPropagation()}
        >
          <button type="button" className="stg-btn stg-btn-secondary w-full" onClick={() => { setOpen(false); buttonRef.current?.focus(); }}>
            Close
          </button>
          <div className="mt-6 flex flex-col gap-2">
            {STAGING_NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className="block min-h-11 py-3 font-semibold" onClick={() => setOpen(false)}>
                  {item.label}
                </span>
              </Link>
            ))}
            <Link href="/device-finder/">
              <span className="block min-h-11 py-3 font-semibold" onClick={() => setOpen(false)}>
                Device Finder
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export function StagingFooter() {
  return (
    <footer className="stg-footer">
      <div className="stg-shell grid gap-8 py-16 md:grid-cols-4">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-[#A8B6C8]">
            StreamStickPro. ONN Google TV packages and live TV plans for a compatible device you already own. United States and Canada checkout.
          </p>
        </div>
        {[
          { title: "Shop", links: STAGING_NAV.slice(0, 2).map((i) => [i.label, i.href] as const) },
          { title: "Help", links: STAGING_NAV.slice(2).map((i) => [i.label, i.href] as const) },
          { title: "Company", links: [["Shop", "/shop"], ["VPN", "/vpn"], ["Device finder", "/device-finder/"], ["Refunds", "/refund"], ["Terms", "/terms"]] as const },
        ].map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#A8B6C8]">{group.title}</h2>
            <ul className="mt-3 space-y-2">
              {group.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href}>
                    <span className="underline-offset-4 hover:underline">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="stg-shell pb-8">
        <FooterAdminSlot />
      </div>
    </footer>
  );
}
