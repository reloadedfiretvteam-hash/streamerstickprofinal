import { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Download, Trash2, Search, Grid, List, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  alt_text?: string;
  tags?: string[];
  created_at: string;
}

export default function EnhancedMediaLibrary() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadTags, setUploadTags] = useState('');

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [media, searchQuery, selectedFilter]);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = [...media];

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(item => item.tags?.includes(selectedFilter));
    }

    setFilteredMedia(filtered);
  };

  const handleUpload = async () => {
    if (!uploadUrl) {
      alert('Please enter an image URL');
      return;
    }

    try {
      const filename = uploadUrl.split('/').pop() || `image-${Date.now()}.jpg`;
      const tags = uploadTags.split(',').map(t => t.trim()).filter(Boolean);

      const { error } = await supabase
        .from('media_library')
        .insert([{
          file_name: filename,
          file_url: uploadUrl,
          file_type: 'image/jpeg',
          alt_text: uploadAlt || filename,
          tags: tags
        }]);

      if (error) throw error;

      alert('Image uploaded successfully!');
      setUploadUrl('');
      setUploadAlt('');
      setUploadTags('');
      loadMedia();
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Failed to upload image');
    }
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Image deleted successfully!');
      loadMedia();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete image');
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Failed to download image');
    }
  };

  const uniqueTags = Array.from(new Set(media.flatMap(m => m.tags || [])));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ImageIcon className="w-8 h-8 text-purple-400" />
          Media Library
        </h1>
        <p className="text-gray-400">Upload, manage, and download images for your products</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-green-400" />
          Upload New Image
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Image URL (from Google, Amazon, or Pexels)
            </label>
            <input
              type="text"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Alt Text / Description
            </label>
            <input
              type="text"
              value={uploadAlt}
              onChange={(e) => setUploadAlt(e.target.value)}
              placeholder="Describe the image..."
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={uploadTags}
              onChange={(e) => setUploadTags(e.target.value)}
              placeholder="fire stick, 4k, amazon..."
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleUpload}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Image
            </button>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-3">
          💡 Tip: Right-click any image from Google Images or Amazon and copy the image URL
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images..."
                className="w-full bg-gray-700 text-white px-10 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All Images</option>
            {uniqueTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading media...</p>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchQuery || selectedFilter !== 'all' ? 'No images match your search' : 'No images in library'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-purple-500 transition group"
              >
                <div className="relative aspect-stripe">
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.file_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => copyToClipboard(item.file_url, item.id)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => downloadImage(item.file_url, item.file_name)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.file_name)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-semibold truncate">{item.file_name}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition"
              >
                <img
                  src={item.file_url}
                  alt={item.alt_text || item.file_name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-white font-semibold">{item.file_name}</p>
                  <p className="text-gray-400 text-sm">{item.alt_text || 'No description'}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-gray-600 text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item.file_url, item.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedId === item.id ? 'Copied!' : 'Copy URL'}
                  </button>
                  <button
                    onClick={() => downloadImage(item.file_url, item.file_name)}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.file_name)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-500/20 border-2 border-blue-500 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">📸 10 Real Fire Stick Images Pre-Loaded!</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-300">
          <div>
            <p className="font-semibold text-white mb-2">Available Images:</p>
            <ul className="space-y-1">
              <li>✓ Fire Stick 4K Box (Original)</li>
              <li>✓ Fire Stick 4K Max Box</li>
              <li>✓ Fire Stick Basic Box</li>
              <li>✓ Fire Stick 4K Device + Remote</li>
              <li>✓ Fire Stick Lite</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">More Images:</p>
            <ul className="space-y-1">
              <li>✓ Alexa Voice Remote</li>
              <li>✓ Fire Stick Unboxed</li>
              <li>✓ Fire Stick Setup Process</li>
              <li>✓ Fire Stick Interface</li>
              <li>✓ Jailbroken Fire Stick</li>
            </ul>
          </div>
        </div>
        <p className="text-gray-300 mt-4">
          All images are from official Amazon product photos and Pexels. Use them in your products, blogs, and marketing!
        </p>
      </div>
    </div>
  );
}
