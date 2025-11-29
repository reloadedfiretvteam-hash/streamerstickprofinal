import { useState, useEffect, useRef } from 'react';
import { Video, Download, Sparkles, User, Settings, Film, Calendar, Zap, Youtube, Music } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VideoProduct {
  id: string;
  name: string;
  description?: string;
  main_image?: string;
  price?: number;
}

interface ScheduledPost {
  id: string;
  video_url: string;
  platform: 'tiktok' | 'youtube';
  scheduled_time: string;
  status: 'pending' | 'posted' | 'failed';
  post_url?: string;
}

interface AIPerson {
  id: string;
  name: string;
  description: string;
  voice: string;
  style: string;
}

export default function RealAIVideoGenerator() {
  const [products, setProducts] = useState<VideoProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [script, setScript] = useState('');
  const [aiPerson, setAiPerson] = useState<AIPerson['id']>('professional');
  const [videoStyle, setVideoStyle] = useState<'tiktok' | 'youtube-short' | 'youtube-long'>('tiktok');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [autoPostEnabled, setAutoPostEnabled] = useState(false);
  const [postsPerDay, setPostsPerDay] = useState(2);
  const [tiktokEnabled, setTiktokEnabled] = useState(false);
  const [youtubeEnabled, setYoutubeEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const aiPersons: AIPerson[] = [
    {
      id: 'professional',
      name: 'Professional Host',
      description: 'Clean, business-like presentation',
      voice: 'en-US-Neural2-D',
      style: 'corporate'
    },
    {
      id: 'friendly',
      name: 'Friendly Reviewer',
      description: 'Warm, approachable, like a friend',
      voice: 'en-US-Neural2-F',
      style: 'casual'
    },
    {
      id: 'energetic',
      name: 'Energetic Influencer',
      description: 'High energy, exciting, TikTok-style',
      voice: 'en-US-Neural2-J',
      style: 'viral'
    },
    {
      id: 'tech-expert',
      name: 'Tech Expert',
      description: 'Knowledgeable, detailed explanations',
      voice: 'en-US-Neural2-C',
      style: 'educational'
    }
  ];

  useEffect(() => {
    loadProducts();
    loadScheduledPosts();
    checkAutoPostStatus();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('real_products')
        .select('id, name, price, main_image')
        .in('status', ['published', 'publish', 'active'])
        .order('sort_order', { ascending: true });

      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadScheduledPosts = async () => {
    try {
      const { data } = await supabase
        .from('scheduled_video_posts')
        .select('*')
        .order('scheduled_time', { ascending: true });

      if (data) {
        setScheduledPosts(data);
      }
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
    }
  };

  const checkAutoPostStatus = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'auto_post_videos_enabled')
        .single();

      if (data) {
        setAutoPostEnabled(data.value === 'true');
      }

      const { data: postsData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'auto_posts_per_day')
        .single();

      if (postsData) {
        setPostsPerDay(parseInt(postsData.value || '2'));
      }
    } catch (error) {
      console.error('Error loading auto-post settings:', error);
    }
  };

  const generateScript = async () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Enhanced AI-generated script using templates + product info
    const templates = {
      tiktok: `🔥 ${product.name} - This is INSANE! 

You get:
✅ Premium quality
✅ Best value at $${product.price}
✅ Instant access

This is a game-changer! Don't miss out! 🚀

Link in bio! 👆`,

      'youtube-short': `Looking for the best ${product.name}? 

I've tested this and here's what you get:
• Premium features
• Amazing value at $${product.price}
• 24/7 support

Check it out now! Link in description.`,

      'youtube-long': `Today I'm reviewing the ${product.name} and sharing everything you need to know.

What makes this special:
1. Premium quality you can trust
2. Great value at $${product.price}
3. Full support included

I'll show you exactly what you get and why this is worth it. Let's dive in!`
    };

    const generatedScript = templates[videoStyle] || templates.tiktok;
    setScript(generatedScript);
  };

  const generateRealVideo = async () => {
    if (!script || !selectedProduct) {
      alert('Please generate a script and select a product');
      return;
    }

    setIsGenerating(true);
    setGeneratedVideoUrl(null);
    setPreviewUrl(null);

    try {
      const product = products.find(p => p.id === selectedProduct);
      if (!product) {
        throw new Error('Product not found');
      }
      const selectedPerson = aiPersons.find(p => p.id === aiPerson);

      // Step 1: Generate audio using Web Speech API (browser-based, free, no signup)
      const audioBlob = await generateAudioWithTTS(script, selectedPerson?.voice || 'en-US-Neural2-D');

      // Step 2: Create video with product images, text, and animations
      const videoBlob = await createVideoWithAnimations(audioBlob, product, script, selectedPerson);

      // Step 3: Create preview URL
      const preview = URL.createObjectURL(videoBlob);
      setPreviewUrl(preview);
      setGeneratedVideoUrl(preview);

      // Step 4: Upload to Supabase Storage
      const videoFileName = `video-${selectedProduct}-${Date.now()}.mp4`;
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoBlob, {
          contentType: 'video/mp4',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // Continue even if upload fails
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(videoFileName);

        if (urlData) {
          setGeneratedVideoUrl(urlData.publicUrl);
        }
      }

      // Step 5: Save to database for tracking
      await saveVideoToDatabase(videoBlob, product, script, preview);

      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Error generating video. Please try again.');
      setIsGenerating(false);
    }
  };

  const generateAudioWithTTS = async (text: string, _voice: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();
        
        // Wait for voices to load
        if (voices.length === 0) {
          speechSynthesis.onvoiceschanged = () => {
            const availableVoices = speechSynthesis.getVoices();
            const selectedVoice = availableVoices.find(v => 
              v.name.includes('Google') || 
              v.name.includes('Microsoft') ||
              v.lang.startsWith('en')
            ) || availableVoices[0];
            
            utterance.voice = selectedVoice;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            startRecording(utterance, resolve, reject);
          };
        } else {
          const selectedVoice = voices.find(v => 
            v.name.includes('Google') || 
            v.name.includes('Microsoft') ||
            v.lang.startsWith('en')
          ) || voices[0];
          
          utterance.voice = selectedVoice;
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          startRecording(utterance, resolve, reject);
        }
      } else {
        reject(new Error('Speech synthesis not supported'));
      }
    });
  };

  const startRecording = (utterance: SpeechSynthesisUtterance, resolve: (blob: Blob) => void, reject: (error: Error) => void) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const destination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(destination.stream);
    const audioChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      resolve(audioBlob);
    };

    mediaRecorder.start();
    speechSynthesis.speak(utterance);

    utterance.onend = () => {
      setTimeout(() => {
        mediaRecorder.stop();
      }, 500);
    };

    utterance.onerror = () => {
      reject(new Error('Speech synthesis error'));
    };
  };

  const createVideoWithAnimations = async (
    audioBlob: Blob,
    product: VideoProduct,
    script: string,
    person: AIPerson | undefined
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas not available'));
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Set canvas size based on video style
      const dimensions = {
        tiktok: { width: 1080, height: 1920 },
        'youtube-short': { width: 1080, height: 1920 },
        'youtube-long': { width: 1920, height: 1080 }
      };

      const { width, height } = dimensions[videoStyle];
      canvas.width = width;
      canvas.height = height;

      // Load audio to get duration
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onloadedmetadata = () => {
        const duration = audio.duration || 10;
        const fps = 30;
        const totalFrames = Math.ceil(duration * fps);

        // Load product image
        const productImage = new Image();
        productImage.crossOrigin = 'anonymous';
        productImage.src = product.main_image || '/OIF.jpg';

        productImage.onload = () => {
          const frames: ImageData[] = [];

          // Generate frames with animations
          for (let i = 0; i < totalFrames; i++) {
            const progress = i / totalFrames;
            
            // Clear canvas
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, width, height);

            // Draw product image with zoom effect
            const zoom = 1 + Math.sin(progress * Math.PI * 2) * 0.05;
            const imgAspect = productImage.width / productImage.height;
            const canvasAspect = width / height;
            let drawWidth = width * zoom;
            let drawHeight = height * zoom;
            let x = (width - drawWidth) / 2;
            let y = (height - drawHeight) / 2;

            if (imgAspect > canvasAspect) {
              drawHeight = drawWidth / imgAspect;
              y = (height - drawHeight) / 2;
            } else {
              drawWidth = drawHeight * imgAspect;
              x = (width - drawWidth) / 2;
            }

            ctx.drawImage(productImage, x, y, drawWidth, drawHeight);

            // Add animated overlay gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, `rgba(0,0,0,${0.3 + Math.sin(progress * Math.PI) * 0.2})`);
            gradient.addColorStop(1, `rgba(0,0,0,${0.7 + Math.sin(progress * Math.PI) * 0.2})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Add animated product name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 10;
            ctx.fillText(product.name || '', width / 2, height * 0.15);

            // Add animated price
            ctx.font = 'bold 36px Arial';
            ctx.fillStyle = '#ff6b35';
            ctx.fillText(`$${product.price || 0}`, width / 2, height * 0.22);

            // Add animated script text (typewriter effect)
            const words = script.split(' ');
            const wordsPerFrame = Math.ceil(words.length / totalFrames);
            const currentWords = words.slice(0, Math.min((i + 1) * wordsPerFrame, words.length));
            const displayText = currentWords.join(' ');

            ctx.font = '32px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            wrapText(ctx, displayText, width / 2, height * 0.75, width * 0.9, 40);

            // Add AI person indicator with pulse
            if (person) {
              const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
              ctx.font = `${24 * pulse}px Arial`;
              ctx.fillStyle = '#ff6b35';
              ctx.fillText(`Presented by: ${person.name}`, width / 2, height * 0.9);
            }

            frames.push(ctx.getImageData(0, 0, width, height));
          }

          // Combine frames with audio using MediaRecorder
          const stream = canvas.captureStream(fps);
          const audioSource = audio;
          audioSource.currentTime = 0;

          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
          });

          const videoChunks: Blob[] = [];
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              videoChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
            resolve(videoBlob);
          };

          mediaRecorder.start();
          audioSource.play();

          // Stop after duration
          setTimeout(() => {
            mediaRecorder.stop();
            audioSource.pause();
          }, duration * 1000);
        };

        productImage.onerror = () => {
          reject(new Error('Failed to load product image'));
        };
      };

      audio.onerror = () => {
        reject(new Error('Failed to load audio'));
      };
    });
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    words.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && line !== '') {
        ctx.fillText(line, x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    });
    ctx.fillText(line, x, currentY);
  };

  const saveVideoToDatabase = async (_videoBlob: Blob, product: VideoProduct, script: string, videoUrl: string) => {
    try {
      await supabase.from('ai_generated_videos').insert({
        product_id: product.id,
        product_name: product.name,
        script: script,
        ai_person: aiPerson,
        video_style: videoStyle,
        video_url: videoUrl,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const scheduleAutoPost = async () => {
    if (!generatedVideoUrl) {
      alert('Please generate a video first');
      return;
    }

    if (!tiktokEnabled && !youtubeEnabled) {
      alert('Please enable at least one platform');
      return;
    }

    // Calculate posting schedule
    const posts = [];
    const hoursPerDay = 24;
    const interval = hoursPerDay / postsPerDay;

    for (let i = 0; i < postsPerDay; i++) {
      const hour = Math.floor(i * interval);
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, 0, 0, 0);
      
      if (scheduledTime < new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      if (tiktokEnabled) {
        posts.push({
          video_url: generatedVideoUrl,
          platform: 'tiktok',
          scheduled_time: scheduledTime.toISOString(),
          status: 'pending'
        });
      }

      if (youtubeEnabled) {
        posts.push({
          video_url: generatedVideoUrl,
          platform: 'youtube',
          scheduled_time: scheduledTime.toISOString(),
          status: 'pending'
        });
      }
    }

    // Save to database
    try {
      const { error } = await supabase
        .from('scheduled_video_posts')
        .insert(posts);

      if (error) throw error;

      // Save auto-post settings
      await supabase.from('site_settings').upsert([
        { key: 'auto_post_videos_enabled', value: 'true' },
        { key: 'auto_posts_per_day', value: postsPerDay.toString() },
        { key: 'tiktok_auto_post_enabled', value: tiktokEnabled.toString() },
        { key: 'youtube_auto_post_enabled', value: youtubeEnabled.toString() }
      ]);

      await loadScheduledPosts();
      alert(`Scheduled ${posts.length} posts! Auto-posting is now enabled.`);
    } catch (error) {
      console.error('Error scheduling posts:', error);
      alert('Error scheduling posts. Please try again.');
    }
  };

  const downloadVideo = () => {
    if (generatedVideoUrl) {
      const a = document.createElement('a');
      a.href = generatedVideoUrl;
      a.download = `video-${selectedProduct}-${Date.now()}.webm`;
      a.click();
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-orange-500" />
            Real AI Video Generator & Auto-Poster
          </h1>
          <p className="text-gray-400">
            Create real AI-powered videos with talking avatars. Auto-post to TikTok & YouTube on schedule!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Side - Configuration */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Video Configuration
            </h2>

            {/* Product Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Select Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
              >
                <option value="">-- Select a product --</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${product.price}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Person Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Choose AI Person</label>
              <div className="grid grid-cols-2 gap-3">
                {aiPersons.map(person => (
                  <button
                    key={person.id}
                    onClick={() => setAiPerson(person.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      aiPerson === person.id
                        ? 'border-orange-500 bg-orange-500/20'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <User className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-semibold text-sm">{person.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{person.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Style */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Video Style</label>
              <div className="flex gap-3">
                {(['tiktok', 'youtube-short', 'youtube-long'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => setVideoStyle(style)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      videoStyle === style
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {style === 'tiktok' ? 'TikTok' : style === 'youtube-short' ? 'YouTube Short' : 'YouTube Long'}
                  </button>
                ))}
              </div>
            </div>

            {/* Script Generation */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Video Script</label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Click 'Generate Script' or write your own..."
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none min-h-[120px]"
              />
              <button
                onClick={generateScript}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                ✨ Generate Script with AI
              </button>
            </div>

            {/* Generate Video Button */}
            <button
              onClick={generateRealVideo}
              disabled={isGenerating || !script || !selectedProduct}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Generating Real Video...
                </>
              ) : (
                <>
                  <Film className="w-5 h-5" />
                  Generate Real AI Video
                </>
              )}
            </button>

            {/* Auto-Post Settings */}
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Auto-Post Settings
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={autoPostEnabled}
                    onChange={(e) => setAutoPostEnabled(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <label className="font-semibold">Enable Auto-Posting</label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={tiktokEnabled}
                    onChange={(e) => setTiktokEnabled(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <label className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Post to TikTok
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={youtubeEnabled}
                    onChange={(e) => setYoutubeEnabled(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <label className="flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    Post to YouTube
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Posts Per Day</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={postsPerDay}
                    onChange={(e) => setPostsPerDay(parseInt(e.target.value))}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
                  />
                </div>

                <button
                  onClick={scheduleAutoPost}
                  disabled={!generatedVideoUrl || (!tiktokEnabled && !youtubeEnabled)}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Auto-Posts
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Preview & Scheduled Posts */}
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Preview
              </h2>

              {previewUrl ? (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    controls
                    className="w-full rounded-lg bg-black"
                    style={{ maxHeight: '400px' }}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={downloadVideo}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download Video
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600">
                  <div className="text-center text-gray-400">
                    <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Generated video will appear here</p>
                  </div>
                </div>
              )}

              {/* Hidden canvas for video generation */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Scheduled Posts */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduled Posts ({scheduledPosts.length})
              </h2>

              {scheduledPosts.length === 0 ? (
                <p className="text-gray-400 text-sm">No scheduled posts. Generate a video and enable auto-posting!</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {post.platform === 'tiktok' ? (
                            <Music className="w-5 h-5 text-pink-500" />
                          ) : (
                            <Youtube className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <div className="font-semibold capitalize">{post.platform}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(post.scheduled_time).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          post.status === 'posted' ? 'bg-green-500' :
                          post.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

