import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getCachedImage } from '../services/imageCacheService';

/**
 * CachedImage Component
 * Displays images with caching support and fallback handling
 */
const CachedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/placeholder-movie.png',
  lazy = true,
  onLoad,
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      if (!src) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        
        // Get cached image or fetch and cache it
        const cachedSrc = await getCachedImage(src);
        
        if (isMounted) {
          if (cachedSrc) {
            setImageSrc(cachedSrc);
          } else {
            // Image failed to load, use fallback
            setError(true);
            setImageSrc(fallbackSrc);
          }
        }
      } catch (err) {
        console.warn('Failed to load image:', src, err);
        if (isMounted) {
          setError(true);
          setImageSrc(fallbackSrc);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Lazy loading with Intersection Observer
    if (lazy && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              if (observerRef.current && imgRef.current) {
                observerRef.current.unobserve(imgRef.current);
              }
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before image enters viewport
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }

      return () => {
        if (observerRef.current && imgRef.current) {
          observerRef.current.unobserve(imgRef.current);
        }
      };
    } else {
      // Load immediately if lazy loading is disabled or not supported
      loadImage();
    }

    return () => {
      isMounted = false;
    };
  }, [src, lazy, fallbackSrc]);

  const handleImageLoad = (e) => {
    setLoading(false);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', src);
    setError(true);
    setImageSrc(fallbackSrc);
    if (onError) onError(e);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {loading && !imageSrc && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={lazy ? 'lazy' : 'eager'}
          {...props}
        />
      )}
      
      {error && !imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
          <div className="text-center p-4">
            <svg 
              className="w-12 h-12 mx-auto text-gray-400 mb-2" 
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
            <p className="text-xs text-gray-500 dark:text-gray-400">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
};

CachedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  fallbackSrc: PropTypes.string,
  lazy: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default CachedImage;
