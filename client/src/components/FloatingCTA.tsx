import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Zap, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingCTAProps {
  onBuyNow?: () => void;
  onContact?: () => void;
}

export function FloatingCTA({ onBuyNow, onContact }: FloatingCTAProps) {
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

  const scrollToProducts = () => {
    const shopSection = document.getElementById("shop");
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: "smooth" });
    }
    if (onBuyNow) onBuyNow();
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
            
            <div className="bg-gradient-to-r from-orange-600 to-purple-600 p-1 rounded-2xl shadow-2xl shadow-orange-500/30">
              <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-purple-500 rounded-xl flex items-center justify-center animate-pulse">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base">Ready to Cut the Cord?</p>
                    <p className="text-gray-200 text-sm">18,000+ channels from $15/mo</p>
                  </div>
                  <div className="flex gap-2">
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
                      onClick={scrollToProducts}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 shadow-lg shadow-orange-500/30"
                      data-testid="button-floating-cta"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Shop Now
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
