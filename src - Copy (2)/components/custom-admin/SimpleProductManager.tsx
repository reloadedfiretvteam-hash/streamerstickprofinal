import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
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
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
}

export default function SimpleProductManager({ aiMode }: { aiMode: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, ProductImage[]>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products_full')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setProducts(data);
      await loadProductImages(data.map(p => p.id));
    }
    setLoading(false);
  };

  const loadProductImages = async (productIds: string[]) => {
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', productIds);

    if (data) {
      const imagesByProduct: Record<string, ProductImage[]> = {};
      data.forEach((img: any) => {
        if (!imagesByProduct[img.product_id]) {
          imagesByProduct[img.product_id] = [];
        }
        imagesByProduct[img.product_id].push(img);
      });
      setProductImages(imagesByProduct);
    }
  };

  const addImageToProduct = async (productId: string, imageUrl: string) => {
    if (!imageUrl.trim()) return;

    const { error } = await supabase
      .from('product_images')
      .insert([{
        product_id: productId,
        image_url: imageUrl,
        alt_text: formData.name || 'Product image',
        is_primary: !productImages[productId] || productImages[productId].length === 0
      }]);

    if (!error) {
      setImageUrl('');
      loadProducts();
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;
    await supabase.from('product_images').delete().eq('id', imageId);
    loadProducts();
  };

  const handleSave = async () => {
    if (!formData.name || !formData.base_price) {
      alert('Name and price are required!');
      return;
    }

    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dataToSave = { ...formData, slug };

    if (editing) {
      await supabase.from('products_full').update(dataToSave).eq('id', editing);
      alert('Product updated!');
    } else {
      await supabase.from('products_full').insert([dataToSave]);
      alert('Product created!');
    }

    setEditing(null);
    setFormData({});
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products_full').delete().eq('id', id);
    loadProducts();
  };

  const startEdit = (product: Product) => {
    setEditing(product.id);
    setFormData(product);
    setImageUrl('');
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Manage Products</h2>
        <button
          onClick={() => {
            setEditing('new');
            setFormData({ status: 'published', featured: false, stock_quantity: 0, base_price: 0 });
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {editing && (
        <div className="bg-gray-900 rounded-xl p-6 mb-6 border-2 border-orange-500">
          <h3 className="text-xl font-bold text-white mb-4">
            {editing === 'new' ? 'New Product' : 'Edit Product'}
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white font-semibold mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
                placeholder="e.g., Premium IPTV Subscription"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.base_price || ''}
                onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
                placeholder="29.99"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Sale Price (Optional)</label>
              <input
                type="number"
                step="0.01"
                value={formData.sale_price || ''}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
                placeholder="19.99"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock_quantity || 0}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-white font-semibold mb-2">Short Description</label>
            <textarea
              value={formData.short_description || ''}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              placeholder="Brief product summary..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-semibold mb-2">Full Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              placeholder="Detailed product information..."
            />
            {aiMode && (
              <p className="text-sm text-yellow-400 mt-2">💡 AI Tip: Be descriptive to help customers understand value</p>
            )}
          </div>

          {editing !== 'new' && (
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Product Images
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {productImages[editing]?.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.image_url}
                      alt={img.alt_text}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {img.is_primary && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL (e.g., https://...)"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
                <button
                  onClick={() => addImageToProduct(editing, imageUrl)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition"
                >
                  Add Image
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                💡 Tip: Use Pexels, Unsplash, or product images from manufacturer websites
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-semibold">Featured Product</span>
            </label>

            <select
              value={formData.status || 'published'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-semibold"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition"
            >
              <Save className="w-5 h-5" />
              Save Product
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
      )}

      <div className="grid gap-4">
        {products.map((product) => {
          const images = productImages[product.id] || [];
          const primaryImage = images.find(img => img.is_primary) || images[0];

          return (
            <div
              key={product.id}
              className="bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-850 transition"
            >
              <div className="flex items-start">
                {primaryImage && (
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={primaryImage.image_url}
                      alt={primaryImage.alt_text}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{product.name}</h3>
                        {product.featured && (
                          <span className="px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full">
                            FEATURED
                          </span>
                        )}
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          product.status === 'published' ? 'bg-green-500 text-green-900' :
                          product.status === 'draft' ? 'bg-yellow-500 text-yellow-900' :
                          'bg-gray-500 text-gray-900'
                        }`}>
                          {product.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-3 text-sm">{product.short_description}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-white font-bold text-2xl">
                          ${product.sale_price || product.base_price}
                        </span>
                        {product.sale_price && (
                          <span className="text-gray-500 line-through">${product.base_price}</span>
                        )}
                        <span className="text-gray-400">Stock: {product.stock_quantity}</span>
                        {images.length > 0 && (
                          <span className="text-gray-400 flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            {images.length} image{images.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="p-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                        title="Edit Product"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-3 bg-red-500 hover:bg-red-600 rounded-lg transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No products yet. Click "Add New Product" to get started!
          </div>
        )}
      </div>
    </div>
  );
}
