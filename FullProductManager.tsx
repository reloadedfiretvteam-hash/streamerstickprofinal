import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Save, X, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  product_id: string;
  name: string;
  price: number;
  type: string;
  description: string;
  image?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  sku?: string;
  stock_quantity?: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export default function FullProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [, setSelectedImage] = useState<string>('');

  const emptyProduct: Partial<Product> = {
    name: '',
    price: 0,
    type: 'firestick',
    description: '',
    image: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    sku: '',
    stock_quantity: 999,
    is_active: true
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    try {
      const productData = {
        ...editingProduct,
        updated_at: new Date().toISOString()
      };

      if (editingProduct.id) {
        // Update existing
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('Product updated successfully!');
      } else {
        // Create new
        const { error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            product_id: `prod-${Date.now()}`,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        alert('Product created successfully!');
      }

      setEditingProduct(null);
      setIsCreating(false);
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      alert('Product deleted successfully!');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setSelectedImage(product.image || '');
    setIsCreating(false);
  };

  const startCreate = () => {
    setEditingProduct({ ...emptyProduct } as Product);
    setSelectedImage('');
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setIsCreating(false);
    setSelectedImage('');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-400" />
            Full Product Management
          </h1>
          <p className="text-gray-400">Create, edit, delete, and manage all products</p>
        </div>
        <button
          onClick={startCreate}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Product
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading products...</p>
      ) : (
        <>
          {editingProduct ? (
            <div className="bg-gray-800 rounded-xl p-6 border-2 border-blue-500 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isCreating ? 'Create New Product' : 'Edit Product'}
                </h2>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g., Jailbroken Fire Stick 4K"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Product Type
                    </label>
                    <select
                      value={editingProduct.type}
                      onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="firestick">Fire Stick</option>
                      <option value="iptv">IPTV Subscription</option>
                      <option value="bundle">Bundle Deal</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={editingProduct.sku || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g., FS4K-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={editingProduct.stock_quantity || 999}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) })}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.is_active}
                        onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <span className="text-white font-semibold">Product Active (Visible to Customers)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Product Image URL
                    </label>
                    <input
                      type="text"
                      value={editingProduct.image || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="https://..."
                    />
                    {editingProduct.image && (
                      <img
                        src={editingProduct.image}
                        alt="Preview"
                        className="mt-3 w-full h-48 object-cover rounded-lg"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={editingProduct.seo_title || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, seo_title: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Optimized title for Google"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={editingProduct.seo_description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, seo_description: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Meta description for Google"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.seo_keywords || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, seo_keywords: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="jailbroken fire stick, streaming device"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Product Description
                  </label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={6}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Detailed product description..."
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Product
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition"
              >
                <div className="flex items-start gap-6">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${product.price}
                          </span>
                          <span className="capitalize">{product.type}</span>
                          {product.sku && <span>SKU: {product.sku}</span>}
                          <span>Stock: {product.stock_quantity}</span>
                          {product.is_active ? (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400">
                              <XCircle className="w-4 h-4" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-2">{product.description}</p>
                    {product.seo_title && (
                      <p className="text-gray-500 text-xs">SEO: {product.seo_title}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No products yet</p>
              <button
                onClick={startCreate}
                className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Create Your First Product
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
