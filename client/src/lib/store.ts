import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const isFirestickProduct = (id: string): boolean => {
  const x = id.toLowerCase();
  return (
    x.startsWith('fs-') ||
    x.includes('firestick') ||
    x.startsWith('onn-google') ||
    x.includes('android-onn')
  );
};

const calculateFirestickDiscount = (basePrice: number, quantity: number): number => {
  void quantity;
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
  /** Snapshot of list price (cents/ dollars as stored on Product.price) for reverting if promo is cleared. */
  regularUnitPrice?: number;
  /** When true, checkout sends applySitePromotion and uses site_promotion Stripe price server-side. */
  applySitePromotion?: boolean;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  addItemWithQuantity: (
    product: Product,
    quantity: number,
    discountedPrice?: number,
    opts?: { sitePromotion?: boolean }
  ) => void;
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
      addItemWithQuantity: (product, quantity, discountedPrice, opts) => set((state) => {
        const sitePromo = opts?.sitePromotion === true;
        const priceToUse = discountedPrice ?? product.price;
        const isFirestick = isFirestickProduct(product.id);
        const regularSnap = product.price;
        const productToAdd: CartItem = isFirestick
          ? {
              ...product,
              quantity,
              price: priceToUse,
              basePrice: product.price,
              regularUnitPrice: regularSnap,
              applySitePromotion: sitePromo,
            }
          : {
              ...product,
              quantity,
              price: priceToUse,
              regularUnitPrice: regularSnap,
              applySitePromotion: sitePromo,
            };
        const existing = state.items.find(i => i.id === product.id);
        if (existing) {
          const newQuantity = existing.quantity + quantity;
          const newApplySitePromotion =
            sitePromo === false ? false : Boolean(existing.applySitePromotion);
          const reg =
            existing.regularUnitPrice ??
            existing.basePrice ??
            product.price;
          let recalculatedPrice: number;
          if (isFirestick && existing.basePrice) {
            recalculatedPrice = calculateFirestickDiscount(existing.basePrice, newQuantity);
          } else if (newApplySitePromotion && discountedPrice != null) {
            recalculatedPrice = discountedPrice;
          } else {
            recalculatedPrice = reg;
          }
          if (isFirestick && existing.basePrice && !newApplySitePromotion) {
            recalculatedPrice = calculateFirestickDiscount(existing.basePrice, newQuantity);
          }
          return {
            items: state.items.map((i) =>
              i.id === product.id
                ? {
                    ...i,
                    quantity: newQuantity,
                    price: recalculatedPrice,
                    applySitePromotion: newApplySitePromotion,
                    regularUnitPrice: i.regularUnitPrice ?? reg,
                  }
                : i
            ),
            isOpen: true,
          };
        }
        return { items: [...state.items, productToAdd], isOpen: true };
      }),
      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter(i => i.id !== id);
          return { items: newItems };
        });
      },
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i => {
          if (i.id === id) {
            if (isFirestickProduct(i.id) && i.basePrice && !i.applySitePromotion) {
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
