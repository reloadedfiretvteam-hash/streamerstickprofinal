import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Save, X, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  display_order: number;
  created_at?: string;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (data) setCategories(data);
    setLoading(false);
  };

  const startEdit = (category: Category) => {
    setEditing(category.id);
    setFormData(category);
    setShowForm(true);
  };

  const startNew = () => {
    setEditing(null);
    setFormData({ display_order: categories.length });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Category name is required!');
      return;
    }

    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dataToSave = {
      ...formData,
      slug,
      display_order: formData.display_order || categories.length
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from('categories')
          .update(dataToSave)
          .eq('id', editing);

        if (error) throw error;
        alert('Category updated!');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([dataToSave]);

        if (error) throw error;
        alert('Category created!');
      }

      cancelEdit();
      loadCategories();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;

    try {
      await supabase.from('categories').delete().eq('id', id);
      alert('Category deleted!');
      loadCategories();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const moveCategory = async (category: Category, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c.id === category.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= categories.length) return;

    const updates = [
      { id: category.id, display_order: newIndex },
      { id: categories[newIndex].id, display_order: currentIndex }
    ];

    try {
      for (const update of updates) {
        await supabase
          .from('categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      loadCategories();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading categories...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Tag className="w-8 h-8 text-blue-400" />
              Category Management
            </h1>
            <p className="text-gray-400">Organize your products with categories</p>
          </div>
          <button
            onClick={startNew}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-white mb-2">✨ Category Features:</h3>
          <ul className="text-blue-100 text-sm space-y-1">
            <li>• Create and organize product categories</li>
            <li>• Drag and reorder categories</li>
            <li>• Parent-child category relationships</li>
            <li>• SEO-friendly slugs</li>
          </ul>
        </div>
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-blue-500">
          <h2 className="text-2xl font-bold text-white mb-4">
            {editing ? 'Edit Category' : 'New Category'}
          </h2>

          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Category Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="Fire Sticks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Slug</label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="fire-sticks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="Category description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Parent Category</label>
              <select
                value={formData.parent_id || ''}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              >
                <option value="">None (Top Level)</option>
                {categories
                  .filter(c => c.id !== editing)
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 font-semibold text-white"
            >
              <Save className="w-5 h-5" />
              {editing ? 'Update' : 'Create'}
            </button>
            <button
              onClick={cancelEdit}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-white"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-4 text-left text-white font-semibold">Order</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Name</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Slug</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Description</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {categories.map((category, index) => (
              <tr key={category.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveCategory(category, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded ${
                        index === 0
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-gray-600'
                      }`}
                      title="Move up"
                    >
                      <MoveUp className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => moveCategory(category, 'down')}
                      disabled={index === categories.length - 1}
                      className={`p-1 rounded ${
                        index === categories.length - 1
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-gray-600'
                      }`}
                      title="Move down"
                    >
                      <MoveDown className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white font-medium">{category.name}</div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-blue-400 text-sm">{category.slug}</code>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-400 text-sm">{category.description || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2">No categories yet</p>
            <p className="text-sm">Click "Add Category" to create your first category</p>
          </div>
        )}
      </div>
    </div>
  );
}
