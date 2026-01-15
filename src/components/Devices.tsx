import { Smartphone, Monitor, Tv, Tablet } from 'lucide-react';

const SUPABASE_BASE = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges";
const deviceCompatibilityImage = `${SUPABASE_BASE}/smart-iptv-compatibility.jpg`;

export default function Devices() {
  const devices = [
    {
      icon: Tv,
      name: 'Smart TVs',
      description: 'Samsung, LG, Sony, Android TV',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Monitor,
      name: 'Streaming Devices',
      description: 'Fire Stick, Apple TV, Roku, Chromecast',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Smartphone,
      name: 'Mobile Devices',
      description: 'iPhone, Android phones',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Tablet,
      name: 'Tablets & Computers',
      description: 'iPad, Android tablets, Windows, Mac',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Works on All Your Devices
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch on any screen, anywhere. One subscription works across all your devices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-16">
          {devices.map((device, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${device.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
              >
                <device.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{device.name}</h3>
              <p className="text-gray-600">{device.description}</p>
            </div>
          ))}
        </div>

        {/* Device Compatibility Image Section */}
        <div className="mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Universal Compatibility
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Our IPTV service works seamlessly across all major platforms and devices. 
                  From smart TVs to streaming sticks, mobile devices to gaming consoles - we've got you covered.
                </p>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-gray-200 bg-white">
                <img 
                  src={deviceCompatibilityImage}
                  alt="IPTV Device Compatibility - Works on Smart TVs, Fire TV Stick, Android TV, Apple TV, Roku, Samsung, LG, NVIDIA Shield, Chromecast, and all mobile devices"
                  className="w-full h-auto object-contain"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'p-12 text-center text-gray-500';
                    fallback.innerHTML = '<p>Device compatibility image loading...</p>';
                    (e.target as HTMLImageElement).parentElement?.appendChild(fallback);
                  }}
                />
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Compatible with: Android, iOS, Windows, macOS, Fire TV, Apple TV, Roku, 
                  Samsung Smart TV, LG Smart TV, NVIDIA Shield, Chromecast, and more
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap justify-center gap-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 max-w-4xl">
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-gray-900">22,000+</div>
              <div className="text-sm text-gray-600">Live Channels</div>
            </div>
            <div className="hidden md:block w-px bg-gray-300"></div>
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-gray-900">120,000+</div>
              <div className="text-sm text-gray-600">Movies & Series</div>
            </div>
            <div className="hidden md:block w-px bg-gray-300"></div>
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-gray-900">4K/HD</div>
              <div className="text-sm text-gray-600">Quality Streams</div>
            </div>
            <div className="hidden md:block w-px bg-gray-300"></div>
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
