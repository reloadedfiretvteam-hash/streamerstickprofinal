import { useState, useEffect } from "react";
import { ShoppingCart, ArrowUp, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/store";

interface StickyMobileCTAProps {
  onContact?: () => void;
}

export function StickyMobileCTA({ onContact }: StickyMobileCTAProps = {}) {
  const [visible, setVisible] = useState(false);
  const { items, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const showAfter = 500;
      setVisible(scrollY > showAfter);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToShop = () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          <div className="bg-gray-900/98 backdrop-blur-xl border-t-2 border-white/20 px-4 py-4 safe-area-pb shadow-2xl">
            <div className="flex gap-3">
              {onContact && (
                <button
                  onClick={onContact}
                  className="bg-white/20 hover:bg-white/30 border-2 border-white/30 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center shadow-lg transition-all"
                  data-testid="sticky-contact-button"
                  aria-label="Contact us"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={scrollToShop}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 text-base"
                data-testid="sticky-shop-button"
              >
                <ShoppingCart className="w-5 h-5" />
                Shop Now
              </button>
              {items.length > 0 && (
                <button
                  onClick={openCart}
                  className="bg-white text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-base"
                  data-testid="sticky-cart-button"
                >
                  Cart ({items.length})
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 z-40 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors hidden md:flex"
          data-testid="scroll-to-top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
