import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navigation from '../components/EnhancedNavigation';
import Footer from '../components/Footer';
import ValidatedImage from '../components/ValidatedImage';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

// Fallback image for cart items
const FALLBACK_CART_IMAGE = 'https://images.pexels.com/photos/5474028/pexels-photo-5474028.jpeg?auto=compress&cs=tinysrgb&w=200';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = getTotal();
  const itemCount = getItemCount();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleContinueShopping = () => {
    window.location.href = '/#shop';
  };

  const handleProceedToCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Call the Stripe checkout edge function
      const { data, error: fnError } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          successUrl: `${window.location.origin}/order/success`,
          cancelUrl: `${window.location.origin}/order/cancel`
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to proceed to checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation cartItemCount={itemCount} onCartClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl md:text-4xl font-bold">
              <ShoppingCart className="inline-block w-8 h-8 mr-3 text-orange-500" />
              Your Cart
            </h1>
          </div>
          {items.length > 0 && (
            <span className="text-gray-400">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16">
            <div className="bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">
              Browse our products and add items to your cart
            </p>
            <button
              onClick={handleContinueShopping}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold transition-all transform hover:scale-105"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-xl p-6 flex flex-col sm:flex-row gap-6"
                >
                  <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <ValidatedImage
                      src={item.image}
                      fallbackSrc={FALLBACK_CART_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      minBytes={1000}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-2xl font-bold text-orange-400 mb-4">
                      ${item.price.toFixed(2)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-bold text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-xl font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Clear Cart Button */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={handleContinueShopping}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </button>
                <button
                  onClick={clearCart}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-orange-400">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}
                
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Checkout
                    </>
                  )}
                </button>
                
                <div className="mt-6 text-center text-gray-400 text-sm">
                  <p>🔒 Secure checkout powered by Stripe</p>
                  <p className="mt-2">Free shipping on all orders</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
