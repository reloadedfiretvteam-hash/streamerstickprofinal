import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Star, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  sale_price?: string;
  image_url?: string;
  main_image?: string;
  category: string;
  stock_quantity: number;
  rating?: number;
}

interface ProductDetailPageProps {
  productId?: string;
}

export default function ProductDetailPage({ productId: propProductId }: ProductDetailPageProps = {}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [propProductId]);

  const loadProduct = async () => {
    const productId = propProductId || window.location.pathname.split('/').pop();
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      // Try stripe_products first
      let { data, error } = await supabase
        .from('stripe_products')
        .select('*')
        .eq('id', productId)
        .single();

      // If not found, try real_products
      if (error || !data) {
        const result = await supabase
          .from('real_products')
          .select('*')
          .eq('id', productId)
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;

    const cartItem = {
      product: {
        id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        image_url: product.main_image || product.image_url
      },
      quantity: quantity
    };

    // Cart item type for type safety
    interface CartItem {
      product: { id: string };
      quantity: number;
    }

    // Load existing cart
    const existingCart = localStorage.getItem('cart');
    const cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];

    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => window.location.href = '/shop'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const displayPrice = product.sale_price || product.price;
  const originalPrice = product.sale_price ? product.price : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <img
              src={product.main_image || product.image_url || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-96 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
              }}
            />
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full">
                {product.category}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.rating})</span>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl font-bold text-blue-600">
                  ${parseFloat(displayPrice).toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-2xl text-gray-400 line-through">
                    ${parseFloat(originalPrice).toFixed(2)}
                  </span>
                )}
              </div>
              {product.stock_quantity > 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>In Stock ({product.stock_quantity} available)</span>
                </div>
              ) : (
                <div className="text-red-600">Out of Stock</div>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              disabled={product.stock_quantity === 0}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                product.stock_quantity === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {addedToCart ? 'Added to Cart!' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {addedToCart && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => window.location.href = '/cart'}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  View Cart →
                </button>
              </div>
            )}

            {/* Security Badge */}
            <div className="mt-8 pt-8 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-500">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Secure checkout available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

