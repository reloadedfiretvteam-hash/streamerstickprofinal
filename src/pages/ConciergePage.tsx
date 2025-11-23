import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, CheckCircle, Shield } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
}

export default function ConciergePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from('square_products')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCheckout(product: Product) {
    setSelectedProduct(product);
    // Store product selection and redirect to secure checkout
    localStorage.setItem('selected_product', product.id);
    window.location.href = `/secure/checkout?product=${product.id}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-800">Premium Services</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            AI-Powered Web Solutions
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Transform your digital presence with intelligent tools for web design, SEO, and content automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition border border-slate-200 overflow-hidden"
            >
              <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {product.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {product.name}
                </h3>

                <p className="text-slate-600 mb-4 min-h-[60px]">
                  {product.description}
                </p>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-bold text-slate-800">
                      ${product.price}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCheckout(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-sm hover:shadow-md"
                  >
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No services available at this time.</p>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Secure Payment</h3>
              <p className="text-slate-600">
                All transactions processed through secure payment gateway
              </p>
            </div>

            <div className="text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Data Protection</h3>
              <p className="text-slate-600">
                Your information is encrypted and never shared
              </p>
            </div>

            <div className="text-center">
              <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Expert Support</h3>
              <p className="text-slate-600">
                Professional assistance every step of the way
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-800 text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="mb-2">&copy; 2025 Premium Services. All rights reserved.</p>
            <p className="text-sm text-slate-400">Professional solutions for your digital needs</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
