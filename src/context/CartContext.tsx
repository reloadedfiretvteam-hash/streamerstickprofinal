import { createContext } from 'react';

/**
 * Represents an item in the shopping cart.
 * 
 * @property productId - Unique identifier for the product
 * @property name - Display name of the product
 * @property price - Unit price of the product (must be positive)
 * @property quantity - Number of items in cart (must be positive)
 * @property image - Optional image URL for the product
 */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

/**
 * The shape of the cart context value.
 * Provides access to cart items and all cart operations.
 * 
 * @property items - Array of cart items
 * @property addToCart - Function to add an item to the cart
 * @property removeFromCart - Function to remove an item by productId
 * @property updateQuantity - Function to update item quantity
 * @property clearCart - Function to clear all items from cart
 * @property getCartTotal - Function to calculate the total price of all items
 * @property getCartItemCount - Function to get the total count of items in cart
 */
export interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  /** Calculates the total price of all items in the cart */
  getCartTotal: () => number;
  /** Gets the total number of items in the cart (sum of all quantities) */
  getCartItemCount: () => number;
}

/**
 * React Context for the shopping cart.
 * 
 * This context provides centralized state management for the shopping cart,
 * including persistence to localStorage and synchronization across browser tabs.
 * 
 * @example
 * ```tsx
 * // Wrap your app with CartProvider
 * <CartProvider>
 *   <App />
 * </CartProvider>
 * 
 * // Use the cart in components
 * const { items, addToCart, getCartTotal } = useCart();
 * ```
 */
export const CartContext = createContext<CartContextType | undefined>(undefined);
