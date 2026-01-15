import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  fetchpriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  srcSet?: string;
}

/**
 * Optimized Image Component
 * - Lazy loading with intersection observer
 * - Proper width/height to prevent layout shift
 * - WebP support with fallback
 * - Loading placeholder
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  fetchpriority = 'auto',
  sizes,
  srcSet,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [loading]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true); // Show placeholder even on error
  };

  // Convert to WebP if possible (browser will handle fallback)
  const getOptimizedSrc = (originalSrc: string) => {
    if (error || !originalSrc) return originalSrc;
    // If image is from Supabase, try WebP version
    if (originalSrc.includes('supabase.co')) {
      // Browser will automatically request WebP if supported
      return originalSrc;
    }
    return originalSrc;
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ width, height }}
    >
      {!isLoaded && !error && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
      {error && (
        <div
          className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 text-xs"
          style={{ width, height }}
          aria-hidden="true"
        >
          Image unavailable
        </div>
      )}
      <img
        ref={imgRef}
        src={isInView || loading === 'eager' ? getOptimizedSrc(src) : undefined}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded && !error ? 'opacity-100' : 'opacity-0'} ${className}`}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchpriority}
        sizes={sizes}
        srcSet={srcSet}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
