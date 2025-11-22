import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Percent, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Promotion {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase: number;
  active: boolean;
}

export default function SimplePricingManager({ aiMode }: { aiMode: boolean }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Promotion>>({
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase: 0,
    active: true
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    const { data } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPromotions(data);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discount_value) {
      alert('Code and discount value required!');
      return;
    }

    await supabase.from('promotions').insert([{
      ...formData,
      code: formData.code?.toUpperCase()
    }]);

    alert('Promo code created!');
    setEditing(false);
    setFormData({ discount_type: 'percentage', discount_value: 0, min_purchase: 0, active: true });
    loadPromotions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    await supabase.from('promotions').delete().eq('id', id);
    loadPromotions();
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    await supabase
      .from('promotions')
      .update({ active: !currentActive })
      .eq('id', id);
    loadPromotions();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Pricing & Discounts</h2>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition"
        >
          <Plus className="w-5 h-5" />
          Create Promo Code
        </button>
      </div>

      {aiMode && (
        <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 font-semibold">
            💡 AI Recommendation: Create time-limited offers to boost sales. Example: "SAVE20" for 20% off
          </p>
        </div>
      )}

      {editing && (
        <div className="bg-gray-900 rounded-xl p-6 mb-6 border-2 border-green-500">
          <h3 className="text-xl font-bold text-white mb-4">New Promo Code</h3>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white font-semibold mb-2">Promo Code *</label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg font-bold focus:border-green-500 focus:outline-none uppercase"
                placeholder="SAVE20"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Discount Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg font-semibold focus:border-green-500 focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '($)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discount_value || ''}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-green-500 focus:outline-none"
                placeholder={formData.discount_type === 'percentage' ? '20' : '10.00'}
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Minimum Purchase ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.min_purchase || ''}
                onChange={(e) => setFormData({ ...formData, min_purchase: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-green-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-white font-semibold mb-2">Description</label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              placeholder="e.g., Save 20% on all products"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition"
            >
              <Save className="w-5 h-5" />
              Create Promo Code
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData({ discount_type: 'percentage', discount_value: 0, min_purchase: 0, active: true });
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="bg-gray-900 rounded-xl p-6 hover:bg-gray-850 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-bold text-xl">
                    {promo.code}
                  </span>
                  <button
                    onClick={() => toggleActive(promo.id, promo.active)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      promo.active
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {promo.active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>
                <p className="text-gray-400 mb-2">{promo.description}</p>
                <div className="flex items-center gap-6">
                  <span className="text-white font-bold text-xl flex items-center gap-2">
                    {promo.discount_type === 'percentage' ? (
                      <>
                        <Percent className="w-5 h-5" />
                        {promo.discount_value}% OFF
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5" />
                        ${promo.discount_value} OFF
                      </>
                    )}
                  </span>
                  {promo.min_purchase > 0 && (
                    <span className="text-gray-400">
                      Min purchase: ${promo.min_purchase}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(promo.id)}
                className="p-3 bg-red-500 hover:bg-red-600 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {promotions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No promo codes yet. Create your first discount!
          </div>
        )}
      </div>
    </div>
  );
}
