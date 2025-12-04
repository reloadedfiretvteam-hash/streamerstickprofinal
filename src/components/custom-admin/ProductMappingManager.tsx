import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, AlertTriangle, CheckCircle, Save, RefreshCw, Database } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  cloaked_name: string | null;
  category: string | null;
  price: number;
  sale_price: number | null;
}

interface MappingIssue {
  productId: string;
  productName: string;
  issue: string;
  suggestedFix: string;
}

export default function ProductMappingManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [issues, setIssues] = useState<MappingIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedProducts, setEditedProducts] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('real_products')
        .select('id, name, cloaked_name, category, price, sale_price')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      analyzeIssues(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeIssues = (products: Product[]) => {
    const foundIssues: MappingIssue[] = [];

    products.forEach(product => {
      // Check for missing or empty cloaked names
      if (!product.cloaked_name || product.cloaked_name.trim() === '') {
        const suggested = getSuggestedCloakedName(product);
        foundIssues.push({
          productId: product.id,
          productName: product.name,
          issue: 'Missing cloaked name',
          suggestedFix: suggested
        });
      }
      // Check for potentially non-compliant cloaked names
      else if (
        product.cloaked_name.toLowerCase().includes('iptv') ||
        product.cloaked_name.toLowerCase().includes('fire stick') ||
        product.cloaked_name.toLowerCase().includes('firestick')
      ) {
        foundIssues.push({
          productId: product.id,
          productName: product.name,
          issue: 'Cloaked name may not be Stripe-compliant (contains restricted terms)',
          suggestedFix: getSuggestedCloakedName(product)
        });
      }
    });

    setIssues(foundIssues);
  };

  const getSuggestedCloakedName = (product: Product): string => {
    const name = product.name.toLowerCase();
    const category = (product.category || '').toLowerCase();

    if (name.includes('fire') || name.includes('stick') || category.includes('fire') || category.includes('stick')) {
      return 'Digital Entertainment Service - Hardware Bundle';
    } else if (name.includes('iptv') || name.includes('subscription') || category.includes('iptv') || category.includes('subscription')) {
      return 'Digital Entertainment Service - Subscription';
    } else {
      return 'Digital Entertainment Service';
    }
  };

  const handleCloakedNameChange = (productId: string, newValue: string) => {
    setEditedProducts({
      ...editedProducts,
      [productId]: newValue
    });
  };

  const saveProduct = async (productId: string) => {
    if (!editedProducts[productId]) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('real_products')
        .update({ cloaked_name: editedProducts[productId] })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setProducts(products.map(p =>
        p.id === productId ? { ...p, cloaked_name: editedProducts[productId] } : p
      ));

      // Remove from edited
      const newEdited = { ...editedProducts };
      delete newEdited[productId];
      setEditedProducts(newEdited);

      // Refresh issues
      await loadProducts();

      alert('Cloaked name updated successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const applyAllSuggestions = async () => {
    if (!window.confirm(`Apply suggested cloaked names to ${issues.length} products?`)) {
      return;
    }

    setSaving(true);
    try {
      for (const issue of issues) {
        await supabase
          .from('real_products')
          .update({ cloaked_name: issue.suggestedFix })
          .eq('id', issue.productId);
      }

      await loadProducts();
      alert('All suggestions applied successfully!');
    } catch (error) {
      console.error('Error applying suggestions:', error);
      alert('Error applying suggestions. Some updates may have failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8" />
          Product Mapping Manager
        </h2>
        <p className="text-purple-100">
          Manage Stripe-compliant product names (Carnage mapping). Customers see real names, Stripe sees cloaked names.
        </p>
      </div>

      {/* Issues Summary */}
      {issues.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">
                  {issues.length} Mapping Issue{issues.length !== 1 ? 's' : ''} Found
                </h3>
                <p className="text-yellow-800 text-sm">
                  Products with missing or non-compliant cloaked names need attention.
                </p>
              </div>
            </div>
            <button
              onClick={applyAllSuggestions}
              disabled={saving}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
            >
              Apply All Suggestions
            </button>
          </div>
        </div>
      )}

      {issues.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-900">All Products Properly Mapped</h3>
              <p className="text-green-800 text-sm">
                All products have Stripe-compliant cloaked names configured.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SQL Helper Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          SQL Helper Scripts
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-gray-300 text-sm mb-2">Check products missing cloaked names:</p>
            <pre className="bg-gray-900 p-3 rounded text-green-400 text-xs overflow-x-auto">
{`SELECT id, name, category, cloaked_name 
FROM real_products 
WHERE cloaked_name IS NULL OR cloaked_name = '';`}
            </pre>
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-2">Set default cloaked names for all products:</p>
            <pre className="bg-gray-900 p-3 rounded text-green-400 text-xs overflow-x-auto">
{`-- Fire Stick products
UPDATE real_products 
SET cloaked_name = 'Digital Entertainment Service - Hardware Bundle'
WHERE (category ILIKE '%fire%' OR category ILIKE '%stick%' OR name ILIKE '%fire stick%')
AND (cloaked_name IS NULL OR cloaked_name = '');

-- IPTV subscription products
UPDATE real_products 
SET cloaked_name = 'Digital Entertainment Service - Subscription'
WHERE (category ILIKE '%iptv%' OR category ILIKE '%subscription%' OR name ILIKE '%iptv%')
AND (cloaked_name IS NULL OR cloaked_name = '');

-- All other products
UPDATE real_products 
SET cloaked_name = 'Digital Entertainment Service'
WHERE cloaked_name IS NULL OR cloaked_name = '';`}
            </pre>
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-2">Verify all products have cloaked names:</p>
            <pre className="bg-gray-900 p-3 rounded text-green-400 text-xs overflow-x-auto">
{`SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN cloaked_name IS NOT NULL AND cloaked_name != '' THEN 1 END) as products_with_cloaked_names,
  COUNT(CASE WHEN cloaked_name IS NULL OR cloaked_name = '' THEN 1 END) as products_missing_cloaked_names
FROM real_products;`}
            </pre>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-bold">All Products ({products.length})</h3>
          <p className="text-gray-400 text-sm mt-1">
            Review and update Stripe-compliant names for each product
          </p>
        </div>

        <div className="divide-y divide-gray-700">
          {products.map(product => {
            const hasIssue = issues.some(i => i.productId === product.id);
            const issue = issues.find(i => i.productId === product.id);
            const edited = editedProducts[product.id];

            return (
              <div
                key={product.id}
                className={`p-4 ${hasIssue ? 'bg-yellow-900/20' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {hasIssue ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  )}

                  <div className="flex-1">
                    <div className="mb-2">
                      <h4 className="text-white font-semibold">{product.name}</h4>
                      <p className="text-gray-400 text-sm">
                        Category: {product.category || 'Uncategorized'} | 
                        Price: ${product.sale_price || product.price}
                      </p>
                    </div>

                    {hasIssue && issue && (
                      <div className="mb-3 p-2 bg-yellow-900/30 rounded text-sm text-yellow-200">
                        <strong>Issue:</strong> {issue.issue}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">
                          Cloaked Name (what Stripe sees)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={edited !== undefined ? edited : (product.cloaked_name || '')}
                            onChange={(e) => handleCloakedNameChange(product.id, e.target.value)}
                            placeholder={issue?.suggestedFix || 'Digital Entertainment Service'}
                            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {edited !== undefined && (
                            <button
                              onClick={() => saveProduct(product.id)}
                              disabled={saving}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                          )}
                        </div>
                      </div>

                      {issue && (
                        <div className="text-sm text-gray-400">
                          <strong>Suggested:</strong> {issue.suggestedFix}
                          <button
                            onClick={() => handleCloakedNameChange(product.id, issue.suggestedFix)}
                            className="ml-2 text-blue-400 hover:text-blue-300"
                          >
                            Use this
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
