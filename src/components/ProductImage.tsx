/**
 * ProductImage Component
 * 
 * Displays product images with intelligent fallback logic:
 * 1. Try local /public/images/ asset
 * 2. Fall back to Supabase Storage URL
 * 3. Fall back to category-based placeholder
 * 4. Final fallback to generic placeholder
 */

import { useState, useEffect } from 'react';
import { getProductImage, ProductImageOptions } from '../utils/imageManager';

interface ProductImageProps extends ProductImageOptions {
  alt?: string;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export default function ProductImage({
  productId,
  imagePath,
  supabaseUrl,
  category,
  alt = 'Product image',
  className = '',
  onError,
  onLoad,
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Build fallback chain (filtered to only include valid strings)
  const fallbackChain: string[] = [
    imagePath, 
    supabaseUrl,
    category ? getProductImage({ category }) : null,
    '/placeholder.svg',
  ].filter((url): url is string => typeof url === 'string' && url.length > 0);

  useEffect(() => {
    // Start with the best available option
    const initialSrc = getProductImage({
      productId,
      imagePath,
      supabaseUrl,
      category,
    });
    setCurrentSrc(initialSrc);
    setFallbackIndex(0);
  }, [productId, imagePath, supabaseUrl, category]);

  const handleImageError = () => {
    // Try next fallback
    const nextIndex = fallbackIndex + 1;
    
    if (nextIndex < fallbackChain.length) {
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbackChain[nextIndex]);
    } else {
      // All fallbacks exhausted, ensure we use placeholder
      setCurrentSrc('/placeholder.svg');
    }

    if (onError) {
      onError();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </>
  );
}
