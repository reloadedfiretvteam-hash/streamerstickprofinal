import { useState, useEffect } from 'react';
import { ArrowRight, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Redirect {
  id: string;
  from_url: string;
  to_url: string;
  redirect_type: number;
  is_active: boolean;
  hit_count: number;
}

export default function RedirectsManager() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);

  useEffect(() => {
    loadRedirects();
  }, []);

  const loadRedirects = async () => {
    try {
      const { data, error } = await supabase
        .from('page_redirects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedirects(data || []);
    } catch (error) {
      console.error('Error loading redirects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingRedirect) return;

    try {
      if (editingRedirect.id) {
        const { error } = await supabase
          .from('page_redirects')
          .update({
            from_url: editingRedirect.from_url,
            to_url: editingRedirect.to_url,
            redirect_type: editingRedirect.redirect_type,
            is_active: editingRedirect.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRedirect.id);

        if (error) throw error;
        alert('Redirect updated successfully!');
      } else {
        const { error } = await supabase
          .from('page_redirects')
          .insert([{
            from_url: editingRedirect.from_url,
            to_url: editingRedirect.to_url,
            redirect_type: editingRedirect.redirect_type,
            is_active: editingRedirect.is_active
          }]);

        if (error) throw error;
        alert('Redirect created successfully!');
      }

      setIsEditing(false);
      setEditingRedirect(null);
      loadRedirects();
    } catch (error: any) {
      console.error('Error saving redirect:', error);
      alert('Error saving redirect: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this redirect?')) return;

    try {
      const { error } = await supabase
        .from('page_redirects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Redirect deleted successfully!');
      loadRedirects();
    } catch (error) {
      console.error('Error deleting redirect:', error);
      alert('Error deleting redirect');
    }
  };

  const toggleActive = async (redirect: Redirect) => {
    try {
      const { error } = await supabase
        .from('page_redirects')
        .update({ is_active: !redirect.is_active })
        .eq('id', redirect.id);

      if (error) throw error;
      loadRedirects();
    } catch (error) {
      console.error('Error toggling redirect:', error);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading redirects...</div>;
  }

  if (isEditing) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {editingRedirect?.id ? 'Edit Redirect' : 'Create New Redirect'}
          </h2>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingRedirect(null);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>

        <div className="bg-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              From URL (Old URL) *
            </label>
            <input
              type="text"
              value={editingRedirect?.from_url || ''}
              onChange={(e) => setEditingRedirect(prev => prev ? {...prev, from_url: e.target.value} : null)}
              placeholder="/old-page"
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">The old URL path that should redirect</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              To URL (New URL) *
            </label>
            <input
              type="text"
              value={editingRedirect?.to_url || ''}
              onChange={(e) => setEditingRedirect(prev => prev ? {...prev, to_url: e.target.value} : null)}
              placeholder="/new-page"
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">The new URL to redirect to</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Redirect Type
            </label>
            <select
              value={editingRedirect?.redirect_type || 301}
              onChange={(e) => setEditingRedirect(prev => prev ? {...prev, redirect_type: parseInt(e.target.value)} : null)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            >
              <option value={301}>301 - Permanent Redirect (SEO Recommended)</option>
              <option value={302}>302 - Temporary Redirect</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              301 passes SEO value to the new URL. Use 302 for temporary changes only.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={editingRedirect?.is_active || false}
              onChange={(e) => setEditingRedirect(prev => prev ? {...prev, is_active: e.target.checked} : null)}
              className="w-5 h-5"
            />
            <label htmlFor="is_active" className="text-white">
              Active (redirect is enabled)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Redirect
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingRedirect(null);
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ArrowRight className="w-6 h-6" />
          URL Redirects Manager
        </h2>
        <button
          onClick={() => {
            setEditingRedirect({
              id: '',
              from_url: '',
              to_url: '',
              redirect_type: 301,
              is_active: true,
              hit_count: 0
            });
            setIsEditing(true);
          }}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Redirect
        </button>
      </div>

      <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">What are URL Redirects?</h3>
        <p className="text-gray-300 text-sm">
          Redirects automatically send visitors from an old URL to a new URL. Use them when you:
        </p>
        <ul className="text-gray-300 text-sm mt-2 space-y-1 list-disc list-inside">
          <li>Rename or move a page</li>
          <li>Delete old content but want to preserve SEO value</li>
          <li>Fix broken links</li>
          <li>Consolidate similar pages</li>
        </ul>
      </div>

      {redirects.length === 0 ? (
        <div className="bg-gray-700 rounded-lg p-8 text-center">
          <ArrowRight className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No redirects configured yet</p>
          <button
            onClick={() => {
              setEditingRedirect({
                id: '',
                from_url: '',
                to_url: '',
                redirect_type: 301,
                is_active: true,
                hit_count: 0
              });
              setIsEditing(true);
            }}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
          >
            Create Your First Redirect
          </button>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="space-y-3">
            {redirects.map((redirect) => (
              <div key={redirect.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        redirect.redirect_type === 301 ? 'bg-green-600' : 'bg-yellow-600'
                      } text-white`}>
                        {redirect.redirect_type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        redirect.is_active ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}>
                        {redirect.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {redirect.hit_count > 0 && (
                        <span className="text-xs text-gray-400">
                          {redirect.hit_count} hits
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <code className="text-blue-400">{redirect.from_url}</code>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <code className="text-green-400">{redirect.to_url}</code>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(redirect)}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        redirect.is_active
                          ? 'bg-gray-600 hover:bg-gray-500 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {redirect.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingRedirect(redirect);
                        setIsEditing(true);
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(redirect.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{redirects.length}</div>
          <div className="text-sm text-gray-400">Total Redirects</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {redirects.filter(r => r.is_active).length}
          </div>
          <div className="text-sm text-gray-400">Active</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">
            {redirects.reduce((sum, r) => sum + r.hit_count, 0)}
          </div>
          <div className="text-sm text-gray-400">Total Hits</div>
        </div>
      </div>
    </div>
  );
}
