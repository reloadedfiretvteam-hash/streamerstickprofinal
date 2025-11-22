import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ImageUpload from '../components/ImageUpload';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  base_price: number;
  sale_price: number | null;
  category_id: string;
  stock_quantity: number;
  sku: string;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    base_price: 0,
    sale_price: null,
    category_id: '',
    stock_quantity: 0,
    sku: '',
    featured: false,
    status: 'draft'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [productsResult, categoriesResult] = await Promise.all([
      supabase.from('products_full').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name')
    ]);

    if (productsResult.data) setProducts(productsResult.data);
    if (categoriesResult.data) setCategories(categoriesResult.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      const { error } = await supabase
        .from('products_full')
        .update(formData)
        .eq('id', editingProduct.id);

      if (!error) {
        alert('Product updated successfully!');
      }
    } else {
      const { error } = await supabase
        .from('products_full')
        .insert([formData]);

      if (!error) {
        alert('Product created successfully!');
      }
    }

    if (!(await supabase.from('products_full').select('*').single()).error) {
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products_full')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Product deleted successfully!');
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      base_price: 0,
      sale_price: null,
      category_id: '',
      stock_quantity: 0,
      sku: '',
      featured: false,
      status: 'draft'
    });
  };

  const startEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    await loadProductImages(product.id);
    setShowForm(true);
  };

  const loadProductImages = async (productId: string) => {
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order');

    if (data) setProductImages(data);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setShowForm(false);
    setProductImages([]);
    resetForm();
  };

  if (loading) {
    return (
      <div className="p-8 text-white">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-8 max-w-3xl w-full my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={cancelEdit} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Base Price *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sale Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_price || ''}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Short Description</label>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Full Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">Featured Product</label>
                </div>

                {editingProduct && (
                  <div className="pt-6 border-t border-gray-700">
                    <ImageUpload
                      productId={editingProduct.id}
                      existingImages={productImages}
                      onImagesChange={() => loadProductImages(editingProduct.id)}
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editingProduct ? 'Update Product' : 'Create Product'}
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
                  <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-sm text-gray-400">{product.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{product.sku || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-green-400">${product.base_price.toFixed(2)}</div>
                      {product.sale_price && (
                        <div className="text-sm text-orange-400">Sale: ${product.sale_price.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">{product.stock_quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'published' ? 'bg-green-500/20 text-green-400' :
                        product.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No products yet. Click "Add New Product" to create one.
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
