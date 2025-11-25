import { useEffect, useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MediaItem {
  type: 'movie' | 'series' | 'sport';
  title: string;
  image: string;
  logo?: string;
  year?: string;
}

// Default fallback images (Unsplash - reliable, free, no empty placeholders)
const defaultMediaItems: MediaItem[] = [
  // Movies
  { type: 'movie', title: 'Action Movies 2024', image: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=600&h=400&fit=crop&q=80', year: '2024' },
  { type: 'movie', title: 'Thriller & Horror', image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=600&h=400&fit=crop&q=80', year: '2024' },
  { type: 'movie', title: 'Drama & Romance', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&h=400&fit=crop&q=80', year: '2024' },
  { type: 'movie', title: 'Comedy Specials', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=400&fit=crop&q=80', year: '2024' },
  { type: 'movie', title: 'Sci-Fi Adventure', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop&q=80', year: '2024' },
  // TV Series
  { type: 'series', title: 'Top US Series', image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=600&h=400&fit=crop&q=80', year: '2024' },
  { type: 'series', title: 'Trending Shows', image: 'https://images.unsplash.com/photo-1574267432644-f610e0494a3d?w=600&h=400&fit=crop&q=80', year: '2024' },
  { type: 'series', title: 'Binge-Worthy Series', image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&h=400&fit=crop&q=80', year: '2024' },
  // Sports
  { type: 'sport', title: 'NFL All Teams Live', image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=400&fit=crop&q=80', logo: '🏈' },
  { type: 'sport', title: 'Super Bowl LIX', image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&h=400&fit=crop&q=80', logo: '🏈' },
  { type: 'sport', title: 'NBA All Games', image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&h=400&fit=crop&q=80', logo: '🏀' },
  { type: 'sport', title: 'MLB All 30 Teams', image: 'https://images.unsplash.com/photo-1529446618125-1dee7f0e71ea?w=600&h=400&fit=crop&q=80', logo: '⚾' },
  { type: 'sport', title: 'NHL Hockey Live', image: 'https://images.unsplash.com/photo-1589403785865-f6282213f28c?w=600&h=400&fit=crop&q=80', logo: '🏒' },
  { type: 'sport', title: 'UFC & Boxing PPV', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&q=80', logo: '🥊' },
  { type: 'sport', title: 'Soccer - All Leagues', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=400&fit=crop&q=80', logo: '⚽' },
  { type: 'sport', title: 'Premier League', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&h=400&fit=crop&q=80', logo: '⚽' },
];

export default function MediaCarousel() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(defaultMediaItems);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);

  // Load carousel images from Supabase if available
  const loadCarouselImages = useCallback(async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) return;

      // Try to get carousel images from storage bucket
      const { data: files } = await supabase.storage
        .from('imiges')
        .list('carousel', { limit: 50 });

      if (files && files.length > 0) {
        const supabaseImages: MediaItem[] = files
          .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp)$/i))
          .map((file) => ({
            type: 'movie' as const,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' '),
            image: `${supabaseUrl}/storage/v1/object/public/imiges/carousel/${file.name}`,
          }));

        if (supabaseImages.length > 0) {
          // Merge with defaults, preferring Supabase images
          setMediaItems([...supabaseImages, ...defaultMediaItems.slice(supabaseImages.length)]);
        }
      }
    } catch {
      // Use default items on error
      console.log('Using default carousel images');
    }
  }, []);

  useEffect(() => {
    loadCarouselImages();
  }, [loadCarouselImages]);

  // Smooth continuous scrolling animation
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    const speed = 0.5; // pixels per frame
    const contentWidth = scrollContainer.scrollWidth / 2; // Half because we duplicate items

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPositionRef.current += speed;
        
        // Reset position for seamless loop
        if (scrollPositionRef.current >= contentWidth) {
          scrollPositionRef.current = 0;
        }
        
        scrollContainer.style.transform = `translateX(-${scrollPositionRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, mediaItems.length]);

  const handlePrev = () => {
    const container = scrollRef.current;
    if (!container) return;
    scrollPositionRef.current = Math.max(0, scrollPositionRef.current - 300);
  };

  const handleNext = () => {
    const container = scrollRef.current;
    if (!container) return;
    const contentWidth = container.scrollWidth / 2;
    scrollPositionRef.current = (scrollPositionRef.current + 300) % contentWidth;
  };

  // Duplicate items for seamless loop
  const displayItems = [...mediaItems, ...mediaItems];

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

        <div 
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Carousel - Continuous scroll */}
          <div className="overflow-hidden mx-12">
            <div
              ref={scrollRef}
              className="flex gap-4"
              style={{ willChange: 'transform' }}
            >
              {displayItems.map((item, index) => (
                <div
                  key={`carousel-${index}-${item.title}`}
                  className="flex-shrink-0 w-48 md:w-56 lg:w-64 group cursor-pointer"
                >
                  <div className="relative rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 md:h-56 lg:h-64 object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1574267432644-f610e0494a3d?w=600&h=400&fit=crop&q=80';
                      }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {item.logo && (
                        <div className="text-3xl mb-2 drop-shadow-lg">{item.logo}</div>
                      )}
                      <h3 className="text-white font-bold text-sm md:text-base mb-1 drop-shadow-lg leading-tight">{item.title}</h3>
                      <p className="text-gray-300 text-xs capitalize">{item.type}</p>
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
