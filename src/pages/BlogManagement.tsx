import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at: string;
  created_at: string;
}

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: 'draft',
    published_at: ''
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const postData = {
      ...formData,
      published_at: formData.status === 'published' && !formData.published_at
        ? new Date().toISOString()
        : formData.published_at
    };

    if (editingPost) {
      const { error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id);

      if (!error) {
        alert('Post updated successfully!');
        setShowForm(false);
        setEditingPost(null);
        resetForm();
        loadPosts();
      }
    } else {
      const { error } = await supabase
        .from('blog_posts')
        .insert([postData]);

      if (!error) {
        alert('Post created successfully!');
        setShowForm(false);
        resetForm();
        loadPosts();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Post deleted!');
      loadPosts();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featured_image: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      status: 'draft',
      published_at: ''
    });
  };

  const startEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData(post);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setShowForm(false);
    resetForm();
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  if (loading) {
    return <div className="p-8 text-white">Loading posts...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Blog & SEO Management</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition"
          >
            <Plus className="w-5 h-5" />
            New Blog Post
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-8 max-w-4xl w-full my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingPost ? 'Edit Post' : 'New Blog Post'}
                </h2>
                <button onClick={cancelEdit} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-orange-400">Basic Information</h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData({
                          ...formData,
                          title,
                          slug: formData.slug || generateSlug(title)
                        });
                      }}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Excerpt</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Short summary of the post"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                      placeholder="Write your content here..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Featured Image URL</label>
                    <input
                      type="url"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-blue-400">SEO Settings</h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Meta Title
                      <span className="text-gray-500 ml-2">({formData.meta_title?.length || 0}/60)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      maxLength={60}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SEO title for search engines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Meta Description
                      <span className="text-gray-500 ml-2">({formData.meta_description?.length || 0}/160)</span>
                    </label>
                    <textarea
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      maxLength={160}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SEO description for search results"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-green-400">Publishing</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'scheduled' })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Publish Date</label>
                      <input
                        type="datetime-local"
                        value={formData.published_at ? new Date(formData.published_at).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setFormData({ ...formData, published_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editingPost ? 'Update Post' : 'Create Post'}
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
                  <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Published</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold">{post.title}</div>
                        <div className="text-sm text-gray-400">/{post.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.status === 'published' ? 'bg-green-500/20 text-green-400' :
                        post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(post)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No blog posts yet. Click "New Blog Post" to create one.
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
