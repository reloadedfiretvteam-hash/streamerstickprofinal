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
   * Adds an item to the cart. If the item already exists (by productId),
   * updates the quantity while keeping other properties unchanged.
   */
  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.productId === item.productId);
      if (existingIndex !== -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...prevItems[existingIndex],
          quantity: prevItems[existingIndex].quantity + item.quantity,
        };
        return updated;
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
