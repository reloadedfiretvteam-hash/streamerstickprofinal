import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Save,
  X,
  Image as ImageIcon,
  Tag,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function RealProductManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('real_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const saveProduct = async () => {
    if (!editingProduct) return;

    // Validation
    if (!editingProduct.name || editingProduct.name.trim() === '') {
      showToast('Product name is required', 'error');
      return;
    }
    if (!editingProduct.slug || editingProduct.slug.trim() === '') {
      showToast('URL slug is required', 'error');
      return;
    }
    if (!editingProduct.price || editingProduct.price <= 0) {
      showToast('Valid price is required', 'error');
      return;
    }
    if (!editingProduct.cloaked_name || editingProduct.cloaked_name.trim() === '') {
      showToast('Cloaked name is required for Stripe compliance', 'error');
      return;
    }

    setSaving(true);

    const productData = {
      ...editingProduct,
      updated_at: new Date().toISOString()
    };

    if (editingProduct.id) {
      // Update existing
      const { error } = await supabase
        .from('real_products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (!error) {
        showToast('Product updated successfully!', 'success');
        loadProducts();
        setEditingProduct(null);
      } else {
        showToast('Error updating product: ' + error.message, 'error');
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('real_products')
        .insert([productData]);

      if (!error) {
        showToast('Product created successfully!', 'success');
        loadProducts();
        setEditingProduct(null);
      } else {
        showToast('Error creating product: ' + error.message, 'error');
      }
    }

    setSaving(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('real_products')
      .delete()
      .eq('id', id);

    if (!error) {
      showToast('Product deleted successfully!', 'success');
      loadProducts();
    } else {
      showToast('Error deleting product: ' + error.message, 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      const bucketName = import.meta.env.VITE_STORAGE_BUCKET_NAME || 'images';
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL (permanent, not signed)
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Update the editing product with the new image URL
      setEditingProduct({ ...editingProduct, main_image: publicUrl });
      showToast('Image uploaded successfully!', 'success');
    } catch (error: any) {
      showToast('Upload failed: ' + error.message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-slide-in`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-400" />
            Products Manager
          </h2>
          <p className="text-gray-400 mt-1">Manage your actual products from the website</p>
        </div>
        <button
          onClick={() => setEditingProduct({
            name: '',
            slug: '',
            description: '',
            price: 0,
            sale_price: null,
            sku: '',
            stock_quantity: 0,
            stock_status: 'instock',
            category: 'subscriptions',
            status: 'publish',
            featured: false,
            main_image: '',
            cloaked_name: 'Digital Entertainment Service',
            meta_title: '',
            meta_description: ''
          })}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No products found</p>
          <button
            onClick={() => setEditingProduct({ name: '', price: 0 })}
            className="mt-4 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition border border-gray-700">
              {/* Product Image */}
              <div className="h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
                {product.main_image ? (
                  <img
                    src={product.main_image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-600" />
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-400 text-sm">SKU: {product.sku || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.status === 'publish' ? 'bg-green-500/20 text-green-400' :
                    product.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {product.status}
                  </span>
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">${product.sale_price || product.price}</span>
                    {product.sale_price && (
                      <span className="text-gray-400 line-through text-lg">${product.price}</span>
                    )}
                  </div>
                  {product.sale_price && (
                    <p className="text-green-400 text-sm font-semibold">
                      Save ${(product.price - product.sale_price).toFixed(2)} ({Math.round((1 - product.sale_price/product.price) * 100)}% OFF)
                    </p>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-4 flex items-center gap-2">
                  {product.stock_quantity > 10 ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className={`text-sm ${
                    product.stock_quantity > 10 ? 'text-green-400' :
                    product.stock_quantity > 0 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {product.stock_quantity} in stock
                  </span>
                </div>

                {/* Category & Featured */}
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm capitalize">{product.category}</span>
                  {product.featured && (
                    <span className="ml-auto px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="e.g., 3 Month IPTV Subscription"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      value={editingProduct.slug}
                      onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      placeholder="3-month-iptv"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={editingProduct.sku || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      placeholder="IPTV-3M"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="Full product description..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Regular Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Regular Price * ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>

                  {/* Sale Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Sale Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.sale_price || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sale_price: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={editingProduct.stock_quantity}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="subscriptions">Subscriptions</option>
                      <option value="devices">Devices</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={editingProduct.status}
                      onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="publish">Published</option>
                      <option value="draft">Draft</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload & URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Main Image
                  </label>
                  
                  {/* Image Preview */}
                  {editingProduct.main_image && (
                    <div className="mb-3 relative">
                      <img 
                        src={editingProduct.main_image} 
                        alt="Product preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-600"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="mb-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <div className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
                        <ImageIcon className="w-5 h-5" />
                        {uploadingImage ? 'Uploading...' : 'Upload New Image'}
                      </div>
                    </label>
                  </div>

                  {/* Manual URL Input */}
                  <input
                    type="text"
                    value={editingProduct.main_image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, main_image: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="Or paste image URL here"
                  />
                </div>

                {/* Stripe Compliance Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-400" />
                    Stripe Compliance (Carnage Product Name)
                  </h4>
                  <p className="text-sm text-gray-400 mb-4">
                    This is the "cloaked" product name shown to Stripe for compliance. It should be generic and not mention IPTV or Fire Stick.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Cloaked Name for Stripe *
                      </label>
                      <input
                        type="text"
                        value={editingProduct.cloaked_name || 'Digital Entertainment Service'}
                        onChange={(e) => setEditingProduct({ ...editingProduct, cloaked_name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        placeholder="Digital Entertainment Service"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended: "Digital Entertainment Service", "Digital Entertainment Service - Subscription", or "Digital Entertainment Service - Hardware Bundle"
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Stripe Payment Link URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={editingProduct.payment_link_url || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, payment_link_url: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        placeholder="https://buy.stripe.com/..."
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        If provided, customers will be redirected to this Stripe Payment Link instead of using PaymentIntent. Leave empty to use standard checkout.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Featured Checkbox */}
                <div>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={editingProduct.featured || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span>Mark as Featured Product</span>
                  </label>
                </div>

                {/* SEO Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    SEO Settings
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={editingProduct.meta_title || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, meta_title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={editingProduct.meta_description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, meta_description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-700 p-6 flex items-center justify-between">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProduct}
                  disabled={saving || !editingProduct.name || !editingProduct.slug}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : editingProduct.id ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
