import { useState } from 'react';
import { PlayCircle, BookOpen, Shield, Zap, ChevronDown, ChevronUp, MonitorPlay, Tv, Settings, Download } from 'lucide-react';

interface Guide {
  id: string;
  title: string;
  description: string;
  steps: string[];
  icon: React.ElementType;
  category: 'setup' | 'apps' | 'safety' | 'optimization';
}

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  youtubeId?: string;
}

const guides: Guide[] = [
  {
    id: 'firestick-setup',
    title: 'How to Set Up Your Jailbroken Fire Stick',
    description: 'Complete beginner guide to getting your Fire Stick ready in under 5 minutes.',
    icon: Settings,
    category: 'setup',
    steps: [
      'Connect your Fire Stick to your TV\'s HDMI port and plug in the power adapter.',
      'Turn on your TV and select the correct HDMI input.',
      'Follow the on-screen setup to connect to your WiFi network.',
      'Your Fire Stick comes pre-configured - simply navigate to any app to start streaming!',
      'For optimal performance, ensure your internet speed is at least 25 Mbps for 4K content.'
    ]
  },
  {
    id: 'iptv-setup',
    title: 'Setting Up Your IPTV Subscription',
    description: 'Step-by-step instructions to activate your IPTV service on any device.',
    icon: Tv,
    category: 'setup',
    steps: [
      'After purchase, you\'ll receive your IPTV credentials via email within 1-24 hours.',
      'Open the IPTV player app on your device (pre-installed on jailbroken Fire Sticks).',
      'Enter your username and password or M3U playlist URL.',
      'Wait for the channel list to load - this may take a few minutes on first setup.',
      'Browse categories and enjoy 18,000+ live channels, movies, and sports!'
    ]
  },
  {
    id: 'top-apps',
    title: 'Top Jailbroken FireStick Apps 2025',
    description: 'The best streaming apps for your jailbroken Fire Stick device.',
    icon: Download,
    category: 'apps',
    steps: [
      'Downloader - Essential for sideloading apps. Navigate to Settings > My Fire TV > Developer Options > Apps from Unknown Sources.',
      'IPTV Smarters Pro - Best for live TV streaming with electronic program guide (EPG).',
      'Kodi - Powerful media center with endless customization options and add-ons.',
      'Cinema HD - Great selection of movies and TV shows in HD/4K quality.',
      'VLC Media Player - Plays virtually any video format, great backup player.'
    ]
  },
  {
    id: 'safety-tips',
    title: 'Safety Tips for Streaming',
    description: 'Protect your privacy and ensure safe streaming on your devices.',
    icon: Shield,
    category: 'safety',
    steps: [
      'Consider using a VPN (Virtual Private Network) for enhanced privacy while streaming.',
      'Only download apps from trusted sources - your jailbroken Fire Stick comes with verified apps.',
      'Keep your Fire Stick software updated for security patches and performance improvements.',
      'Avoid sharing your IPTV credentials with others to protect your subscription.',
      'Use strong WiFi encryption (WPA3 or WPA2) on your home network.'
    ]
  },
  {
    id: 'optimization',
    title: 'Optimize Your Fire Stick for Best Performance',
    description: 'Speed up your Fire Stick and reduce buffering issues.',
    icon: Zap,
    category: 'optimization',
    steps: [
      'Clear cache regularly: Settings > Applications > Manage Installed Applications > Select app > Clear cache.',
      'Disable unused apps and features to free up memory and processing power.',
      'Use an Ethernet adapter for wired connection - more stable than WiFi for streaming.',
      'Restart your Fire Stick weekly to refresh memory and connections.',
      'Consider upgrading to Fire Stick 4K Max for the fastest performance and WiFi 6 support.'
    ]
  }
];

const videoTutorials: VideoTutorial[] = [
  {
    id: 'intro-video',
    title: 'Complete Fire Stick Setup Guide',
    description: 'Watch our comprehensive guide to setting up your jailbroken Fire Stick from unboxing to streaming.',
    thumbnail: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=640&q=80',
    duration: '5:32'
  },
  {
    id: 'iptv-tutorial',
    title: 'How to Set Up IPTV on Any Device',
    description: 'Learn how to configure your IPTV subscription on Fire Stick, Smart TV, or mobile devices.',
    thumbnail: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=640&q=80',
    duration: '4:15'
  },
  {
    id: 'apps-tutorial',
    title: 'Best Apps for Fire Stick 2025',
    description: 'Discover the top streaming apps that come pre-installed on your jailbroken Fire Stick.',
    thumbnail: 'https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=640&q=80',
    duration: '6:45'
  }
];

export default function EducationalGuides() {
  const [openGuide, setOpenGuide] = useState<string | null>('firestick-setup');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Guides', icon: BookOpen },
    { id: 'setup', label: 'Setup Guides', icon: Settings },
    { id: 'apps', label: 'App Recommendations', icon: Download },
    { id: 'safety', label: 'Safety Tips', icon: Shield },
    { id: 'optimization', label: 'Optimization', icon: Zap }
  ];

  const filteredGuides = activeCategory === 'all' 
    ? guides 
    : guides.filter(g => g.category === activeCategory);

  return (
    <section className="py-16 bg-gradient-to-b from-gray-100 to-white" id="guides">
      <div className="container mx-auto px-4">
        {/* SEO-Optimized Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            FireStick Setup Guides & Tutorials
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn everything about jailbroken Fire Stick setup, top streaming apps for 2025, 
            and expert tips to optimize your IPTV streaming experience.
          </p>
        </div>

        {/* Video Tutorials Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <PlayCircle className="w-8 h-8 text-orange-500" />
            Video Tutorials
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {videoTutorials.map((video) => (
              <article
                key={video.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{video.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Step-by-Step Guides */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-500" />
            Step-by-Step Guides
          </h3>
          <div className="space-y-4">
            {filteredGuides.map((guide) => (
              <article
                key={guide.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              >
                <button
                  onClick={() => setOpenGuide(openGuide === guide.id ? null : guide.id)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  aria-expanded={openGuide === guide.id}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                      <guide.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-bold text-gray-900">{guide.title}</h4>
                      <p className="text-gray-600 text-sm">{guide.description}</p>
                    </div>
                  </div>
                  {openGuide === guide.id ? (
                    <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {openGuide === guide.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                    <ol className="space-y-4">
                      {guide.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-4">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold flex items-center justify-center text-sm">
                            {idx + 1}
                          </span>
                          <p className="text-gray-700 pt-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Need Help CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100 max-w-3xl mx-auto">
            <MonitorPlay className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help Setting Up?
            </h3>
            <p className="text-gray-600 mb-6">
              Our 24/7 customer support team is ready to assist you with setup, troubleshooting, 
              and any questions about your jailbroken Fire Stick or IPTV subscription.
            </p>
            <a
              href="#contact"
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
