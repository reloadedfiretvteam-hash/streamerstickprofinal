import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Zap, X, MessageCircle, Gift } from "lucide-react";
import { playCtaClick } from "@/lib/ctaSound";
import { Button } from "@/components/ui/button";

interface FloatingCTAProps {
  onBuyNow?: () => void;
  onContact?: () => void;
  onFreeTrial?: () => void;
}

export function FloatingCTA({ onBuyNow, onContact, onFreeTrial }: FloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const showThreshold = 600;
      
      if (scrollY > showThreshold && !isDismissed) {
        setIsVisible(true);
      } else if (scrollY <= showThreshold) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const goToProducts = () => {
    playCtaClick();
    const shopSection = document.getElementById("shop");
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: "smooth" });
    }
    if (onBuyNow) onBuyNow();
  };

  const goToFreeTrial = () => {
    playCtaClick();
    if (onFreeTrial) onFreeTrial();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-40 hidden md:block"
          data-testid="floating-cta"
        >
          <div className="relative">
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors z-10"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>
            
            <div className="bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] p-1 rounded-2xl shadow-2xl shadow-cyan-500/20">
              <div className="bg-[#0A0A0F]/95 backdrop-blur-lg rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00D4FF] to-[#7C3AED] rounded-xl flex items-center justify-center animate-pulse">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base">Choose IPTV, Devices, or Bundles</p>
                    <p className="text-gray-300 text-sm">Start with a trial or jump straight into loaded devices.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={goToFreeTrial}
                      variant="outline"
                      className="bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 border-[#7C3AED]/50 text-white font-semibold px-3 shadow-lg"
                      data-testid="button-floating-trial"
                      title="Free 36-Hour Trial"
                    >
                      <Gift className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={onContact}
                      variant="outline"
                      className="bg-white/10 hover:bg-white/20 border-white/30 text-white font-semibold px-4 shadow-lg"
                      data-testid="button-floating-contact"
                      title="Contact Us"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={goToProducts}
                      className="bg-[#00D4FF] hover:bg-[#10F7BE] text-[#0A0A0F] font-bold px-6 shadow-lg shadow-cyan-500/20"
                      data-testid="button-floating-cta"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Options
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
