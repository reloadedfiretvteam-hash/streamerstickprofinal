import { useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { CartContext, CartItem } from '../context/CartContext';

/** Storage key for persisting cart items to localStorage */
const CART_STORAGE_KEY = 'cart_items';

/**
 * Validates that an object has the required CartItem properties with correct types.
 * Used to ensure data integrity when loading from localStorage.
 * 
 * @param item - The item to validate
 * @returns True if the item is a valid CartItem, false otherwise
 */
function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== 'object' || item === null) {
    return false;
  }
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.productId === 'string' &&
    obj.productId.length > 0 &&
    typeof obj.name === 'string' &&
    obj.name.length > 0 &&
    typeof obj.price === 'number' &&
    obj.price >= 0 &&
    typeof obj.quantity === 'number' &&
    obj.quantity > 0
  );
}

/**
 * Loads cart items from localStorage.
 * Filters out any invalid items to ensure data integrity.
 * 
 * @returns The stored cart items or an empty array if none exist
 */
function loadCartFromStorage(): CartItem[] {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      if (Array.isArray(parsed)) {
        // Validate each item has required properties
        return parsed.filter(isValidCartItem);
      }
    }
  } catch (error) {
    console.warn('Failed to load cart from localStorage:', error);
  }
  return [];
}

/**
 * Saves cart items to localStorage.
 * Handles storage quota errors gracefully.
 * 
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
 * Provider component that manages shopping cart state with localStorage persistence.
 * 
 * Features:
 * - Automatic persistence to localStorage
 * - Cross-tab synchronization via storage events
 * - Optimized performance with memoized callbacks
 * - Validation of cart item data integrity
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <CartProvider>
 *       <ShoppingCart />
 *       <Checkout />
 *     </CartProvider>
 *   );
 * }
 * ```
 */
export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  // Listen for storage events to sync cart across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY && event.newValue !== null) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (Array.isArray(parsed)) {
            const validItems = parsed.filter(isValidCartItem);
            setItems(validItems);
          }
        } catch (error) {
          console.warn('Failed to sync cart from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Adds an item to the cart. If the item already exists (by productId),
   * updates the quantity while keeping other properties unchanged.
   * 
   * @param item - The cart item to add
   */
  const addToCart = useCallback((item: CartItem) => {
    // Validate item before adding
    if (!item.productId || item.price < 0 || item.quantity <= 0) {
      console.warn('Invalid cart item:', item);
      return;
    }

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
   * Removes an item from the cart by productId.
   * This operation is idempotent - removing a non-existent item is a no-op.
   * 
   * @param productId - The ID of the product to remove
   */
  const removeFromCart = useCallback((productId: string) => {
    if (!productId) {
      console.warn('Invalid productId for removal');
      return;
    }
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  }, []);

  /**
   * Updates the quantity of an existing item in the cart.
   * If quantity is 0 or less, the item is removed from the cart.
   * If the item doesn't exist in the cart, this is a no-op (idempotent).
   * 
   * @param productId - The ID of the product to update
   * @param quantity - The new quantity (if <= 0, item is removed)
   */
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (!productId) {
      console.warn('Invalid productId for quantity update');
      return;
    }

    setItems((prevItems) => {
      // Check if item exists in cart
      const itemExists = prevItems.some((item) => item.productId === productId);
      if (!itemExists) {
        return prevItems;
      }
      
      if (quantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      return prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  /**
   * Clears all items from the cart.
   * Also clears the persisted cart from localStorage.
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Calculates the total price of all items in the cart.
   * Uses memoization for performance optimization.
   * 
   * @returns The total price (sum of price * quantity for all items)
   */
  const getCartTotal = useCallback((): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  /**
   * Gets the total number of items in the cart.
   * 
   * @returns The sum of all item quantities
   */
  const getCartItemCount = useCallback((): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  }), [items, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}
