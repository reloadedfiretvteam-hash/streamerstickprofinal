import { useState, useEffect } from 'react';
import { Upload, Download, File, Image, Trash2, ExternalLink, Copy, Check, Folder } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MediaFile {
  id: string;
  url: string;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export default function FileUploadManager() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      if (data) setFiles(data);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadUrl || !uploadFilename) {
      alert('Please provide both URL and filename');
      return;
    }

    setUploading(true);
    try {
      const fileType = uploadUrl.toLowerCase().includes('image')
        ? 'image'
        : uploadUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        ? 'image'
        : 'file';

      const { error } = await supabase
        .from('media_files')
        .insert([{
          url: uploadUrl,
          filename: uploadFilename,
          file_type: fileType,
          file_size: 0
        }])
        .select()
        .single();

      if (error) throw error;

      alert('File uploaded successfully!');
      setUploadUrl('');
      setUploadFilename('');
      loadFiles();
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('File deleted!');
      loadFiles();
    } catch (error: any) {
      alert('Delete failed: ' + error.message);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
  };

  // Utility function for future use
  // const formatFileSize = (bytes: number) => {
  //   if (bytes === 0) return 'N/A';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  // };

  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    if (filter === 'images') return file.file_type === 'image';
    if (filter === 'files') return file.file_type !== 'image';
    return true;
  });

  if (loading) {
    return <div className="p-8 text-white">Loading files...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Folder className="w-8 h-8 text-blue-400" />
          File Upload & Download Manager
        </h1>
        <p className="text-gray-400">Upload, manage, and download images and files for your website</p>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Upload New File
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">File URL *</label>
            <input
              type="text"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              placeholder="https://example.com/image.jpg or https://images.pexels.com/..."
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white"
            />
            <p className="text-white/70 text-sm mt-1">
              Paste URL from Pexels, Unsplash, or any public image/file URL
            </p>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Filename *</label>
            <input
              type="text"
              value={uploadFilename}
              onChange={(e) => setUploadFilename(e.target.value)}
              placeholder="my-image.jpg"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
            <Upload className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-400">{files.length}</div>
          <div className="text-gray-400 text-sm">Total Files</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-400">
            {files.filter(f => f.file_type === 'image').length}
          </div>
          <div className="text-gray-400 text-sm">Images</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-400">
            {files.filter(f => f.file_type !== 'image').length}
          </div>
          <div className="text-gray-400 text-sm">Other Files</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Files ({files.length})
        </button>
        <button
          onClick={() => setFilter('images')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'images'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Images ({files.filter(f => f.file_type === 'image').length})
        </button>
        <button
          onClick={() => setFilter('files')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'files'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Files ({files.filter(f => f.file_type !== 'image').length})
        </button>
      </div>

      {/* Files Grid */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-gray-900 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Your Files ({filteredFiles.length})
          </h3>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No files uploaded yet</p>
            <p className="text-sm">Upload your first file using the form above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition"
              >
                {/* Preview */}
                {file.file_type === 'image' ? (
                  <div className="h-48 bg-gray-800">
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-800 flex items-center justify-center">
                    <File className="w-16 h-16 text-gray-600" />
                  </div>
                )}

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{file.filename}</h4>
                      <p className="text-gray-400 text-xs">
                        {new Date(file.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    {file.file_type === 'image' && (
                      <Image className="w-5 h-5 text-green-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="text-gray-400 text-xs mb-3 break-all">
                    {file.url.substring(0, 40)}...
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(file.url)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm flex items-center justify-center gap-1"
                      title="Copy URL"
                    >
                      {copiedUrl === file.url ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => downloadFile(file.url, file.filename)}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          How to Upload Files
        </h3>
        <ul className="text-blue-200 space-y-2 text-sm">
          <li>• Find an image on <a href="https://pexels.com" target="_blank" rel="noopener noreferrer" className="underline">Pexels.com</a> or <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">Unsplash.com</a></li>
          <li>• Right-click the image and select "Copy Image Address"</li>
          <li>• Paste the URL in the "File URL" field above</li>
          <li>• Give it a memorable filename (e.g., "fire-stick-hero.jpg")</li>
          <li>• Click "Upload File" to save it to your media library</li>
          <li>• Use "Copy" button to get the URL for use in products, pages, etc.</li>
        </ul>
      </div>
    </div>
  );
}
