import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Promotion {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase: number;
  max_uses: number;
  uses_count: number;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
}

export default function PromotionsManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Promotion>>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_purchase: 0,
    max_uses: undefined,
    uses_count: 0,
    start_date: new Date().toISOString(),
    end_date: '',
    active: true
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPromotions(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPromo) {
      const { error } = await supabase
        .from('promotions')
        .update(formData)
        .eq('id', editingPromo.id);

      if (!error) {
        alert('Promotion updated!');
        setShowForm(false);
        setEditingPromo(null);
        resetForm();
        loadPromotions();
      }
    } else {
      const { error } = await supabase
        .from('promotions')
        .insert([formData]);

      if (!error) {
        alert('Promotion created!');
        setShowForm(false);
        resetForm();
        loadPromotions();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promotion?')) return;

    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Promotion deleted!');
      loadPromotions();
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('promotions')
      .update({ active: !currentActive })
      .eq('id', id);

    if (!error) {
      loadPromotions();
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_purchase: 0,
      max_uses: undefined,
      uses_count: 0,
      start_date: new Date().toISOString(),
      end_date: '',
      active: true
    });
  };

  const startEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setFormData(promo);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingPromo(null);
    setShowForm(false);
    resetForm();
  };

  if (loading) {
    return <div className="p-8 text-white">Loading promotions...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Promotions & Discounts</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition"
          >
            <Plus className="w-5 h-5" />
            New Promotion
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingPromo ? 'Edit Promotion' : 'New Promotion'}
                </h2>
                <button onClick={cancelEdit} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Promo Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                      placeholder="SAVE20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Discount Type *</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed_amount">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Discount Value * {formData.discount_type === 'percentage' ? '(%)' : '($)'}
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Purchase ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.min_purchase}
                      onChange={(e) => setFormData({ ...formData, min_purchase: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Uses (blank = unlimited)</label>
                    <input
                      type="number"
                      value={formData.max_uses || ''}
                      onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, start_date: new Date(e.target.value).toISOString() })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date (optional)</label>
                    <input
                      type="date"
                      value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Save 20% on all products"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="active" className="text-sm font-medium">Active</label>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editingPromo ? 'Update Promotion' : 'Create Promotion'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Discount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Usage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Valid Period</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => (
                  <tr key={promo.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          <Tag className="w-4 h-4 text-orange-400" />
                          {promo.code}
                        </div>
                        <div className="text-sm text-gray-400">{promo.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-green-400">
                        {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `$${promo.discount_value}`}
                      </div>
                      {promo.min_purchase > 0 && (
                        <div className="text-xs text-gray-400">Min: ${promo.min_purchase}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={promo.max_uses && promo.uses_count >= promo.max_uses ? 'text-red-400' : 'text-gray-300'}>
                        {promo.uses_count} / {promo.max_uses || '∞'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div>{new Date(promo.start_date).toLocaleDateString()}</div>
                      {promo.end_date && <div>→ {new Date(promo.end_date).toLocaleDateString()}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(promo.id, promo.active)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          promo.active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {promo.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(promo)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {promotions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No promotions yet. Click "New Promotion" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
