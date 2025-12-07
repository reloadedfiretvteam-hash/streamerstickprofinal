import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Sparkles } from "lucide-react";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CartDrawer() {
  const [, setLocation] = useLocation();
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart();

  const handleCheckout = () => {
    closeCart();
    setLocation("/checkout");
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg bg-gray-900 border-gray-800 text-white flex flex-col"
        data-testid="cart-drawer"
      >
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2 text-white">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            Your Cart
            {itemCount > 0 && (
              <Badge className="bg-orange-500 text-white ml-2" data-testid="text-cart-item-count">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Review your items before checkout
          </SheetDescription>
        </SheetHeader>

        <Separator className="bg-gray-800 my-4" />

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/50 rounded-full p-6 mb-4"
            >
              <Package className="w-12 h-12 text-gray-500" />
            </motion.div>
            <h3 className="text-lg font-semibold text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-400 text-sm mb-6">
              Add some amazing products to get started!
            </p>
            <Button 
              onClick={closeCart}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              data-testid="button-continue-shopping"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex gap-4 py-4 border-b border-gray-800 last:border-0"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm leading-tight truncate" data-testid={`text-item-name-${item.id}`}>
                        {item.name}
                      </h4>
                      <p className="text-orange-400 font-bold mt-1" data-testid={`text-item-price-${item.id}`}>
                        ${item.price.toFixed(2)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-gray-800 rounded-lg">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-l-lg transition-colors"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeItem(item.id);
                              }
                            }}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium" data-testid={`text-quantity-${item.id}`}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-r-lg transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label="Remove item"
                          className="h-8 w-8 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors"
                          onClick={() => removeItem(item.id)}
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-white" data-testid={`text-item-total-${item.id}`}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>

            <div className="mt-auto pt-4 space-y-4">
              <Separator className="bg-gray-800" />

              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-orange-200">Free setup guide included with every order!</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white" data-testid="text-subtotal">${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <Separator className="bg-gray-800" />
                <div className="flex justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-xl text-orange-400" data-testid="text-cart-total">${total().toFixed(2)}</span>
                </div>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-lg shadow-lg shadow-orange-500/30"
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={closeCart}
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  data-testid="button-continue-shopping-footer"
                >
                  Continue Shopping
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
