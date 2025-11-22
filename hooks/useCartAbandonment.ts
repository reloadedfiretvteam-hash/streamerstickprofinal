import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

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
  const abandonmentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Clear any existing timer
    if (abandonmentTimerRef.current) {
      clearTimeout(abandonmentTimerRef.current);
    }

    // Only track if there are items and email
    if (cartItems.length > 0 && customerEmail) {
      // Wait 5 minutes before marking as abandoned
      abandonmentTimerRef.current = setTimeout(async () => {
        if (!hasTrackedRef.current) {
          await trackAbandonment();
          hasTrackedRef.current = true;
        }
      }, 5 * 60 * 1000); // 5 minutes
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

      const cartData = cartItems.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      // Check if abandonment already exists for this email
      const { data: existing } = await supabase
        .from('cart_abandonments')
        .select('id')
        .eq('customer_email', customerEmail)
        .is('recovered_at', null)
        .order('abandoned_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Update existing abandonment
        await supabase
          .from('cart_abandonments')
          .update({
            cart_items: cartData,
            cart_total: cartTotal,
            abandoned_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new abandonment record
        await supabase.from('cart_abandonments').insert({
          customer_email: customerEmail,
          cart_items: cartData,
          cart_total: cartTotal
        });
      }

      console.log('Cart abandonment tracked for:', customerEmail);
    } catch (error) {
      console.error('Error tracking cart abandonment:', error);
    }
  };

  const markAsRecovered = async (orderId: string) => {
    if (!customerEmail) return;

    try {
      await supabase
        .from('cart_abandonments')
        .update({
          recovered_at: new Date().toISOString(),
          recovery_order_id: orderId
        })
        .eq('customer_email', customerEmail)
        .is('recovered_at', null);

      hasTrackedRef.current = false;
    } catch (error) {
      console.error('Error marking cart as recovered:', error);
    }
  };

  return { trackAbandonment, markAsRecovered };
}
