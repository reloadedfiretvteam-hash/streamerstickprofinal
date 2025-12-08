import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useWishlist, useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function WishlistDrawer() {
  const { items, isOpen, closeWishlist, removeFromWishlist } = useWishlist();
  const { addItem, openCart } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      description: item.description,
    });
    removeFromWishlist(item.id);
  };

  const handleAddAllToCart = () => {
    items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        description: item.description,
      });
    });
    items.forEach((item) => removeFromWishlist(item.id));
    closeWishlist();
    openCart();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeWishlist()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg bg-gray-900 border-gray-800 text-white flex flex-col"
        data-testid="wishlist-drawer"
      >
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2 text-white">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            Your Wishlist
            {items.length > 0 && (
              <Badge className="bg-red-500 text-white ml-2" data-testid="text-wishlist-count">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            Items you've saved for later
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
              <Heart className="w-12 h-12 text-gray-500" />
            </motion.div>
            <h3 className="text-lg font-semibold text-white mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 text-sm mb-6">
              Save items you love by clicking the heart icon!
            </p>
            <Button 
              onClick={closeWishlist}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              data-testid="button-browse-products"
            >
              Browse Products
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
                    data-testid={`wishlist-item-${item.id}`}
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
                      <h4 className="font-medium text-white text-sm leading-tight truncate" data-testid={`text-wishlist-item-name-${item.id}`}>
                        {item.name}
                      </h4>
                      <p className="text-orange-400 font-bold mt-1" data-testid={`text-wishlist-item-price-${item.id}`}>
                        ${item.price.toFixed(2)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          className="h-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xs"
                          onClick={() => handleAddToCart(item)}
                          data-testid={`button-add-to-cart-${item.id}`}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Add to Cart
                        </Button>
                        <button
                          type="button"
                          aria-label="Remove from wishlist"
                          className="h-8 w-8 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors"
                          onClick={() => removeFromWishlist(item.id)}
                          data-testid={`button-remove-wishlist-${item.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>

            <div className="mt-auto pt-4 space-y-4">
              <Separator className="bg-gray-800" />

              <Button
                onClick={handleAddAllToCart}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-lg shadow-lg shadow-orange-500/30"
                data-testid="button-add-all-to-cart"
              >
                Add All to Cart
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={closeWishlist}
                className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                data-testid="button-continue-browsing"
              >
                Continue Browsing
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
