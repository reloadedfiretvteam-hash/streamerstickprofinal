import { useState, useEffect } from 'react';
import { Save, Package, DollarSign, Edit, X, Square } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SquareProduct {
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

export default function SquareProductManager() {
  const [squareProducts, setSquareProducts] = useState<SquareProduct[]>([]);
  const [realProducts, setRealProducts] = useState<RealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SquareProduct | null>(null);
  const [formData, setFormData] = useState<Partial<SquareProduct>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [squareData, realData] = await Promise.all([
      supabase.from('square_products').select('*').order('sort_order'),
      supabase.from('real_products').select('id, name, price, sale_price').eq('status', 'published')
    ]);

    if (squareData.data) setSquareProducts(squareData.data);
    if (realData.data) setRealProducts(realData.data);
    setLoading(false);
  };

  const startEdit = (product: SquareProduct) => {
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
      .from('square_products')
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
      alert('Square product updated!');
      setEditing(null);
      loadData();
    }
  };

  const syncPrices = async () => {
    for (const squareProduct of squareProducts) {
      const realProduct = realProducts.find(r => r.id === squareProduct.real_product_id);
      if (realProduct) {
        await supabase
          .from('square_products')
          .update({
            price: realProduct.price,
            sale_price: realProduct.sale_price,
            updated_at: new Date().toISOString()
          })
          .eq('id', squareProduct.id);
      }
    }
    alert('Prices synced with real products!');
    loadData();
  };

  if (loading) return <div className="p-8 text-white">Loading Square products...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Square className="w-8 h-8 text-green-500" />
            Square-Safe Product Manager
          </h2>
          <p className="text-gray-400">Manage products shown on secure.streamstickpro.com (Square-facing domain)</p>
        </div>
        <button
          onClick={syncPrices}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Sync Prices with Real Products
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">⚠️ Important</h3>
        <ul className="text-gray-300 space-y-2 list-disc list-inside">
          <li>These products are ONLY shown on <strong className="text-white">secure.streamstickpro.com</strong></li>
          <li>Products are mapped as: Fire Sticks → Website Pages/SEO, IPTV → AI Tools</li>
          <li>Use compliant language (no "IPTV", "jailbroken", etc.)</li>
          <li>Prices automatically sync with your real products</li>
          <li>Square will ONLY see these product names/descriptions</li>
        </ul>
      </div>

      <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-3">📋 AI Tool Suite Products</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <strong className="text-white">Square-Safe Products:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>FREE → AI LaunchPad Demo & Onboarding</li>
              <li>$15 → AI Page Builder Pro (1 Month)</li>
              <li>$30 → AI SEO Strategy Suite (3 Months)</li>
            </ul>
          </div>
          <div>
            <strong className="text-white">Premium Packages:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>$50 → AI Blog Automation Engine (6 Months)</li>
              <li>$75 → AI Local Marketing Power Pack (12 Months)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {squareProducts.map((product) => (
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
                    <label className="block text-white font-semibold mb-2">Product Name (Square-Safe)</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      placeholder="e.g., Professional Website Page Design"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Short Description</label>
                    <input
                      type="text"
                      value={formData.short_description || ''}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      placeholder="e.g., One professional website page with full design"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Full Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      rows={4}
                      placeholder="Complete website page design and development service..."
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

      {squareProducts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No Square-safe products found.</p>
          <p className="text-sm mt-2">They will be auto-created when you add products to your main catalog.</p>
        </div>
      )}
    </div>
  );
}

