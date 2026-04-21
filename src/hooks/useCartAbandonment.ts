import { useEffect, useRef } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function useCartAbandonment(
  cartItems: CartItem[],
  customerEmail: string
) {
  const abandonmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
    }

    if (cartItems.length > 0 && customerEmail) {
      abandonmentTimerRef.current = setTimeout(async () => {
        if (!hasTrackedRef.current) {
          await trackAbandonment();
          hasTrackedRef.current = true;
        }
      }, 5 * 60 * 1000);
    }

    return () => {
      if (abandonmentTimerRef.current) {
        clearTimeout(abandonmentTimerRef.current);
      }
    };
  }, [cartItems, customerEmail]);

  const trackAbandonment = async () => {
    if (cartItems.length === 0 || !customerEmail) return;

    try {
      const cartTotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await fetch('/api/track-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerEmail,
          cartItems: cartItems.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: cartTotal,
        }),
      });
    } catch (error) {
      console.error('Error tracking cart abandonment:', error);
    }
  };

  const markAsRecovered = async (_orderId: string) => {
    hasTrackedRef.current = false;
  };

  return { trackAbandonment, markAsRecovered };
}
