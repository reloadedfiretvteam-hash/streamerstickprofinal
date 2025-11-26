import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Save, X, Upload, Download, Image, CheckCircle, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  base_price: number;
  sale_price: number | null;
  stock_quantity: number;
  sku: string;
  featured: boolean;
  status: string;
  category_id?: string;
  created_at?: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function FullFeaturedProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productImages, setProductImages] = useState<Record<string, ProductImage[]>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    status: 'active',
    featured: false,
    stock_quantity: 0
  });
  const [imageUploadUrl, setImageUploadUrl] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadCategories()]);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data } = await supabase
      .from('real_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProducts(data);
      await loadProductImages(data.map(p => p.id));
    }
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) setCategories(data);
  };

  const loadProductImages = async (productIds: string[]) => {
    if (productIds.length === 0) return;

    const { data } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', productIds)
      .order('display_order');

    if (data) {
      const imagesByProduct: Record<string, ProductImage[]> = {};
      data.forEach((img: ProductImage) => {
        if (!imagesByProduct[img.product_id]) {
          imagesByProduct[img.product_id] = [];
        }
        imagesByProduct[img.product_id].push(img);
      });
      setProductImages(imagesByProduct);
    }
  };

  const startEdit = (product: Product) => {
    setEditing(product.id);
    setFormData(product);
    setShowNewForm(false);
  };

  const startNew = () => {
    setEditing(null);
    setFormData({
      status: 'active',
      featured: false,
      stock_quantity: 0,
      base_price: 0
    });
    setShowNewForm(true);
  };

  const cancelEdit = () => {
    setEditing(null);
    setShowNewForm(false);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.name || !formData.base_price) {
      alert('Product name and price are required!');
      return;
    }

    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dataToSave = {
      ...formData,
      slug,
      base_price: Number(formData.base_price),
      sale_price: formData.sale_price ? Number(formData.sale_price) : null,
      stock_quantity: Number(formData.stock_quantity || 0)
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from('real_products')
          .update(dataToSave)
          .eq('id', editing);

        if (error) throw error;
        alert('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('real_products')
          .insert([dataToSave]);

        if (error) throw error;
        alert('Product created successfully!');
      }

      cancelEdit();
      loadData();
    } catch (error: any) {
      alert('Error saving product: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This will also delete all associated images.')) return;

    try {
      await supabase.from('product_images').delete().eq('product_id', id);
      await supabase.from('real_products').delete().eq('id', id);
      alert('Product deleted successfully!');
      loadData();
    } catch (error: any) {
      alert('Error deleting product: ' + error.message);
    }
  };

  const handleImageUpload = async (productId: string) => {
    if (!imageUploadUrl.trim()) {
      alert('Please enter an image URL!');
      return;
    }

    try {
      const currentImages = productImages[productId] || [];
      const { error } = await supabase
        .from('product_images')
        .insert([{
          product_id: productId,
          image_url: imageUploadUrl,
          alt_text: formData.name || 'Product image',
          is_primary: currentImages.length === 0,
          display_order: currentImages.length
        }]);

      if (error) throw error;

      setImageUploadUrl('');
      alert('Image added successfully!');
      loadProductImages([productId]);
    } catch (error: any) {
      alert('Error adding image: ' + error.message);
    }
  };

  const deleteImage = async (imageId: string, productId: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      await supabase.from('product_images').delete().eq('id', imageId);
      alert('Image deleted!');
      loadProductImages([productId]);
    } catch (error: any) {
      alert('Error deleting image: ' + error.message);
    }
  };

  const setPrimaryImage = async (imageId: string, productId: string) => {
    try {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);

      await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      loadProductImages([productId]);
    } catch (error: any) {
      alert('Error setting primary image: ' + error.message);
    }
  };

  const duplicateProduct = async (product: Product) => {
    const newProduct: Partial<Product> = {
      ...product,
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now()}`,
      sku: `${product.sku}-COPY`
    };
    delete newProduct.id;
    delete newProduct.created_at;

    try {
      const { data, error } = await supabase
        .from('real_products')
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;

      const images = productImages[product.id] || [];
      if (images.length > 0 && data) {
        const newImages = images.map(img => ({
          product_id: data.id,
          image_url: img.image_url,
          alt_text: img.alt_text,
          is_primary: img.is_primary,
          display_order: img.display_order
        }));
        await supabase.from('product_images').insert(newImages);
      }

      alert('Product duplicated successfully!');
      loadData();
    } catch (error: any) {
      alert('Error duplicating product: ' + error.message);
    }
  };

  const exportProducts = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-export-${Date.now()}.json`;
    link.click();
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'active') return p.status === 'active';
    if (filter === 'draft') return p.status === 'draft';
    if (filter === 'featured') return p.featured;
    return true;
  });

  const getPrimaryImage = (productId: string): string => {
    const images = productImages[productId] || [];
    const primary = images.find(img => img.is_primary);
    return primary?.image_url || images[0]?.image_url || 'https://images.pexels.com/photos/1927107/pexels-photo-1927107.jpeg?auto=compress&cs=tinysrgb&w=400';
  };

  if (loading) {
    return <div className="p-8 text-white">Loading products...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Package className="w-8 h-8 text-orange-400" />
              Product Management
            </h1>
            <p className="text-gray-400">Manage all products with full editing capabilities</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportProducts}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Products
            </button>
            <button
              onClick={startNew}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          {['all', 'active', 'draft', 'featured'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === f
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {f} ({products.filter(p => {
                if (f === 'all') return true;
                if (f === 'active') return p.status === 'active';
                if (f === 'draft') return p.status === 'draft';
                if (f === 'featured') return p.featured;
                return true;
              }).length})
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-3xl font-bold text-white mb-1">{products.length}</div>
            <div className="text-gray-400 text-sm">Total Products</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {products.filter(p => p.status === 'active').length}
            </div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {products.filter(p => p.featured).length}
            </div>
            <div className="text-gray-400 text-sm">Featured</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              ${products.reduce((sum, p) => sum + (p.sale_price || p.base_price), 0).toFixed(2)}
            </div>
            <div className="text-gray-400 text-sm">Total Value</div>
          </div>
        </div>
      </div>

      {/* Edit/New Form */}
      {(editing || showNewForm) && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-orange-500">
          <h2 className="text-2xl font-bold text-white mb-4">
            {editing ? 'Edit Product' : 'New Product'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Product Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="Amazon Fire Stick 4K Max"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">SKU</label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="FIRE-4K-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Base Price * ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.base_price || ''}
                onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="49.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Sale Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.sale_price || ''}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
                placeholder="39.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Stock Quantity</label>
              <input
                type="number"
                value={formData.stock_quantity || 0}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Category</label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white">Status</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>Featured Product</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white">Short Description</label>
            <input
              type="text"
              value={formData.short_description || ''}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              placeholder="Brief product description"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-white">Full Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white"
              placeholder="Detailed product description"
            />
          </div>

          {/* Image Management for Editing Product */}
          {editing && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-white flex items-center gap-2">
                <Image className="w-4 h-4" />
                Product Images
              </label>

              <div className="grid grid-cols-4 gap-4 mb-4">
                {(productImages[editing] || []).map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.image_url}
                      alt={img.alt_text}
                      className={`w-full h-32 object-cover rounded-lg ${
                        img.is_primary ? 'ring-4 ring-orange-500' : ''
                      }`}
                    />
                    {img.is_primary && (
                      <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!img.is_primary && (
                        <button
                          onClick={() => setPrimaryImage(img.id, editing)}
                          className="p-1 bg-green-600 rounded hover:bg-green-700"
                          title="Set as primary"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteImage(img.id, editing)}
                        className="p-1 bg-red-600 rounded hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUploadUrl}
                  onChange={(e) => setImageUploadUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                />
                <button
                  onClick={() => handleImageUpload(editing)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Add Image
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                💡 Use real Amazon Fire Stick images from: https://images.pexels.com or https://www.amazon.com
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 font-semibold text-white"
            >
              <Save className="w-5 h-5" />
              {editing ? 'Update Product' : 'Create Product'}
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

      {/* Products List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-white font-semibold">Image</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Product</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Price</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Stock</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <img
                      src={getPrimaryImage(product.id)}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{product.name}</div>
                    <div className="text-sm text-gray-400">{product.sku}</div>
                    {product.featured && (
                      <span className="inline-block mt-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-semibold">
                      ${product.sale_price || product.base_price}
                    </div>
                    {product.sale_price && (
                      <div className="text-sm text-gray-400 line-through">
                        ${product.base_price}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm ${
                      product.stock_quantity > 10 ? 'text-green-400' :
                      product.stock_quantity > 0 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {product.stock_quantity} units
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      product.status === 'active' ? 'bg-green-500/20 text-green-400' :
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
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => duplicateProduct(product)}
                        className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => startEdit(product)}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded-lg"
                        title="Edit & Manage Images"
                      >
                        <Image className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl mb-2">No products found</p>
            <p className="text-sm">Click "Add New Product" to create your first product</p>
          </div>
        )}
      </div>
    </div>
  );
}
