import { useState } from "react";
import { useLocation } from "wouter";
import {
  Menu,
  Flame,
  ShoppingCart,
  Tv,
  Wifi,
  Home,
  Package,
  Shield,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Mail,
  Gift,
  PlayCircle,
  Smartphone,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/store";
import { trackVpnClick } from "@/lib/vpn-tracking";

interface MobileNavProps {
  scrollToShop: () => void;
  scrollToFaq: () => void;
  scrollToAbout?: () => void;
  onSupportClick?: () => void;
}

export function MobileNav({ scrollToShop, scrollToFaq, scrollToAbout, onSupportClick }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { items, openCart } = useCart();

  const handleNavClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const navigateToSection = (sectionId: string) => {
    if (location !== "/" && !location.startsWith("/?")) {
      setLocation("/?section=" + sectionId);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const menuItems: { label: string; icon: typeof Home; action: () => void }[] = [
    { label: "Home", icon: Home, action: () => { setLocation("/"); } },
    { label: "36-Hour Trial", icon: Gift, action: () => { setLocation("/36hr-trial"); } },
    { label: "Shop plans & devices", icon: ShoppingCart, action: () => navigateToSection("shop") },
    { label: "Loaded devices", icon: Tv, action: () => { setLocation("/devices"); } },
    { label: "ONN Google TV", icon: Smartphone, action: () => { setLocation("/onn"); } },
    { label: "Reloaded Fire TV", icon: Wifi, action: () => { setLocation("/iptv"); } },
    { label: "Bundles", icon: Package, action: () => { setLocation("/bundles"); } },
    {
      label: "Surfshark VPN",
      icon: Shield,
      action: () => {
        trackVpnClick({ source: location || "/", placement: "mobile_nav_vpn" });
        setLocation("/vpn");
      }
    },
    ...(scrollToAbout
      ? [{ label: "How It Works", icon: ChevronRight, action: () => navigateToSection("about") }]
      : []),
    { label: "FAQ", icon: HelpCircle, action: () => navigateToSection("faq") },
    { label: "Tutorials", icon: PlayCircle, action: () => { setLocation("/tutorials"); } },
    { label: "Blog", icon: BookOpen, action: () => { setLocation("/blog"); } },
    { label: "Locations", icon: ChevronRight, action: () => { setLocation("/locations"); } },
    {
      label: "Customer Support",
      icon: Mail,
      action: () => {
        if (onSupportClick) {
          onSupportClick();
        } else {
          window.location.href = "mailto:reloadedfiretvteam@gmail.com?subject=Customer Support Request";
        }
        setIsOpen(false);
      },
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/10"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-6 h-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100vw-2rem,340px)] sm:w-[340px] bg-[#0A0A0F] border-r border-[#2A2A33] p-0">
        <SheetHeader className="p-6 border-b border-white/10">
          <SheetTitle className="flex items-center gap-2 text-white">
            <Flame className="w-6 h-6 text-[#00D4FF]" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#FAD02C] font-bold">
              Stream Stick Pro
            </span>
          </SheetTitle>
        </SheetHeader>

        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleNavClick(item.action)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 min-h-[52px] text-[15px] text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-left active:bg-white/15"
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <item.icon className="w-5 h-5 text-[#00D4FF] shrink-0" aria-hidden />
                  <span className="font-semibold leading-snug">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t border-white/10">
            <Button
              onClick={() => {
                openCart();
                setIsOpen(false);
              }}
              className="w-full bg-[#00D4FF] hover:bg-[#10F7BE] text-[#0A0A0F] shadow-lg"
              data-testid="mobile-nav-cart"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              View Cart
              {items.length > 0 && (
                <Badge className="ml-2 bg-white text-black">
                  {items.length}
                </Badge>
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-cyan-500/15 to-emerald-500/10 rounded-lg border border-cyan-400/30">
            <p className="text-sm text-cyan-200 font-medium mb-2">Quick Start</p>
            <p className="text-xs text-gray-300">Use the hero buttons for trial, devices, ONN, and VPN.</p>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
