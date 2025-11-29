import { useState, useEffect, useCallback, ImgHTMLAttributes } from 'react';

interface ValidatedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  /**
   * The source URL of the image to validate and display
   */
  src: string;
  /**
   * Fallback image URL to use if the primary image fails validation
   */
  fallbackSrc: string;
  /**
   * Minimum content-length in bytes to consider the image valid.
   * Images smaller than this are treated as corrupt/placeholder.
   * @default 1000
   */
  minBytes?: number;
  /**
   * Alt text for the image (required for accessibility)
   */
  alt: string;
  /**
   * Optional callback when image validation fails
   */
  onValidationFail?: (reason: string) => void;
}

/**
 * ValidatedImage - A React component that validates images before rendering.
 * 
 * Performs validation in two stages:
 * 1. HEAD request to check content-length (if CORS allows)
 * 2. Falls back to Image() naturalWidth/naturalHeight validation
 * 
 * If the image is invalid (too small, corrupt, or fails to load),
 * the fallback image is displayed instead.
 */
export default function ValidatedImage({
  src,
  fallbackSrc,
  minBytes = 1000,
  alt,
  onValidationFail,
  className,
  ...imgProps
}: ValidatedImageProps) {
  // Start with fallbackSrc to prevent flash of invalid image during validation
  const [currentSrc, setCurrentSrc] = useState<string>(fallbackSrc);
  const [_isValidating, setIsValidating] = useState<boolean>(true);
  const [hasFailed, setHasFailed] = useState<boolean>(false);

  /**
   * Validate image via HEAD request to check content-length
   * Returns true if valid, false if invalid or CORS blocked
   */
  const validateViaHead = useCallback(async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      });

      if (!response.ok) {
        if (import.meta.env.DEV) {
          console.debug(`[ValidatedImage] HEAD request failed for ${url}: ${response.status}`);
        }
        return false;
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const bytes = parseInt(contentLength, 10);
        if (bytes < minBytes) {
          if (import.meta.env.DEV) {
            console.debug(`[ValidatedImage] Image too small: ${bytes} bytes (min: ${minBytes})`);
          }
          return false;
        }
        return true;
      }
      
      // No content-length header, can't validate via HEAD
      return true;
    } catch {
      // CORS blocked or network error - fall back to Image() validation
      if (import.meta.env.DEV) {
        console.debug(`[ValidatedImage] HEAD request blocked for ${url}, using Image() fallback`);
      }
      return true; // Let Image() validation handle it
    }
  }, [minBytes]);

  /**
   * Validate image via Image() element to check naturalWidth/naturalHeight
   */
  const validateViaImage = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        // Check if image has valid dimensions
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          resolve(true);
        } else {
          if (import.meta.env.DEV) {
            console.debug(`[ValidatedImage] Invalid dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
          }
          resolve(false);
        }
      };
      
      img.onerror = () => {
        if (import.meta.env.DEV) {
          console.debug(`[ValidatedImage] Image failed to load: ${url}`);
        }
        resolve(false);
      };
      
      img.src = url;
    });
  }, []);

  /**
   * Run the full validation pipeline
   */
  const validateImage = useCallback(async () => {
    if (!src || src === fallbackSrc) {
      // Already using fallback or no src
      setCurrentSrc(fallbackSrc);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);

    try {
      // Step 1: Try HEAD validation
      const headValid = await validateViaHead(src);
      
      if (!headValid) {
        // HEAD check failed, use fallback
        setCurrentSrc(fallbackSrc);
        setHasFailed(true);
        onValidationFail?.('HEAD validation failed: content-length too small or not accessible');
        setIsValidating(false);
        return;
      }

      // Step 2: Validate via Image() element
      const imageValid = await validateViaImage(src);
      
      if (!imageValid) {
        // Image check failed, use fallback
        setCurrentSrc(fallbackSrc);
        setHasFailed(true);
        onValidationFail?.('Image validation failed: invalid dimensions or failed to load');
        setIsValidating(false);
        return;
      }

      // Both validations passed
      setCurrentSrc(src);
      setHasFailed(false);
    } catch (error) {
      // Unexpected error, use fallback
      if (import.meta.env.DEV) {
        console.debug(`[ValidatedImage] Validation error:`, error);
      }
      setCurrentSrc(fallbackSrc);
      setHasFailed(true);
      onValidationFail?.('Validation error: ' + String(error));
    } finally {
      setIsValidating(false);
    }
  }, [src, fallbackSrc, validateViaHead, validateViaImage, onValidationFail]);

  // Run validation when src changes
  useEffect(() => {
    validateImage();
  }, [validateImage]);

  /**
   * Handle runtime image load errors (e.g., network issues after validation)
   */
  const handleError = useCallback(() => {
    if (currentSrc !== fallbackSrc) {
      if (import.meta.env.DEV) {
        console.debug(`[ValidatedImage] Runtime error, switching to fallback`);
      }
      setCurrentSrc(fallbackSrc);
      setHasFailed(true);
      onValidationFail?.('Runtime load error');
    }
  }, [currentSrc, fallbackSrc, onValidationFail]);

  // Render the image - starts with fallback, switches to validated src if validation passes
  return (
    <img
      {...imgProps}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      data-validated={!hasFailed}
      data-fallback={hasFailed}
    />
  );
}
