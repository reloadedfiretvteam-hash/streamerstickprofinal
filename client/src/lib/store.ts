import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const isFirestickProduct = (id: string): boolean => {
  return id.startsWith('fs-') || id.includes('firestick');
};

const calculateFirestickDiscount = (basePrice: number, quantity: number): number => {
  if (quantity >= 3) return basePrice * 0.85;
  if (quantity >= 2) return basePrice * 0.90;
  return basePrice;
};

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'firestick' | 'iptv' | 'design';
  description: string;
}

interface CartItem extends Product {
  quantity: number;
  basePrice?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  addItemWithQuantity: (product: Product, quantity: number, discountedPrice?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  total: () => number;
}

interface WishlistState {
  items: Product[];
  isOpen: boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: () => void;
  openWishlist: () => void;
  closeWishlist: () => void;
  clearWishlist: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product) => set((state) => {
        const existing = state.items.find(i => i.id === product.id);
        if (existing) {
          return {
            items: state.items.map(i => 
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
            isOpen: true
          };
        }
        return { items: [...state.items, { ...product, quantity: 1 }], isOpen: true };
      }),
      addItemWithQuantity: (product, quantity, discountedPrice) => set((state) => {
        const priceToUse = discountedPrice ?? product.price;
        const isFirestick = isFirestickProduct(product.id);
        const productToAdd = isFirestick 
          ? { ...product, price: priceToUse, basePrice: product.price }
          : { ...product, price: priceToUse };
        const existing = state.items.find(i => i.id === product.id);
        if (existing) {
          const newQuantity = existing.quantity + quantity;
          const recalculatedPrice = isFirestick && existing.basePrice
            ? calculateFirestickDiscount(existing.basePrice, newQuantity)
            : priceToUse;
          return {
            items: state.items.map(i => 
              i.id === product.id ? { ...i, quantity: newQuantity, price: recalculatedPrice } : i
            ),
            isOpen: true
          };
        }
        return { items: [...state.items, { ...productToAdd, quantity }], isOpen: true };
      }),
      removeItem: (id) => {
        // #region agent log
        if (typeof window !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:92',message:'removeItem called',data:{itemId:id,itemsBeforeRemove:get().items.length,itemsBeforeRemoveIds:get().items.map(i=>i.id)},timestamp:Date.now(),sessionId:'debug-session',runId:'cart-remove-test',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion
        set((state) => {
          const newItems = state.items.filter(i => i.id !== id);
          // #region agent log
          if (typeof window !== 'undefined') {
            fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'store.ts:97',message:'Items after remove',data:{itemId:id,itemsAfterRemove:newItems.length,itemsAfterRemoveIds:newItems.map(i=>i.id),removed:state.items.length > newItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'cart-remove-test',hypothesisId:'A'})}).catch(()=>{});
          }
          // #endregion
          return { items: newItems };
        });
      },
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i => {
          if (i.id === id) {
            if (isFirestickProduct(i.id) && i.basePrice) {
              const newPrice = calculateFirestickDiscount(i.basePrice, quantity);
              return { ...i, quantity, price: newPrice };
            }
            return { ...i, quantity };
          }
          return i;
        })
      })),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      clearCart: () => set({ items: [] }),
      total: () => {
        return get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addToWishlist: (product) => set((state) => {
        const existing = state.items.find(i => i.id === product.id);
        if (existing) return state;
        return { items: [...state.items, product] };
      }),
      removeFromWishlist: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      isInWishlist: (id) => {
        return get().items.some(i => i.id === id);
      },
      toggleWishlist: () => set((state) => ({ isOpen: !state.isOpen })),
      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
