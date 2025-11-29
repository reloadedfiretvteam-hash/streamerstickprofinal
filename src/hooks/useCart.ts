import { useContext } from 'react';
import { CartContext, CartContextType } from '../context/CartContext';

/**
 * Custom hook to access the shopping cart context.
 * Provides access to cart items and all cart operations.
 * 
 * @returns The cart context with items, addToCart, removeFromCart, updateQuantity, 
 *          clearCart, getCartTotal, and getCartItemCount
 * @throws Error if used outside of CartProvider
 * 
 * @example
 * ```tsx
 * function ShoppingCart() {
 *   const { items, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount } = useCart();
 * 
 *   // Add an item
 *   addToCart({ productId: '123', name: 'Product', price: 9.99, quantity: 1 });
 * 
 *   // Update quantity
 *   updateQuantity('123', 2);
 * 
 *   // Remove an item
 *   removeFromCart('123');
 * 
 *   // Get cart totals
 *   const total = getCartTotal(); // Returns total price
 *   const count = getCartItemCount(); // Returns total item count
 * 
 *   // Clear all items
 *   clearCart();
 * 
 *   return (
 *     <div>
 *       <p>Items: {count}</p>
 *       <p>Total: ${total.toFixed(2)}</p>
 *       {items.map(item => (
 *         <div key={item.productId}>{item.name}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
}
