import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X, Flame, ShoppingCart, ChevronRight, Tv, Wifi, BookOpen, HelpCircle, Home, Mail } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/store";

interface MobileNavProps {
  scrollToShop: () => void;
  scrollToAbout: () => void;
  scrollToFaq: () => void;
}

export function MobileNav({ scrollToShop, scrollToAbout, scrollToFaq }: MobileNavProps) {
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
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const menuItems = [
    { label: "Home", icon: Home, action: () => { setLocation("/"); } },
    { label: "Fire Sticks", icon: Tv, action: () => navigateToSection("shop") },
    { label: "IPTV Plans", icon: Wifi, action: () => navigateToSection("shop") },
    { label: "How It Works", icon: ChevronRight, action: () => navigateToSection("about") },
    { label: "Blog", icon: BookOpen, action: () => setLocation("/blog") },
    { label: "Support & FAQ", icon: HelpCircle, action: () => navigateToSection("faq") },
    { 
      label: "Customer Support", 
      icon: Mail, 
      action: () => {
        const subject = encodeURIComponent("Customer Support Request");
        window.location.href = `mailto:reloadedfiretvteam@gmail.com?subject=${subject}`;
        setIsOpen(false);
      } 
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
      <SheetContent side="left" className="w-[300px] bg-gray-900 border-r border-white/10 p-0">
        <SheetHeader className="p-6 border-b border-white/10">
          <SheetTitle className="flex items-center gap-2 text-white">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 font-bold">
              Stream Stick Pro
            </span>
          </SheetTitle>
        </SheetHeader>
        
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavClick(item.action)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-5 h-5 text-orange-400" />
                  <span className="font-medium">{item.label}</span>
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
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
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
          
          <div className="mt-6 p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg border border-orange-400/30">
            <p className="text-sm text-orange-200 font-medium mb-2">Limited Time Offer!</p>
            <p className="text-xs text-gray-300">Get up to 50% off on yearly IPTV subscriptions.</p>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
