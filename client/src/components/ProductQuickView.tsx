import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Check, Zap, Star, Package, Eye, Heart } from "lucide-react";
import { useCart, useWishlist } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  image: string;
  category: "firestick" | "iptv";
  badge: string;
  popular?: boolean;
}

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const { addItem, openCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category as 'firestick' | 'iptv' | 'design',
      description: product.description,
    });
    onClose();
  };

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category as 'firestick' | 'iptv' | 'design',
        description: product.description,
      });
    }
  };

  const inWishlist = isInWishlist(product.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] bg-gray-900 border-gray-800 text-white p-0 overflow-hidden"
        data-testid="quick-view-modal"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900 pointer-events-none z-10" />
          <div className="h-64 sm:h-72 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
              }}
            />
          </div>
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <Badge 
              className={`${
                product.popular 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                  : 'bg-blue-500'
              } text-white font-bold`}
            >
              {product.badge}
            </Badge>
            {product.popular && (
              <Badge className="bg-yellow-500 text-black font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Best Seller
              </Badge>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 -mt-8 relative z-20">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-white" data-testid="quick-view-title">
              {product.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-base mt-2">
              {product.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500" data-testid="quick-view-price">
              ${product.price.toFixed(2)}
            </span>
            {product.category === 'firestick' && (
              <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                <Package className="w-4 h-4" />
                1 Year IPTV Included
              </span>
            )}
          </div>

          <Separator className="bg-gray-800 mb-6" />

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
              What's Included:
            </h4>
            <ScrollArea className="h-40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2"
                  >
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              className={`flex-1 py-6 text-lg font-bold transition-all ${
                product.popular
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
              }`}
              data-testid="quick-view-add-to-cart"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              onClick={toggleWishlist}
              className={`py-6 transition-all ${
                inWishlist 
                  ? 'border-red-500 text-red-500 hover:bg-red-500/10' 
                  : 'border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              data-testid="quick-view-wishlist"
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white py-6"
              data-testid="quick-view-close"
            >
              Close
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              Instant Email Delivery
            </span>
            <span>•</span>
            <span>24/7 Support</span>
            <span>•</span>
            <span>Secure Payment</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QuickViewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
      aria-label="Quick view"
      data-testid="button-quick-view"
    >
      <Eye className="w-5 h-5" />
    </button>
  );
}
