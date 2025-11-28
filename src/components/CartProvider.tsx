import { createContext, useState, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  type: 'firestick' | 'iptv';
  image: string;
  badge: string;
  popular: boolean;
  period?: string;
  savings?: string;
  features: string[];
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartItemCount: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      setCartItems(prev => prev.filter(item => item.id !== id));
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      cartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}
