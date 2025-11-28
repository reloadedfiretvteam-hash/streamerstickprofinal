import { useState, useEffect } from 'react';
import { Save, Package, DollarSign, Edit, X, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface StripeProduct {
  id: string;
  real_product_id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  sale_price: number | null;
  main_image: string;
  is_active: boolean;
  sort_order: number;
}

interface RealProduct {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
}

export default function StripeProductManager() {
  const [stripeProducts, setStripeProducts] = useState<StripeProduct[]>([]);
  const [realProducts, setRealProducts] = useState<RealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StripeProduct | null>(null);
  const [formData, setFormData] = useState<Partial<StripeProduct>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [stripeData, realData] = await Promise.all([
      supabase.from('stripe_products').select('*').order('sort_order'),
      supabase.from('real_products').select('id, name, price, sale_price').eq('status', 'published')
    ]);

    if (stripeData.data) setStripeProducts(stripeData.data);
    if (realData.data) setRealProducts(realData.data);
    setLoading(false);
  };

  const startEdit = (product: StripeProduct) => {
    setEditing(product);
    setFormData({
      name: product.name,
      description: product.description,
      short_description: product.short_description,
      main_image: product.main_image
    });
  };

  const handleSave = async () => {
    if (!editing) return;

    const { error } = await supabase
      .from('stripe_products')
      .update({
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description,
        main_image: formData.main_image,
        updated_at: new Date().toISOString()
      })
      .eq('id', editing.id);

    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      alert('Stripe product updated!');
      setEditing(null);
      loadData();
    }
  };

  const syncPrices = async () => {
    for (const stripeProduct of stripeProducts) {
      const realProduct = realProducts.find(r => r.id === stripeProduct.real_product_id);
      if (realProduct) {
        await supabase
          .from('stripe_products')
          .update({
            price: realProduct.price,
            sale_price: realProduct.sale_price,
            updated_at: new Date().toISOString()
          })
          .eq('id', stripeProduct.id);
      }
    }
    alert('Prices synced with real products!');
    loadData();
  };

  if (loading) return <div className="p-8 text-white">Loading Stripe products...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-purple-500" />
            Stripe-Safe Product Manager
          </h2>
          <p className="text-gray-400">Manage products shown on pay.streamstickpro.com (Stripe-facing domain)</p>
        </div>
        <button
          onClick={syncPrices}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Sync Prices with Real Products
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">⚠️ Important</h3>
        <ul className="text-gray-300 space-y-2 list-disc list-inside">
          <li>These products are ONLY shown on <strong className="text-white">pay.streamstickpro.com</strong></li>
          <li>Use generic, compliant language (no "IPTV", "jailbroken", etc.)</li>
          <li>Prices automatically sync with your real products</li>
          <li>Stripe will ONLY see these product names/descriptions</li>
          <li>Payments are processed securely via Stripe PaymentIntent API</li>
        </ul>
      </div>

      <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-3">💳 Stripe Integration</h3>
        <div className="text-sm text-gray-300">
          <p className="mb-2">The Stripe checkout flow uses PaymentIntents for secure, PCI-compliant payments:</p>
          <ul className="ml-4 space-y-1 list-disc list-inside">
            <li>Frontend creates a payment intent via the Edge Function</li>
            <li>Secret key is securely stored in Supabase Edge Functions</li>
            <li>Only the client_secret is returned to the browser</li>
            <li>Payment is confirmed using Stripe Elements</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        {stripeProducts.map((product) => (
          <div key={product.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{product.short_description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-400 font-bold">${(product.sale_price || product.price).toFixed(2)}</span>
                  <span className={`px-2 py-1 rounded ${product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => startEdit(product)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>

            {editing?.id === product.id && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Product Name (Stripe-Safe)</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      placeholder="e.g., Premium Streaming Device Kit"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Short Description</label>
                    <input
                      type="text"
                      value={formData.short_description || ''}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      placeholder="e.g., Professional device configuration service"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Full Description (comma-separated features)</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      rows={3}
                      placeholder="Professional device configuration, Premium software provisioning, Device optimization, Dedicated support"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Image URL</label>
                    <input
                      type="text"
                      value={formData.main_image || ''}
                      onChange={(e) => setFormData({ ...formData, main_image: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {stripeProducts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No Stripe-safe products found.</p>
          <p className="text-sm mt-2">They will be auto-created when you add products to your main catalog.</p>
        </div>
      )}
    </div>
  );
}

