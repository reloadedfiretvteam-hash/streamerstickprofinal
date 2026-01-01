import { useState, useEffect } from 'react';
import { supabase, getStorageUrl } from '../../lib/supabase';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload, Image as ImageIcon, Link as LinkIcon, Search, Filter } from 'lucide-react';

interface SEOAd {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt: string | null;
  primary_keyword: string;
  secondary_keywords: string | null;
  meta_title: string | null;
  meta_description: string | null;
  featured_image: string | null;
  gallery_images: string | null;
  comparison_data: string | null;
  product_links: string | null;
  cta_text: string | null;
  cta_link: string | null;
  badge_labels: string | null;
  social_proof: string | null;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function SEOAdsManager() {
  const [ads, setAds] = useState<SEOAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAd, setEditingAd] = useState<SEOAd | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'device-comparison',
    content: '',
    excerpt: '',
    primary_keyword: '',
    secondary_keywords: '',
    meta_title: '',
    meta_description: '',
    featured_image: '',
    gallery_images: '',
    comparison_data: '',
    product_links: '',
    cta_text: 'Shop Now',
    cta_link: '/',
    badge_labels: '',
    social_proof: '',
    published: false,
    featured: false,
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error loading SEO ads:', error);
      alert('Failed to load SEO ads');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
      meta_title: formData.meta_title || title,
    });
  };

  const handleSave = async () => {
    try {
      const adData: any = {
        ...formData,
        secondary_keywords: formData.secondary_keywords ? JSON.parse(formData.secondary_keywords) : null,
        gallery_images: formData.gallery_images ? JSON.parse(formData.gallery_images) : null,
        comparison_data: formData.comparison_data ? JSON.parse(formData.comparison_data) : null,
        product_links: formData.product_links ? JSON.parse(formData.product_links) : null,
        badge_labels: formData.badge_labels ? JSON.parse(formData.badge_labels) : null,
        social_proof: formData.social_proof ? JSON.parse(formData.social_proof) : null,
        updated_at: new Date().toISOString(),
      };

      if (editingAd) {
        const { error } = await supabase
          .from('seo_ads')
          .update(adData)
          .eq('id', editingAd.id);

        if (error) throw error;
        alert('SEO Ad updated successfully!');
      } else {
        const { error } = await supabase
          .from('seo_ads')
          .insert([adData]);

        if (error) throw error;
        alert('SEO Ad created successfully!');
      }

      resetForm();
      loadAds();
    } catch (error: any) {
      console.error('Error saving SEO ad:', error);
      alert(`Failed to save SEO ad: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SEO ad?')) return;

    try {
      const { error } = await supabase
        .from('seo_ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAds();
    } catch (error) {
      console.error('Error deleting SEO ad:', error);
      alert('Failed to delete SEO ad');
    }
  };

  const handleTogglePublished = async (ad: SEOAd) => {
    try {
      const { error } = await supabase
        .from('seo_ads')
        .update({ published: !ad.published })
        .eq('id', ad.id);

      if (error) throw error;
      loadAds();
    } catch (error) {
      console.error('Error toggling published status:', error);
      alert('Failed to update published status');
    }
  };

  const openEditForm = (ad: SEOAd) => {
    setEditingAd(ad);
    setIsCreating(false);
    setFormData({
      title: ad.title,
      slug: ad.slug,
      category: ad.category,
      content: ad.content,
      excerpt: ad.excerpt || '',
      primary_keyword: ad.primary_keyword,
      secondary_keywords: ad.secondary_keywords ? JSON.stringify(ad.secondary_keywords, null, 2) : '',
      meta_title: ad.meta_title || '',
      meta_description: ad.meta_description || '',
      featured_image: ad.featured_image || '',
      gallery_images: ad.gallery_images ? JSON.stringify(ad.gallery_images, null, 2) : '',
      comparison_data: ad.comparison_data ? JSON.stringify(ad.comparison_data, null, 2) : '',
      product_links: ad.product_links ? JSON.stringify(ad.product_links, null, 2) : '',
      cta_text: ad.cta_text || 'Shop Now',
      cta_link: ad.cta_link || '/',
      badge_labels: ad.badge_labels ? JSON.stringify(ad.badge_labels, null, 2) : '',
      social_proof: ad.social_proof ? JSON.stringify(ad.social_proof, null, 2) : '',
      published: ad.published,
      featured: ad.featured,
    });
  };

  const openCreateForm = () => {
    setIsCreating(true);
    setEditingAd(null);
    setFormData({
      title: '',
      slug: '',
      category: 'device-comparison',
      content: '',
      excerpt: '',
      primary_keyword: '',
      secondary_keywords: '',
      meta_title: '',
      meta_description: '',
      featured_image: '',
      gallery_images: '',
      comparison_data: '',
      product_links: '',
      cta_text: 'Shop Now',
      cta_link: '/',
      badge_labels: '',
      social_proof: '',
      published: false,
      featured: false,
    });
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingAd(null);
    setFormData({
      title: '',
      slug: '',
      category: 'device-comparison',
      content: '',
      excerpt: '',
      primary_keyword: '',
      secondary_keywords: '',
      meta_title: '',
      meta_description: '',
      featured_image: '',
      gallery_images: '',
      comparison_data: '',
      product_links: '',
      cta_text: 'Shop Now',
      cta_link: '/',
      badge_labels: '',
      social_proof: '',
      published: false,
      featured: false,
    });
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch = !searchTerm || 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.primary_keyword.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || ad.category === filterCategory;
    
    const matchesPublished = filterPublished === 'all' ||
      (filterPublished === 'published' && ad.published) ||
      (filterPublished === 'draft' && !ad.published);

    return matchesSearch && matchesCategory && matchesPublished;
  });

  const categories = ['all', ...new Set(ads.map(ad => ad.category))];

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">Loading SEO ads...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">SEO Ads Manager</h2>
          <p className="text-gray-400">Manage 50+ SEO-optimized ad pages with images linking to home page</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg text-white font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Ad
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>

        <select
          value={filterPublished}
          onChange={(e) => setFilterPublished(e.target.value as any)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingAd) && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              {editingAd ? 'Edit SEO Ad' : 'Create New SEO Ad'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="e.g., Fire Stick HD vs 4K: Complete Comparison"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="fire-stick-hd-vs-4k-comparison"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="device-comparison">Device Comparison</option>
                <option value="app-comparison">App Comparison</option>
                <option value="service-comparison">Service Comparison</option>
                <option value="content-access">Content Access</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Primary Keyword *</label>
              <input
                type="text"
                value={formData.primary_keyword}
                onChange={(e) => setFormData({ ...formData, primary_keyword: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="e.g., fire stick 4k"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Featured Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="https://... or image filename from Supabase"
                />
                <LinkIcon className="w-5 h-5 text-gray-400 mt-2" />
              </div>
              {formData.featured_image && (
                <img
                  src={formData.featured_image.startsWith('http') ? formData.featured_image : getStorageUrl('images', formData.featured_image)}
                  alt="Preview"
                  className="mt-2 w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CTA Link (links to home page) *</label>
              <input
                type="text"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="/ or /shop"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CTA Text</label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="Shop Now"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Content (HTML) *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none font-mono text-sm"
                placeholder="HTML content for the ad page..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Meta Description</label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="SEO meta description..."
              />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-gray-300">Published</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-gray-300">Featured</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg text-white font-semibold flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Ad
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ads List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Keyword</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">CTA Link</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredAds.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No SEO ads found. Create your first ad above.
                  </td>
                </tr>
              ) : (
                filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{ad.title}</div>
                      {ad.featured && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded">Featured</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300 capitalize">
                      {ad.category.replace(/-/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{ad.primary_keyword}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePublished(ad)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                          ad.published
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {ad.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {ad.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      <a href={ad.cta_link || '/'} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300">
                        {ad.cta_link || '/'}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(ad)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <a
                          href={`/ads/${ad.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-400 text-center">
        Showing {filteredAds.length} of {ads.length} SEO ads
      </div>
    </div>
  );
}

