import { useState, useEffect } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ExitIntentPopupProps {
  onClose: () => void;
  onAction?: () => void;
}

/**
 * Exit Intent Popup Component
 * Shows a popup when user tries to leave the page
 * Encourages them to stay or reminds them about the website
 */
export default function ExitIntentPopup({ onClose, onAction }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup today
    const lastShown = localStorage.getItem('exit_intent_shown');
    const today = new Date().toDateString();
    
    if (lastShown === today) {
      return; // Don't show if already shown today
    }

    // Track mouse movement to detect exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is moving upward (toward address bar/bookmarks)
      if (e.clientY <= 0) {
        setIsVisible(true);
        localStorage.setItem('exit_intent_shown', today);
        
        // Track exit intent event for retargeting
        if ((window as any).fbq) {
          (window as any).fbq('track', 'Lead', {
            content_name: 'Exit Intent Popup Shown',
          });
        }
        
        if ((window as any).gtag) {
          (window as any).gtag('event', 'exit_intent', {
            event_category: 'engagement',
            event_label: 'Exit Intent Popup',
          });
        }
      }
    };

    // Also detect when user tries to close tab/window
    const handleBeforeUnload = () => {
      if (!isVisible) {
        setIsVisible(true);
        localStorage.setItem('exit_intent_shown', today);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const handleStay = () => {
    setIsVisible(false);
    onClose();
    
    // Track "Stay" action
    if ((window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: 'User Stayed After Exit Intent',
      });
    }
    
    if (onAction) {
      onAction();
    }
  };

  const handleShopNow = () => {
    setIsVisible(false);
    onClose();
    
    // Track "Shop Now" click
    if ((window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: 'Exit Intent - Shop Now Clicked',
      });
    }
    
    if ((window as any).gtag) {
      (window as any).gtag('event', 'click', {
        event_category: 'engagement',
        event_label: 'Exit Intent - Shop Now',
      });
    }
    
    // Navigate to shop
    window.location.href = '/shop';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <Card className="relative w-full max-w-md mx-4 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 border-2 border-white/20 shadow-2xl animate-in zoom-in-95">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
          onClick={handleStay}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <CardContent className="p-8 text-center text-white">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-yellow-300 animate-pulse" />
              <Gift className="h-8 w-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-3 drop-shadow-lg">
            Wait! Don't Miss Out! 🎁
          </h2>
          
          <p className="text-lg mb-2 text-white/90">
            Get the best IPTV streaming experience
          </p>
          
          <p className="text-sm mb-6 text-white/80">
            Thousands of channels • Premium quality • 24/7 support
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={handleShopNow}
              className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg py-6 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              Shop Now - Special Offer! 🚀
            </Button>
            
            <Button
              onClick={handleStay}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10"
            >
              Continue Browsing
            </Button>
          </div>
          
          <p className="text-xs mt-4 text-white/70">
            We'll remember you visited! Come back anytime. 😊
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
