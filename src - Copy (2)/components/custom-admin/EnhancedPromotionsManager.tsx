import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Save, X, Percent, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Promotion {
  id?: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase?: number;
  max_uses?: number;
  used_count?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
}

export default function EnhancedPromotionsManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const emptyPromo: Promotion = {
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase: 0,
    max_uses: 100,
    used_count: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPromo) return;

    if (!editingPromo.code || !editingPromo.description) {
      alert('Please fill in code and description');
      return;
    }

    try {
      const promoData = {
        ...editingPromo,
        code: editingPromo.code.toUpperCase(),
        updated_at: new Date().toISOString()
      };

      if (editingPromo.id) {
        const { error } = await supabase
          .from('promotions')
          .update(promoData)
          .eq('id', editingPromo.id);

        if (error) throw error;
        alert('Promotion updated!');
      } else {
        const { error } = await supabase
          .from('promotions')
          .insert([{ ...promoData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        alert('Promotion created!');
      }

      setEditingPromo(null);
      setIsCreating(false);
      loadPromotions();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save promotion');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promotion? This cannot be undone.')) return;

    try {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
      alert('Promotion deleted!');
      loadPromotions();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete promotion');
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Tag className="w-8 h-8 text-orange-400" />
            Promotions & Coupons Manager
          </h1>
          <p className="text-gray-400">Create and manage discount codes and promotions</p>
        </div>
        <button
          onClick={() => { setEditingPromo(emptyPromo); setIsCreating(true); }}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Promotion
        </button>
      </div>

      {editingPromo && (
        <div className="bg-gray-800 rounded-xl p-6 border-2 border-orange-500 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isCreating ? 'Create New Promotion' : 'Edit Promotion'}
            </h2>
            <button onClick={() => { setEditingPromo(null); setIsCreating(false); }} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Promo Code (Auto-Uppercase)
                </label>
                <input
                  type="text"
                  value={editingPromo.code}
                  onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER25"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  value={editingPromo.description}
                  onChange={(e) => setEditingPromo({ ...editingPromo, description: e.target.value })}
                  rows={3}
                  placeholder="Internal description of this promotion"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Discount Type
                </label>
                <select
                  value={editingPromo.discount_type}
                  onChange={(e) => setEditingPromo({ ...editingPromo, discount_type: e.target.value as any })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Discount Value {editingPromo.discount_type === 'percentage' ? '(%)' : '($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPromo.discount_value}
                  onChange={(e) => setEditingPromo({ ...editingPromo, discount_value: parseFloat(e.target.value) })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Minimum Purchase ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPromo.min_purchase || 0}
                  onChange={(e) => setEditingPromo({ ...editingPromo, min_purchase: parseFloat(e.target.value) })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Max Uses (0 = Unlimited)
                </label>
                <input
                  type="number"
                  value={editingPromo.max_uses || 0}
                  onChange={(e) => setEditingPromo({ ...editingPromo, max_uses: parseInt(e.target.value) })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={editingPromo.start_date}
                  onChange={(e) => setEditingPromo({ ...editingPromo, start_date: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={editingPromo.end_date}
                  onChange={(e) => setEditingPromo({ ...editingPromo, end_date: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPromo.is_active}
                    onChange={(e) => setEditingPromo({ ...editingPromo, is_active: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-white font-semibold">Active (Customers can use this code)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Promotion
            </button>
            <button
              onClick={() => { setEditingPromo(null); setIsCreating(false); }}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        {loading ? (
          <p className="text-gray-400">Loading promotions...</p>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">No promotions yet</p>
            <button
              onClick={() => { setEditingPromo(emptyPromo); setIsCreating(true); }}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Create Your First Promotion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className={`bg-gray-700 rounded-xl p-6 border-2 transition ${
                  promo.is_active && !isExpired(promo.end_date)
                    ? 'border-green-500'
                    : 'border-gray-600 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-lg">
                        {promo.code}
                      </div>
                      {promo.is_active && !isExpired(promo.end_date) ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-semibold">
                          {isExpired(promo.end_date) ? 'Expired' : 'Inactive'}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-300 mb-4">{promo.description}</p>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        {promo.discount_type === 'percentage' ? (
                          <Percent className="w-4 h-4 text-orange-400" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-green-400" />
                        )}
                        <div>
                          <div className="text-gray-400">Discount</div>
                          <div className="text-white font-semibold">
                            {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `$${promo.discount_value}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-gray-400">Min Purchase</div>
                          <div className="text-white font-semibold">
                            ${promo.min_purchase || 0}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="text-gray-400">Uses</div>
                          <div className="text-white font-semibold">
                            {promo.used_count || 0} / {promo.max_uses || '∞'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="text-gray-400">Valid Until</div>
                          <div className="text-white font-semibold">
                            {new Date(promo.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => { setEditingPromo(promo); setIsCreating(false); }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id!)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-orange-500/20 border-2 border-orange-500 rounded-xl p-6">
        <h3 className="text-white font-bold mb-3">Promotion Tips</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-300">
          <div>• Use clear, memorable codes (e.g., SUMMER25, FREESHIP)</div>
          <div>• Set expiration dates to create urgency</div>
          <div>• Limit uses to prevent abuse</div>
          <div>• Test codes before promoting them</div>
          <div>• Track which codes perform best</div>
          <div>• Combine with minimum purchase for higher AOV</div>
        </div>
      </div>
    </div>
  );
}
