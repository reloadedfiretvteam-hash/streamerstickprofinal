import { useRef, useEffect, useState, useMemo } from 'react';

// Interface for carousel items - ready for admin panel integration
interface CarouselItem {
  id: string;
  type: 'sport' | 'movie' | 'series' | 'iptv';
  title: string;
  image: string;
  logo?: string;
}

// Supabase storage base URL for the 'imiges' bucket
const SUPABASE_STORAGE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/';

// Static carousel items using actual Supabase bucket images
// This array can be replaced with dynamic data from admin panel in the future
const getStaticCarouselItems = (): CarouselItem[] => [
  // SPORTS
  { 
    id: 'ufc-1', 
    type: 'sport', 
    title: 'UFC & Boxing PPV', 
    image: `${SUPABASE_STORAGE_URL}UFC.jpg`, 
    logo: '🥊' 
  },
  { 
    id: 'nfl-1', 
    type: 'sport', 
    title: 'NFL All Teams Live', 
    image: `${SUPABASE_STORAGE_URL}c643f060-ea1b-462f-8509-ea17b005318aNFL.jpg`, 
    logo: '🏈' 
  },
  { 
    id: 'nba-1', 
    type: 'sport', 
    title: 'NBA All Games', 
    image: `${SUPABASE_STORAGE_URL}downloadBASKET%20BALL.jpg`, 
    logo: '🏀' 
  },
  { 
    id: 'mlb-1', 
    type: 'sport', 
    title: 'MLB All 30 Teams', 
    image: `${SUPABASE_STORAGE_URL}BASEBALL.webp`, 
    logo: '⚾' 
  },
  // IPTV & STREAMING
  { 
    id: 'iptv-1', 
    type: 'iptv', 
    title: 'IPTV Smarters', 
    image: `${SUPABASE_STORAGE_URL}IPTVSmarters%20TV%20IMAG.jpg` 
  },
  { 
    id: 'iptv-2', 
    type: 'iptv', 
    title: 'Premium Streaming', 
    image: `${SUPABASE_STORAGE_URL}iptv3.jpg` 
  },
  { 
    id: 'iptv-3', 
    type: 'iptv', 
    title: 'Live Channels', 
    image: `${SUPABASE_STORAGE_URL}OIP%20(11)%20websit%20pic%20copy%20copy.jpg` 
  },
  // MOVIES & SHOWS
  { 
    id: 'movie-1', 
    type: 'movie', 
    title: 'On-Demand Movies', 
    image: `${SUPABASE_STORAGE_URL}Playback-Tile-1024x512.webp` 
  },
  { 
    id: 'movie-2', 
    type: 'movie', 
    title: 'Movie Categories', 
    image: `${SUPABASE_STORAGE_URL}Movies-categories_11zon-1024x512.webp` 
  },
  { 
    id: 'iptv-4', 
    type: 'iptv', 
    title: 'HD Quality', 
    image: `${SUPABASE_STORAGE_URL}5-1.webp` 
  },
  { 
    id: 'iptv-5', 
    type: 'iptv', 
    title: 'Sports Package', 
    image: `${SUPABASE_STORAGE_URL}9-1.webp` 
  },
];

export default function MediaCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Get carousel items - memoized for performance
  const mediaItems = useMemo(() => getStaticCarouselItems(), []);

  // Handle image error - use fallback image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // Only try fallback once to avoid infinite loop
    if (!target.dataset.fallbackAttempted) {
      target.dataset.fallbackAttempted = 'true';
      // Set fallback image
      target.src = `${SUPABASE_STORAGE_URL}iptv3.jpg`;
    }
  };

  // CSS animation for continuous smooth scrolling
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || mediaItems.length === 0) return;

    // Calculate total animation duration based on content width
    // Slower = smoother and more gentle
    const itemWidth = 280; // Approximate width per item including gap
    const totalWidth = itemWidth * mediaItems.length;
    const animationDuration = totalWidth / 30; // 30px per second = gentle scroll

    // Apply CSS animation for smooth infinite scroll
    const style = document.createElement('style');
    style.id = 'carousel-animation-style';
    style.textContent = `
      @keyframes carousel-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .carousel-track {
        animation: carousel-scroll ${animationDuration}s linear infinite;
      }
      .carousel-track:hover,
      .carousel-track.paused {
        animation-play-state: paused;
      }
    `;
    
    // Remove existing style if any
    const existingStyle = document.getElementById('carousel-animation-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById('carousel-animation-style');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [mediaItems.length]);

  // Duplicate items for seamless infinite scroll
  const duplicatedItems = useMemo(() => [...mediaItems, ...mediaItems], [mediaItems]);

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Watch <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Everything</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            New movies, trending series, and live sports - all in one place
          </p>
        </div>

        {/* Continuous Scrolling Carousel */}
        <div 
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Gradient fade edges for visual polish */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />
          
          {/* Scrolling track */}
          <div 
            ref={scrollRef}
            className={`carousel-track flex gap-4 md:gap-6 ${isPaused ? 'paused' : ''}`}
            style={{ width: 'max-content' }}
          >
            {duplicatedItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px] group cursor-pointer"
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl aspect-[3/4]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading={index < mediaItems.length ? 'eager' : 'lazy'}
                    onError={handleImageError}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    {item.logo && (
                      <div className="text-3xl md:text-4xl mb-1 md:mb-2 drop-shadow-lg">{item.logo}</div>
                    )}
                    <h3 className="text-white font-bold text-sm md:text-lg mb-0.5 md:mb-1 drop-shadow-lg leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 text-xs md:text-sm capitalize">{item.type}</p>
                  </div>

                  {/* Live Badge - only for sports */}
                  {item.type === 'sport' && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 md:py-1 rounded text-xs font-bold animate-pulse">
                      LIVE
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-12 md:mt-16 bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-2xl md:text-4xl font-bold text-orange-400 mb-1 md:mb-2">18,000+</div>
              <div className="text-gray-300 text-sm md:text-base">Live Channels</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold text-orange-400 mb-1 md:mb-2">60,000+</div>
              <div className="text-gray-300 text-sm md:text-base">Movies & Shows</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold text-orange-400 mb-1 md:mb-2">16,000+</div>
              <div className="text-gray-300 text-sm md:text-base">TV Series</div>
            </div>
            <div>
              <div className="text-2xl md:text-4xl font-bold text-orange-400 mb-1 md:mb-2">ALL</div>
              <div className="text-gray-300 text-sm md:text-base">Sports & PPV</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
