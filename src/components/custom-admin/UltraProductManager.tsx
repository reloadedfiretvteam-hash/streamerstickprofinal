import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  DollarSign,
  Image as ImageIcon,
  Save,
  Settings,
  Layers,
  Box,
  X,
  TrendingUp
} from 'lucide-react';

export default function UltraProductManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'basic' | 'inventory' | 'variants' | 'seo' | 'advanced'>('basic');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // Load from products table - implementation
    setProducts([
      {
        id: '1',
        name: '3 Month IPTV Subscription',
        sku: 'IPTV-3M',
        price: 29.99,
        compare_price: 49.99,
        cost: 10.00,
        inventory_quantity: 999,
        inventory_policy: 'continue',
        variants: [
          { id: 'v1', name: 'Standard', price: 29.99, sku: 'IPTV-3M-STD' },
          { id: 'v2', name: 'Premium', price: 39.99, sku: 'IPTV-3M-PRE' }
        ],
        images: [],
        category: 'subscriptions',
        status: 'active',
        tags: ['popular', 'best-seller'],
        seo_title: '',
        seo_description: '',
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        shipping_required: false
      }
    ]);
  };

  const openEditor = (product: any = null) => {
    if (product) {
      setSelectedProduct(product);
    } else {
      setSelectedProduct({
        name: '',
        sku: '',
        price: 0,
        compare_price: 0,
        cost: 0,
        inventory_quantity: 0,
        inventory_policy: 'deny',
        variants: [],
        images: [],
        category: '',
        status: 'draft',
        tags: [],
        seo_title: '',
        seo_description: '',
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
        shipping_required: true
      });
    }
    setShowEditor(true);
  };

  return (
    <div className="p-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-400" />
            Ultra Product Manager
          </h2>
          <p className="text-gray-400 mt-1">Shopify-level product management with variants, inventory, and bulk actions</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import
          </button>
          <button
            onClick={() => openEditor()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name, SKU, or description..."
            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
        >
          <option value="all">All Categories</option>
          <option value="subscriptions">Subscriptions</option>
          <option value="devices">Devices</option>
          <option value="accessories">Accessories</option>
        </select>
        <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-2">
          <Filter className="w-5 h-5" />
          More Filters
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-750">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Product</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">SKU</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Inventory</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t border-gray-700 hover:bg-gray-750 transition">
                <td className="px-6 py-4">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{product.name}</p>
                      <p className="text-gray-400 text-sm">{product.variants.length} variants</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{product.sku}</td>
                <td className="px-6 py-4">
                  <div className="text-white font-semibold">${product.price}</div>
                  {product.compare_price > product.price && (
                    <div className="text-gray-400 text-sm line-through">${product.compare_price}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className={`text-sm ${product.inventory_quantity > 10 ? 'text-green-400' : 'text-red-400'}`}>
                    {product.inventory_quantity} in stock
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    product.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    product.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditor(product)}
                      className="p-2 hover:bg-gray-600 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-600 rounded-lg transition" title="Duplicate">
                      <Copy className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-red-600 rounded-lg transition" title="Delete">
                      <Trash2 className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Editor Modal */}
      {showEditor && selectedProduct && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl">
              {/* Editor Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  {selectedProduct.id ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                {[
                  { id: 'basic', label: 'Basic Info', icon: Package },
                  { id: 'inventory', label: 'Inventory', icon: Box },
                  { id: 'variants', label: 'Variants', icon: Layers },
                  { id: 'seo', label: 'SEO', icon: TrendingUp },
                  { id: 'advanced', label: 'Advanced', icon: Settings }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                        activeTab === tab.id
                          ? 'text-orange-400 border-b-2 border-orange-400'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.name}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                          placeholder="e.g., Premium IPTV Subscription"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          SKU *
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.sku}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, sku: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                          placeholder="PROD-SKU-001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={selectedProduct.category}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        >
                          <option value="">Select category</option>
                          <option value="subscriptions">Subscriptions</option>
                          <option value="devices">Devices</option>
                          <option value="accessories">Accessories</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Price *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            step="0.01"
                            value={selectedProduct.price}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Compare at Price
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            step="0.01"
                            value={selectedProduct.compare_price}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, compare_price: parseFloat(e.target.value) })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Cost per Item
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            step="0.01"
                            value={selectedProduct.cost}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, cost: parseFloat(e.target.value) })}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Profit: ${(selectedProduct.price - selectedProduct.cost).toFixed(2)} ({((selectedProduct.price - selectedProduct.cost) / selectedProduct.price * 100).toFixed(1)}% margin)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Status
                        </label>
                        <select
                          value={selectedProduct.status}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, status: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        >
                          <option value="active">Active</option>
                          <option value="draft">Draft</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={6}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                          placeholder="Product description..."
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                          placeholder="popular, best-seller, limited-time"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Quantity in Stock
                        </label>
                        <input
                          type="number"
                          value={selectedProduct.inventory_quantity}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, inventory_quantity: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          When out of stock
                        </label>
                        <select
                          value={selectedProduct.inventory_policy}
                          onChange={(e) => setSelectedProduct({ ...selectedProduct, inventory_policy: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        >
                          <option value="deny">Don't allow purchases</option>
                          <option value="continue">Continue selling</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="flex items-center gap-2 text-gray-300">
                          <input type="checkbox" className="w-4 h-4" />
                          <span>Track inventory quantity</span>
                        </label>
                      </div>

                      <div className="col-span-2">
                        <label className="flex items-center gap-2 text-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedProduct.shipping_required}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, shipping_required: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span>This product requires shipping</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'variants' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-300">Product variants (e.g., size, color, plan duration)</p>
                      <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Variant
                      </button>
                    </div>

                    {selectedProduct.variants.map((variant: any) => (
                      <div key={variant.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Variant Name</label>
                            <input
                              type="text"
                              value={variant.name}
                              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Price</label>
                            <input
                              type="number"
                              value={variant.price}
                              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">SKU</label>
                            <input
                              type="text"
                              value={variant.sku}
                              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg text-sm"
                            />
                          </div>
                          <div className="flex items-end">
                            <button className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        placeholder="Optimized title for search engines"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        SEO Description
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        placeholder="Meta description for search results"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        URL Handle
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        placeholder="product-url-slug"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={selectedProduct.weight}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Length (cm)
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Width (cm)
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-700 p-6 flex items-center justify-between">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition">
                    Save as Draft
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
