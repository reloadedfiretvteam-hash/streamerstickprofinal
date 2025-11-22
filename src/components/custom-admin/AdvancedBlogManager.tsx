import { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Search, Check, X, Save, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  focus_keyword: string;
  status: string;
  published_at: string;
  view_count: number;
  read_time_minutes: number;
  seo_score: number;
  category_id: string;
}

interface Category {
  id: string;
  category_name: string;
  slug: string;
}

export default function AdvancedBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts_advanced')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('category_name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSavePost = async () => {
    if (!editingPost) return;

    try {
      const postData = {
        ...editingPost,
        updated_at: new Date().toISOString()
      };

      if (editingPost.id) {
        const { error } = await supabase
          .from('blog_posts_advanced')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        alert('Blog post updated successfully!');
      } else {
        const { error } = await supabase
          .from('blog_posts_advanced')
          .insert([postData]);

        if (error) throw error;
        alert('Blog post created successfully!');
      }

      setIsEditing(false);
      setEditingPost(null);
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving blog post. Please try again.');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts_advanced')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Blog post deleted successfully!');
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting blog post.');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts_advanced')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      alert('Blog post published!');
      loadPosts();
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Error publishing blog post.');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const { error} = await supabase
        .from('blog_posts_advanced')
        .update({
          status: 'draft'
        })
        .eq('id', id);

      if (error) throw error;
      alert('Blog post unpublished!');
      loadPosts();
    } catch (error) {
      console.error('Error unpublishing post:', error);
      alert('Error unpublishing blog post.');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getSEOScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return <div className="text-center py-8">Loading blog posts...</div>;
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Edit className="w-6 h-6" />
            {editingPost?.id ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingPost(null);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={editingPost?.title || ''}
                onChange={(e) => setEditingPost(prev => prev ? {...prev, title: e.target.value} : null)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={editingPost?.slug || ''}
                onChange={(e) => setEditingPost(prev => prev ? {...prev, slug: e.target.value} : null)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="url-friendly-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={editingPost?.excerpt || ''}
              onChange={(e) => setEditingPost(prev => prev ? {...prev, excerpt: e.target.value} : null)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Brief description of the post"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              value={editingPost?.content || ''}
              onChange={(e) => setEditingPost(prev => prev ? {...prev, content: e.target.value} : null)}
              rows={15}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm"
              placeholder="Full post content (HTML supported)"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use [PRODUCT_LINK_1], [PRODUCT_LINK_2], etc. as placeholders for product links
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Featured Image URL
              </label>
              <input
                type="text"
                value={editingPost?.featured_image || ''}
                onChange={(e) => setEditingPost(prev => prev ? {...prev, featured_image: e.target.value} : null)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={editingPost?.category_id || ''}
                onChange={(e) => setEditingPost(prev => prev ? {...prev, category_id: e.target.value} : null)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-white mb-4">SEO Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Title *
                </label>
                <input
                  type="text"
                  value={editingPost?.meta_title || ''}
                  onChange={(e) => setEditingPost(prev => prev ? {...prev, meta_title: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="SEO title (60 characters max)"
                  maxLength={60}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {editingPost?.meta_title?.length || 0}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta Description *
                </label>
                <textarea
                  value={editingPost?.meta_description || ''}
                  onChange={(e) => setEditingPost(prev => prev ? {...prev, meta_description: e.target.value} : null)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="SEO description (160 characters max)"
                  maxLength={160}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {editingPost?.meta_description?.length || 0}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Focus Keyword
                </label>
                <input
                  type="text"
                  value={editingPost?.focus_keyword || ''}
                  onChange={(e) => setEditingPost(prev => prev ? {...prev, focus_keyword: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Main keyword for SEO"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={editingPost?.read_time_minutes || 5}
                    onChange={(e) => setEditingPost(prev => prev ? {...prev, read_time_minutes: parseInt(e.target.value)} : null)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SEO Score (0-100)
                  </label>
                  <input
                    type="number"
                    value={editingPost?.seo_score || 0}
                    onChange={(e) => setEditingPost(prev => prev ? {...prev, seo_score: parseInt(e.target.value)} : null)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSavePost}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Post
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingPost(null);
              }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Blog Post Management
        </h2>
        <button
          onClick={() => {
            setEditingPost({
              id: '',
              title: '',
              slug: '',
              excerpt: '',
              content: '',
              featured_image: '',
              meta_title: '',
              meta_description: '',
              meta_keywords: [],
              focus_keyword: '',
              status: 'draft',
              published_at: '',
              view_count: 0,
              read_time_minutes: 5,
              seo_score: 0,
              category_id: ''
            });
            setIsEditing(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Post
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      post.status === 'published' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                    }`}>
                      {post.status}
                    </span>
                    <span className={`text-sm font-semibold ${getSEOScoreColor(post.seo_score)}`}>
                      SEO: {post.seo_score}/100
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{post.view_count} views</span>
                    <span>{post.read_time_minutes} min read</span>
                    <span>/blog/{post.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                    title="View post"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setEditingPost(post);
                      setIsEditing(true);
                    }}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {post.status === 'draft' ? (
                    <button
                      onClick={() => handlePublish(post.id)}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      title="Publish"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnpublish(post.id)}
                      className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                      title="Unpublish"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No blog posts found. Create your first post!
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Blog Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{posts.length}</div>
            <div className="text-sm text-gray-400">Total Posts</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {posts.filter(p => p.status === 'published').length}
            </div>
            <div className="text-sm text-gray-400">Published</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {posts.filter(p => p.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-400">Drafts</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {posts.reduce((sum, p) => sum + p.view_count, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>
        </div>
      </div>
    </div>
  );
}
