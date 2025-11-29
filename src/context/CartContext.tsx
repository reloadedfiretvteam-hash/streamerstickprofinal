import { createContext } from 'react';

/**
 * Represents an item in the shopping cart
 */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

/**
 * The shape of the cart context value
 */
export interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

/**
 * React Context for the shopping cart
 */
export const CartContext = createContext<CartContextType | undefined>(undefined);
