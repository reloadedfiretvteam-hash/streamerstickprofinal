import { useState, ReactNode } from 'react';
import { CartContext, CartItem } from '../context/CartContext';

interface CartProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages shopping cart state
 */
export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  /**
   * Adds an item to the cart
   */
  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.productId === item.productId);
      if (existingItem) {
        return prevItems.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, item];
    });
  };

  /**
   * Removes an item from the cart by productId
   */
  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  /**
   * Clears all items from the cart
   */
  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
