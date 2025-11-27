import { useState } from 'react';
import { Play, X, Upload, AlertCircle } from 'lucide-react';
import { getStorageUrl } from '../lib/supabase';

interface IPTVPreviewVideoProps {
  videoUrl?: string;
}

export default function IPTVPreviewVideo({ videoUrl }: IPTVPreviewVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Default video URL from Supabase Storage - user can update this in admin panel
  // Note: bucket name is 'imiges' (not 'images')
  const defaultVideoUrl = videoUrl || getStorageUrl('imiges', 'iptv-preview-video.mp4');

  const handlePlay = () => {
    setIsPlaying(true);
    setShowModal(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setShowModal(false);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-orange-900 to-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              See What You Get with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">IPTV Subscription</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Watch this preview to see exactly what you'll see on your Fire Stick after logging in with your credentials. 
              Thousands of channels, movies, sports, and more - all in one place.
            </p>
          </div>

          {/* Video Preview Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer" onClick={handlePlay}>
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
              {!isPlaying ? (
                <>
                  {/* Thumbnail/Preview */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all transform group-hover:scale-110">
                      <Play className="w-12 h-12 text-white ml-2" fill="white" />
                    </div>
                  </div>
                  
                  {/* Overlay Text */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                    <h3 className="text-2xl font-bold mb-2">IPTV Service Preview</h3>
                    <p className="text-gray-300">
                      Click to watch what you'll see on your Fire Stick after subscribing
                    </p>
                  </div>
                </>
              ) : videoError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                  <div className="text-center p-8">
                    <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Video Not Found</h3>
                    <p className="text-gray-300 mb-4">
                      The preview video hasn't been uploaded yet. Please upload it to Supabase Storage.
                    </p>
                    <a
                      href="https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/storage/buckets/imiges"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Video to Supabase
                    </a>
                  </div>
                </div>
              ) : (
                <video
                  src={defaultVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  onEnded={handleClose}
                  onError={() => setVideoError(true)}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>

          {/* Features List */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-3xl mb-3">📺</div>
              <h3 className="text-xl font-bold mb-2">20,000+ Live Channels</h3>
              <p className="text-gray-400">
                Sports, news, entertainment, international channels, and premium content
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="text-xl font-bold mb-2">60,000+ Movies & Shows</h3>
              <p className="text-gray-400">
                On-demand library with latest releases and classic favorites
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-bold mb-2">Instant Access</h3>
              <p className="text-gray-400">
                Get your credentials immediately after purchase and start streaming
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            {videoError ? (
              <div className="bg-gray-900 rounded-lg p-12 text-center">
                <AlertCircle className="w-20 h-20 text-orange-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Video Not Found</h3>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  The preview video file hasn't been uploaded to Supabase Storage yet. 
                  Please upload your video file to see the preview.
                </p>
                <a
                  href="https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/storage/buckets/imiges"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors text-lg"
                >
                  <Upload className="w-6 h-6" />
                  Upload Video to Supabase Storage
                </a>
                <p className="text-sm text-gray-400 mt-4">
                  File name should be: <code className="bg-gray-800 px-2 py-1 rounded">iptv-preview-video.mp4</code>
                </p>
              </div>
            ) : (
              <video
                src={defaultVideoUrl}
                controls
                autoPlay
                className="w-full h-auto rounded-lg"
                onEnded={handleClose}
                onError={() => setVideoError(true)}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

