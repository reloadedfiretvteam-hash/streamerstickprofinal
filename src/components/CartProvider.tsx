import { useState, useEffect, ReactNode, useCallback } from 'react';
import { CartContext, CartItem } from '../context/CartContext';

const CART_STORAGE_KEY = 'cart_items';

/**
 * Loads cart items from localStorage
 * @returns The stored cart items or an empty array if none exist
 */
function loadCartFromStorage(): CartItem[] {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load cart from localStorage:', error);
  }
  return [];
}

/**
 * Saves cart items to localStorage
 * @param items - The cart items to save
 */
function saveCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to save cart to localStorage:', error);
  }
}

interface CartProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages shopping cart state with localStorage persistence
 */
export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  /**
   * Adds an item to the cart. If the item already exists (by productId),
   * updates the quantity while keeping other properties unchanged.
   */
  const addToCart = useCallback((item: CartItem) => {
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
  }, []);

  /**
   * Removes an item from the cart by productId
   */
  const removeFromCart = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  }, []);

  /**
   * Updates the quantity of an existing item in the cart.
   * If quantity is 0 or less, the item is removed from the cart.
   */
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      return prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  /**
   * Clears all items from the cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
