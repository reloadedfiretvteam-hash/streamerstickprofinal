import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MediaCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Carousel images from Supabase Storage - replace placeholder stock photos
  const supabaseBaseUrl = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/';
  
  const mediaItems = [
    // BLOCKBUSTER MOVIES - Cinema & Theater
    { type: 'movie', title: 'Action Movies 2024', image: `${supabaseBaseUrl}Playback-Tile-1024x512.webp`, year: '2024' },
    { type: 'movie', title: 'Thriller & Horror', image: `${supabaseBaseUrl}Movies-categories_11zon-1024x512.webp`, year: '2024' },
    { type: 'movie', title: 'Drama & Romance', image: `${supabaseBaseUrl}Playback-Tile-1024x512.webp`, year: '2024' },
    { type: 'movie', title: 'Comedy Specials', image: `${supabaseBaseUrl}5-1.webp`, year: '2024' },
    { type: 'movie', title: 'Sci-Fi Adventure', image: `${supabaseBaseUrl}9-1.webp`, year: '2024' },

    // TV SERIES - Streaming Entertainment
    { type: 'series', title: 'Top US Series', image: `${supabaseBaseUrl}IPTVSmarters%20TV%20IMAG.jpg`, year: '2024' },
    { type: 'series', title: 'Trending Shows', image: `${supabaseBaseUrl}iptv3.jpg`, year: '2024' },
    { type: 'series', title: 'Binge-Worthy Series', image: `${supabaseBaseUrl}OIP%20(11)%20websit%20pic%20copy%20copy.jpg`, year: '2024' },

    // NFL FOOTBALL - Stadium & Action
    { type: 'sport', title: 'NFL All Teams Live', image: `${supabaseBaseUrl}c643f060-ea1b-462f-8509-ea17b005318aNFL.jpg`, logo: '🏈' },
    { type: 'sport', title: 'Super Bowl LIX', image: `${supabaseBaseUrl}c643f060-ea1b-462f-8509-ea17b005318aNFL.jpg`, logo: '🏈' },
    { type: 'sport', title: 'Monday Night Football', image: `${supabaseBaseUrl}c643f060-ea1b-462f-8509-ea17b005318aNFL.jpg`, logo: '🏈' },
    { type: 'sport', title: 'NFL Playoffs', image: `${supabaseBaseUrl}c643f060-ea1b-462f-8509-ea17b005318aNFL.jpg`, logo: '🏈' },

    // MLB BASEBALL - Stadium Views
    { type: 'sport', title: 'MLB All 30 Teams', image: `${supabaseBaseUrl}BASEBALL.webp`, logo: '⚾' },
    { type: 'sport', title: 'World Series Live', image: `${supabaseBaseUrl}BASEBALL.webp`, logo: '⚾' },
    { type: 'sport', title: 'MLB Playoffs', image: `${supabaseBaseUrl}BASEBALL.webp`, logo: '⚾' },

    // NBA BASKETBALL - Court Action
    { type: 'sport', title: 'NBA All Games', image: `${supabaseBaseUrl}downloadBASKET%20BALL.jpg`, logo: '🏀' },
    { type: 'sport', title: 'NBA Playoffs 2024', image: `${supabaseBaseUrl}downloadBASKET%20BALL.jpg`, logo: '🏀' },
    { type: 'sport', title: 'NBA Finals', image: `${supabaseBaseUrl}downloadBASKET%20BALL.jpg`, logo: '🏀' },

    // OTHER SPORTS - Hockey, Soccer, Combat
    { type: 'sport', title: 'UFC & Boxing PPV', image: `${supabaseBaseUrl}UFC.jpg`, logo: '🥊' },
    { type: 'sport', title: 'Soccer - All Leagues', image: `${supabaseBaseUrl}5-1.webp`, logo: '⚽' },
    { type: 'sport', title: 'Premier League', image: `${supabaseBaseUrl}9-1.webp`, logo: '⚽' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(mediaItems.length - 4, 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [mediaItems.length]);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(mediaItems.length - 4, 1));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(mediaItems.length - 4, 1)) % Math.max(mediaItems.length - 4, 1));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Watch <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Everything</span>
          </h2>
          <p className="text-xl text-gray-300">
            New movies, trending series, and live sports - all in one place
          </p>
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Carousel */}
          <div className="overflow-hidden mx-12">
            <div
              className="flex gap-4 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 6)}%)` }}
            >
              {mediaItems.map((item, index) => (
                <div
                  key={`carousel-${index}-${item.title}`}
                  className="flex-shrink-0 w-1/6 min-w-[200px] group cursor-pointer"
                >
                  <div className="relative rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-64 object-cover"
                      loading="eager"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Fallback to IPTV image if Supabase image fails
                        target.src = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv3.jpg';
                      }}
                    />
                    {/* Always visible gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                    {/* Content - Always visible */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {item.logo && (
                        <div className="text-4xl mb-2 drop-shadow-lg">{item.logo}</div>
                      )}
                      <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg leading-tight">{item.title}</h3>
                      <p className="text-gray-300 text-sm capitalize">{item.type}</p>
                    </div>

                    {/* Live Badge */}
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      LIVE
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">18,000+</div>
              <div className="text-gray-300">Live Channels</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">60,000+</div>
              <div className="text-gray-300">Movies & Shows</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">16,000+</div>
              <div className="text-gray-300">TV Series</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">ALL</div>
              <div className="text-gray-300">Sports & PPV</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
