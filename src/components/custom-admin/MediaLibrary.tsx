import { useState, useEffect } from 'react';
import { Upload, Trash2, Copy, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  alt_text: string;
  tags: string[];
  created_at: string;
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    const { data } = await supabase
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setMedia(data);
    setLoading(false);
  };

  const addMedia = async () => {
    if (!newFileUrl.trim() || !newFileName.trim()) {
      alert('URL and filename are required!');
      return;
    }

    const fileType = newFileUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? 'image' : 'other';

    const { error } = await supabase
      .from('media_library')
      .insert([{
        file_name: newFileName,
        file_url: newFileUrl,
        file_type: fileType,
        alt_text: newFileName,
        tags: []
      }]);

    if (!error) {
      setNewFileUrl('');
      setNewFileName('');
      loadMedia();
      alert('Media added successfully!');
    }
  };

  const deleteMedia = async (id: string) => {
    if (!confirm('Delete this media file?')) return;
    await supabase.from('media_library').delete().eq('id', id);
    loadMedia();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.file_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) return <div className="p-8 text-white">Loading media...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Media Library</h2>
        <p className="text-gray-400">Manage all images and media files</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Add New Media</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-semibold mb-2">File Name</label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              placeholder="my-image.jpg"
            />
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">File URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newFileUrl}
                onChange={(e) => setNewFileUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="https://..."
              />
              <button
                onClick={addMedia}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                placeholder="Search media..."
              />
            </div>
          </div>
          <div className="w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none appearance-none"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 rounded-xl overflow-hidden group relative"
          >
            <div className="aspect-stripe bg-gray-800 flex items-center justify-center">
              {item.file_type === 'image' ? (
                <img
                  src={item.file_url}
                  alt={item.alt_text}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-500 text-4xl">📄</div>
              )}
            </div>
            <div className="p-3">
              <p className="text-white text-sm font-semibold truncate">{item.file_name}</p>
              <p className="text-gray-400 text-xs truncate">{item.file_type}</p>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => copyUrl(item.file_url)}
                className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                title="Copy URL"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteMedia(item.id)}
                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {searchTerm ? 'No media found matching your search.' : 'No media files yet. Add your first file above!'}
        </div>
      )}
    </div>
  );
}
