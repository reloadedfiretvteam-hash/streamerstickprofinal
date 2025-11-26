import { Download as DownloadIcon } from 'lucide-react';

export default function Download() {
  return (
    <section id="download" className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Download Our App
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Get instant access to 20,000+ channels. Download now and start watching!
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-12 flex items-center justify-center">
              <DownloadIcon className="w-32 h-32 text-white" />
            </div>
            
            <div className="md:w-1/2 p-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                StreamUnlimited Player
              </h3>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  20,000+ Live TV Channels
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  50,000+ Movies & TV Shows
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  All Sports & PPV Events
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Works on All Devices
                </li>
              </ul>

              <a
                href="mailto:reloadedfiretvteam@gmail.com?subject=Download%20Request%20-%20IPTV%20Player"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center group"
              >
                <DownloadIcon className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                Request Download Link
              </a>

              <p className="text-sm text-gray-500 text-center mt-4">
                Compatible with Fire Stick, Android, iOS, Smart TV
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <a
            href="/fire-sticks"
            className="bg-white/10 backdrop-blur-sm text-white p-6 rounded-xl hover:bg-white/20 transition-all duration-300 text-center group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📺</div>
            <div className="font-semibold">Fire Stick</div>
          </a>

          <a
            href="mailto:reloadedfiretvteam@gmail.com?subject=Android%20App%20Request"
            className="bg-white/10 backdrop-blur-sm text-white p-6 rounded-xl hover:bg-white/20 transition-all duration-300 text-center group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
            <div className="font-semibold">Android</div>
          </a>

          <a
            href="mailto:reloadedfiretvteam@gmail.com?subject=iOS%20App%20Request"
            className="bg-white/10 backdrop-blur-sm text-white p-6 rounded-xl hover:bg-white/20 transition-all duration-300 text-center group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🍎</div>
            <div className="font-semibold">iOS</div>
          </a>

          <a
            href="mailto:reloadedfiretvteam@gmail.com?subject=Smart%20TV%20Setup%20Request"
            className="bg-white/10 backdrop-blur-sm text-white p-6 rounded-xl hover:bg-white/20 transition-all duration-300 text-center group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📱</div>
            <div className="font-semibold">Smart TV</div>
          </a>
        </div>
      </div>
    </section>
  );
}
