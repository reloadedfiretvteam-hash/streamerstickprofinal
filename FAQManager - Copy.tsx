import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export default function FAQManager() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FAQItem>>({});

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    const { data } = await supabase
      .from('faq_items')
      .select('*')
      .order('sort_order');

    if (data) setFaqs(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.question || !formData.answer) {
      alert('Question and answer are required!');
      return;
    }

    if (editing === 'new') {
      const maxOrder = Math.max(...faqs.map(f => f.sort_order), 0);
      const { error } = await supabase
        .from('faq_items')
        .insert([{ ...formData, sort_order: maxOrder + 1 }]);

      if (!error) alert('FAQ created!');
    } else {
      const { error } = await supabase
        .from('faq_items')
        .update(formData)
        .eq('id', editing);

      if (!error) alert('FAQ updated!');
    }

    setEditing(null);
    setFormData({});
    loadFAQs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    await supabase.from('faq_items').delete().eq('id', id);
    loadFAQs();
  };

  const startEdit = (faq: FAQItem) => {
    setEditing(faq.id);
    setFormData(faq);
  };

  const startNew = () => {
    setEditing('new');
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      is_active: true,
      sort_order: 0
    });
  };

  const moveUp = async (faq: FAQItem, index: number) => {
    if (index === 0) return;

    const prevFaq = faqs[index - 1];
    await supabase.from('faq_items').update({ sort_order: prevFaq.sort_order }).eq('id', faq.id);
    await supabase.from('faq_items').update({ sort_order: faq.sort_order }).eq('id', prevFaq.id);
    loadFAQs();
  };

  const moveDown = async (faq: FAQItem, index: number) => {
    if (index === faqs.length - 1) return;

    const nextFaq = faqs[index + 1];
    await supabase.from('faq_items').update({ sort_order: nextFaq.sort_order }).eq('id', faq.id);
    await supabase.from('faq_items').update({ sort_order: faq.sort_order }).eq('id', nextFaq.id);
    loadFAQs();
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    await supabase.from('faq_items').update({ is_active: !currentState }).eq('id', id);
    loadFAQs();
  };

  if (loading) return <div className="p-8 text-white">Loading FAQs...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">FAQ Manager</h2>
          <p className="text-gray-400 mt-1">Manage frequently asked questions</p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition"
        >
          <Plus className="w-5 h-5" />
          Add FAQ
        </button>
      </div>

      {editing && (
        <div className="bg-gray-900 rounded-xl p-6 mb-6 border-2 border-orange-500">
          <h3 className="text-xl font-bold text-white mb-4">
            {editing === 'new' ? 'New FAQ' : 'Edit FAQ'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Question *</label>
              <input
                type="text"
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
                placeholder="What is your question?"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Answer *</label>
              <textarea
                value={formData.answer || ''}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="Your detailed answer..."
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Category</label>
              <select
                value={formData.category || 'general'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="setup">Setup</option>
                <option value="troubleshooting">Troubleshooting</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active-faq"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="active-faq" className="text-white font-semibold cursor-pointer">
                Active (show on website)
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition"
              >
                <Save className="w-5 h-5" />
                Save FAQ
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setFormData({});
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="bg-gray-900 rounded-xl p-6 hover:bg-gray-850 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{faq.question}</h3>
                  {!faq.is_active && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      HIDDEN
                    </span>
                  )}
                  <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                    {faq.category}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{faq.answer}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => moveUp(faq, index)}
                  disabled={index === 0}
                  className={`p-2 rounded-lg transition ${
                    index === 0
                      ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveDown(faq, index)}
                  disabled={index === faqs.length - 1}
                  className={`p-2 rounded-lg transition ${
                    index === faqs.length - 1
                      ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(faq.id, faq.is_active)}
                  className={`p-2 rounded-lg transition ${
                    faq.is_active
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {faq.is_active ? '👁️' : '👁️‍🗨️'}
                </button>
                <button
                  onClick={() => startEdit(faq)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No FAQs yet. Click "Add FAQ" to get started!
          </div>
        )}
      </div>
    </div>
  );
}
