import { cacheManager, CACHE_KEYS, CACHE_DURATIONS } from './cache';

interface ImageCacheOptions {
  priority?: 'high' | 'medium' | 'low';
  format?: 'blob' | 'base64';
  maxSize?: number; // Max file size in bytes to cache
}

class ImageCacheManager {
  private preloadQueue: Set<string> = new Set();
  private preloadingPromises: Map<string, Promise<void>> = new Map();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB default max cache size

  /**
   * Preload and cache an image
   */
  async preloadImage(
    url: string, 
    options: ImageCacheOptions = {}
  ): Promise<void> {
    const {
      priority = 'medium',
      format = 'blob',
      maxSize = 10 * 1024 * 1024 // 10MB default max per image
    } = options;

    // Check if already cached
    const cacheKey = getCacheKey(CACHE_KEYS.IMAGE_BLOB(url));
    if (cacheManager.has(cacheKey)) {
      return;
    }

    // Check if already preloading
    if (this.preloadingPromises.has(url)) {
      return this.preloadingPromises.get(url);
    }

    // Add to queue
    this.preloadQueue.add(url);

    const preloadPromise = this.loadAndCacheImage(url, format, maxSize);
    this.preloadingPromises.set(url, preloadPromise);

    try {
      await preloadPromise;
    } finally {
      this.preloadQueue.delete(url);
      this.preloadingPromises.delete(url);
    }
  }

  /**
   * Load and cache an image
   */
  private async loadAndCacheImage(
    url: string, 
    format: 'blob' | 'base64', 
    maxSize: number
  ): Promise<void> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > maxSize) {
        console.warn(`Image too large to cache: ${url} (${contentLength} bytes)`);
        return;
      }

      const blob = await response.blob();
      
      // Check actual blob size
      if (blob.size > maxSize) {
        console.warn(`Image too large to cache: ${url} (${blob.size} bytes)`);
        return;
      }

      let cacheData: string | Blob;
      
      if (format === 'base64') {
        cacheData = await this.blobToBase64(blob);
      } else {
        cacheData = blob;
      }

      const cacheKey = getCacheKey(CACHE_KEYS.IMAGE_BLOB(url));
      
      // Store in memory cache for faster access
      cacheManager.set(cacheKey, {
        data: cacheData,
        format,
        size: blob.size,
        type: blob.type,
        url
      }, {
        ttl: CACHE_DURATIONS.DAY,
        storage: 'memory'
      });

      console.log(`Cached image: ${url} (${this.formatBytes(blob.size)})`);
    } catch (error) {
      console.error(`Failed to cache image ${url}:`, error);
    }
  }

  /**
   * Get cached image
   */
  getCachedImage(url: string): {
    data: string | Blob;
    format: 'blob' | 'base64';
    size: number;
    type: string;
    url: string;
  } | null {
    const cacheKey = getCacheKey(CACHE_KEYS.IMAGE_BLOB(url));
    return cacheManager.get(cacheKey, { storage: 'memory' });
  }

  /**
   * Create object URL from cached image
   */
  getCachedImageUrl(url: string): string | null {
    const cached = this.getCachedImage(url);
    if (!cached) return null;

    if (cached.format === 'base64') {
      return cached.data as string;
    } else {
      return URL.createObjectURL(cached.data as Blob);
    }
  }

  /**
   * Preload multiple images with priority
   */
  async preloadImages(
    urls: string[], 
    options: ImageCacheOptions = {}
  ): Promise<void> {
    const { priority = 'medium' } = options;
    
    // Sort by priority
    const sortedUrls = [...urls];
    
    if (priority === 'high') {
      // Load immediately, all at once
      await Promise.all(urls.map(url => this.preloadImage(url, options)));
    } else if (priority === 'medium') {
      // Load in chunks of 3
      for (let i = 0; i < sortedUrls.length; i += 3) {
        const chunk = sortedUrls.slice(i, i + 3);
        await Promise.all(chunk.map(url => this.preloadImage(url, options)));
      }
    } else {
      // Load one by one with delay
      for (const url of sortedUrls) {
        await this.preloadImage(url, options);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Clear image cache
   */
  clearImageCache(): void {
    // Clear only image cache items
    const stats = cacheManager.getStats();
    console.log('Clearing image cache. Current stats:', stats);
    
    // We'll need to be selective about what we clear
    cacheManager.clear('memory');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = cacheManager.getStats();
    const memoryUsage = this.estimateMemoryUsage();
    
    return {
      ...stats,
      memoryUsage: this.formatBytes(memoryUsage),
      preloadQueue: this.preloadQueue.size
    };
  }

  /**
   * Convert blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    // This is a rough estimate
    return this.preloadQueue.size * 1024 * 1024; // Assume 1MB per image average
  }

  /**
   * Format bytes for display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create singleton instance
export const imageCacheManager = new ImageCacheManager();

// Helper function to generate cache key for images
function getCacheKey(key: string): string {
  return `cache_${key}`;
}

// React hook for image caching
export function useImageCache() {
  const preloadImage = (url: string, options?: ImageCacheOptions) => {
    return imageCacheManager.preloadImage(url, options);
  };

  const getCachedImageUrl = (url: string) => {
    return imageCacheManager.getCachedImageUrl(url) || url;
  };

  const preloadImages = (urls: string[], options?: ImageCacheOptions) => {
    return imageCacheManager.preloadImages(urls, options);
  };

  return {
    preloadImage,
    getCachedImageUrl,
    preloadImages,
    clearCache: () => imageCacheManager.clearImageCache(),
    getStats: () => imageCacheManager.getCacheStats()
  };
}