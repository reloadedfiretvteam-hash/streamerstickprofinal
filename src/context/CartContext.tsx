import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';

/**
 * CartItem interface for items in the shopping cart.
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

/**
 * Product interface for products that can be added to the cart.
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  type?: 'firestick' | 'iptv';
  image: string;
  badge?: string;
  popular?: boolean;
  period?: string;
  savings?: string;
  features?: string[];
}

/**
 * CartContextType defines the shape of the cart context.
 */
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CART_STORAGE_KEY = 'inferno_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Safely parse cart items from localStorage.
 * Returns empty array if parsing fails or data is invalid.
 */
function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    // Validate each item has required fields
    return parsed.filter((item: unknown): item is CartItem => {
      if (typeof item !== 'object' || item === null) return false;
      const cartItem = item as Record<string, unknown>;
      return (
        typeof cartItem.id === 'string' &&
        typeof cartItem.name === 'string' &&
        typeof cartItem.price === 'number' &&
        typeof cartItem.quantity === 'number' &&
        typeof cartItem.image === 'string' &&
        cartItem.quantity > 0 &&
        cartItem.price >= 0
      );
    });
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
}

/**
 * Safely save cart items to localStorage.
 */
function saveCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
}

interface CartProviderProps {
  children: ReactNode;
}

/**
 * CartProvider component that provides cart state and actions to children.
 * Handles localStorage persistence and synchronization.
 */
export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadedItems = loadCartFromStorage();
    setItems(loadedItems);
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever items change (after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveCartToStorage(items);
    }
  }, [items, isInitialized]);

  // Sync cart across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue !== null) {
        try {
          const newItems = JSON.parse(e.newValue);
          if (Array.isArray(newItems)) {
            setItems(newItems);
          }
        } catch (error) {
          console.error('Error parsing cart from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addItem = useCallback((product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      total,
      isCartOpen,
      openCart,
      closeCart,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, total, isCartOpen, openCart, closeCart]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to access cart context.
 * Must be used within a CartProvider.
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
