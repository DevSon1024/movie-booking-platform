/**
 * Image Cache Service
 * Handles caching of external images using Cache API
 * Provides fallback for offline/failed image loads
 */

const CACHE_NAME = 'movie-images-v1';
const CACHE_EXPIRY_DAYS = 7;
const METADATA_KEY = 'image-cache-metadata';

/**
 * Get cache metadata from localStorage
 */
const getCacheMetadata = () => {
  try {
    const metadata = localStorage.getItem(METADATA_KEY);
    return metadata ? JSON.parse(metadata) : {};
  } catch (error) {
    console.error('Error reading cache metadata:', error);
    return {};
  }
};

/**
 * Set cache metadata in localStorage
 */
const setCacheMetadata = (metadata) => {
  try {
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Error saving cache metadata:', error);
  }
};

/**
 * Check if cached image is expired
 */
const isCacheExpired = (cachedTime) => {
  const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  return Date.now() - cachedTime > expiryTime;
};

/**
 * Fetch and cache an image
 */
const fetchAndCacheImage = async (url) => {
  try {
    // Check if Cache API is supported
    if (!('caches' in window)) {
      console.warn('Cache API not supported, fetching image directly');
      return url;
    }

    const cache = await caches.open(CACHE_NAME);
    
    // Try to fetch the image
    const response = await fetch(url, {
      mode: 'cors',
      cache: 'force-cache', // Use browser cache if available
    });

    if (response.ok) {
      // Clone the response before caching (response can only be used once)
      await cache.put(url, response.clone());
      
      // Update metadata
      const metadata = getCacheMetadata();
      metadata[url] = {
        cachedAt: Date.now(),
        size: response.headers.get('content-length') || 'unknown',
      };
      setCacheMetadata(metadata);
      
      return URL.createObjectURL(await response.blob());
    } else {
      // Don't throw error for 404s, just return null to trigger fallback
      console.warn(`Image not found (${response.status}): ${url}`);
      return null;
    }
  } catch (error) {
    // Network error or CORS issue - return null to trigger fallback
    console.warn('Error fetching image:', error.message);
    return null;
  }
};

/**
 * Get image from cache or fetch if not cached
 */
export const getCachedImage = async (url) => {
  if (!url) return null;

  try {
    // Check if Cache API is supported
    if (!('caches' in window)) {
      return url; // Return original URL if Cache API not supported
    }

    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(url);
    
    // Check metadata for expiry
    const metadata = getCacheMetadata();
    const imageMetadata = metadata[url];

    if (cachedResponse && imageMetadata && !isCacheExpired(imageMetadata.cachedAt)) {
      // Image is cached and not expired
      const blob = await cachedResponse.blob();
      return URL.createObjectURL(blob);
    } else if (cachedResponse && imageMetadata) {
      // Image is cached but expired, delete it
      await cache.delete(url);
      delete metadata[url];
      setCacheMetadata(metadata);
    }

    // Image not cached or expired, fetch and cache it
    const result = await fetchAndCacheImage(url);
    return result; // Will be null if fetch failed, triggering fallback
  } catch (error) {
    console.warn('Error getting cached image:', error.message);
    // Return null to trigger fallback instead of original URL
    return null;
  }
};

/**
 * Preload and cache multiple images
 */
export const preloadImages = async (urls) => {
  const promises = urls.map(url => getCachedImage(url).catch(err => {
    console.error(`Failed to preload image: ${url}`, err);
    return null;
  }));
  
  return await Promise.allSettled(promises);
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = async () => {
  try {
    if (!('caches' in window)) return;

    const cache = await caches.open(CACHE_NAME);
    const metadata = getCacheMetadata();
    const updatedMetadata = {};

    for (const [url, data] of Object.entries(metadata)) {
      if (isCacheExpired(data.cachedAt)) {
        await cache.delete(url);
      } else {
        updatedMetadata[url] = data;
      }
    }

    setCacheMetadata(updatedMetadata);
    console.log('Expired cache entries cleared');
  } catch (error) {
    console.error('Error clearing expired cache:', error);
  }
};

/**
 * Clear all cached images
 */
export const clearAllCache = async () => {
  try {
    if (!('caches' in window)) return;

    await caches.delete(CACHE_NAME);
    localStorage.removeItem(METADATA_KEY);
    console.log('All image cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const metadata = getCacheMetadata();
  const urls = Object.keys(metadata);
  
  return {
    totalImages: urls.length,
    totalSize: urls.reduce((sum, url) => {
      const size = metadata[url].size;
      return sum + (size !== 'unknown' ? parseInt(size) : 0);
    }, 0),
    oldestCache: urls.length > 0 
      ? Math.min(...urls.map(url => metadata[url].cachedAt))
      : null,
  };
};

// Clear expired cache on service initialization
if (typeof window !== 'undefined') {
  clearExpiredCache();
}

export default {
  getCachedImage,
  preloadImages,
  clearExpiredCache,
  clearAllCache,
  getCacheStats,
};
