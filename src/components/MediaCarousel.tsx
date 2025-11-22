import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MediaCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const mediaItems = [
    // BLOCKBUSTER MOVIES - Cinema & Theater
    { type: 'movie', title: 'Action Movies 2024', image: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), year: '2024' },
    { type: 'movie', title: 'Thriller & Horror', image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), year: '2024' },
    { type: 'movie', title: 'Drama & Romance', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), year: '2024' },
    { type: 'movie', title: 'Comedy Specials', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), year: '2024' },
    { type: 'movie', title: 'Sci-Fi Adventure', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), year: '2024' },

    // TV SERIES - Streaming Entertainment
    { type: 'series', title: 'Top US Series', image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), year: '2024' },
    { type: 'series', title: 'Trending Shows', image: 'https://images.unsplash.com/photo-1574267432644-f610e0494a3d?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), year: '2024' },
    { type: 'series', title: 'Binge-Worthy Series', image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), year: '2024' },

    // NFL FOOTBALL - Stadium & Action
    { type: 'sport', title: 'NFL All Teams Live', image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '🏈' },
    { type: 'sport', title: 'Super Bowl LIX', image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '🏈' },
    { type: 'sport', title: 'Monday Night Football', image: 'https://images.unsplash.com/photo-1577223625816-7546f36a3173?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '🏈' },
    { type: 'sport', title: 'NFL Playoffs', image: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '🏈' },

    // MLB BASEBALL - Stadium Views
    { type: 'sport', title: 'MLB All 30 Teams', image: 'https://images.unsplash.com/photo-1529446618125-1dee7f0e71ea?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '⚾' },
    { type: 'sport', title: 'World Series Live', image: 'https://images.unsplash.com/photo-1566577739943-c48fdd8d0bc1?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '⚾' },
    { type: 'sport', title: 'MLB Playoffs', image: 'https://images.unsplash.com/photo-1508394522741-82ac9c15ba69?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '⚾' },

    // NBA BASKETBALL - Court Action
    { type: 'sport', title: 'NBA All Games', image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '🏀' },
    { type: 'sport', title: 'NBA Playoffs 2024', image: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '🏀' },
    { type: 'sport', title: 'NBA Finals', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '🏀' },

    // OTHER SPORTS - Hockey, Soccer, Combat
    { type: 'sport', title: 'NHL Hockey Live', image: 'https://images.unsplash.com/photo-1589403785865-f6282213f28c?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '🏒' },
    { type: 'sport', title: 'UFC & Boxing PPV', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '🥊' },
    { type: 'sport', title: 'Soccer - All Leagues', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '⚽' },
    { type: 'sport', title: 'Premier League', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&h=400&fit=crop&q=80&auto=format&t=' + Date.now(), logo: '⚽' },
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
                        target.src = 'https://images.unsplash.com/photo-1574267432644-f610e0494a3d?w=600&h=400&fit=crop&q=80&auto=format';
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
