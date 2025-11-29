import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Home, Shield } from 'lucide-react';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: string;
    sale_price?: string;
    image_url?: string;
    main_image?: string;
  };
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    const newCart = cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(newCart);
  };

  const removeItem = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    saveCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const price = parseFloat(item.product.sale_price || item.product.price);
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-xl">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <button
            onClick={() => window.location.href = '/shop'}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2 mx-auto"
          >
            <Home className="w-5 h-5" />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
              <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={() => window.location.href = '/shop'}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-gray-800 rounded-xl p-6 flex gap-6 border border-gray-700"
              >
                <img
                  src={item.product.main_image || item.product.image_url || '/placeholder-product.jpg'}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{item.product.name}</h3>
                  <p className="text-orange-400 font-bold text-lg mb-4">
                    ${parseFloat(item.product.sale_price || item.product.price).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-700 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-600 rounded-l-lg transition-colors text-white"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-600 rounded-r-lg transition-colors text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    ${(parseFloat(item.product.sale_price || item.product.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-md p-6 sticky top-4 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between text-2xl font-bold text-white">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 justify-center">
                <Shield className="w-4 h-4" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


