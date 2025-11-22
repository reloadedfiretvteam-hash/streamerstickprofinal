import { X, ShoppingCart, Trash2, Plus, Minus, Home } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartSidebarProps) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold">Your Cart</h2>
            {itemCount > 0 && (
              <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Your cart is empty</p>
              <p className="text-gray-500 text-sm mt-2">Add some products to get started</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                <Home className="w-5 h-5" />
                Continue Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-lg p-4 flex gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 text-sm">{item.name}</h3>
                    <p className="text-orange-400 font-bold text-lg mb-2">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-3xl font-bold text-orange-500">
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-orange-500/50 mb-3"
            >
              Proceed to Checkout
            </button>
            <a
              href="/"
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </a>
            <p className="text-center text-gray-400 text-xs mt-3">
              Secure payment via Zelle, Cash App, PayPal, or Venmo
            </p>
          </div>
        )}
      </div>
    </>
  );
}
