interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  version?: string; // Cache version for invalidation
  storage?: 'localStorage' | 'sessionStorage' | 'memory';
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private defaultTTL = 30 * 60 * 1000; // 30 minutes default
  private version = '1.0.0';

  constructor() {
    // Clean up expired cache items on initialization
    this.cleanupExpiredItems();
  }

  /**
   * Set an item in cache
   */
  set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): void {
    const {
      ttl = this.defaultTTL,
      version = this.version,
      storage = 'localStorage'
    } = options;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      version,
      expiresAt: Date.now() + ttl
    };

    try {
      if (storage === 'memory') {
        this.memoryCache.set(key, cacheItem);
      } else {
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
        storageObj.setItem(key, JSON.stringify(cacheItem));
      }
    } catch (error) {
      console.warn('Cache storage failed:', error);
      // Fallback to memory cache
      this.memoryCache.set(key, cacheItem);
    }
  }

  /**
   * Get an item from cache
   */
  get<T>(
    key: string, 
    options: { storage?: 'localStorage' | 'sessionStorage' | 'memory' } = {}
  ): T | null {
    const { storage = 'localStorage' } = options;

    try {
      let cacheItem: CacheItem<T> | null = null;

      if (storage === 'memory') {
        cacheItem = this.memoryCache.get(key) || null;
      } else {
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
        const cached = storageObj.getItem(key);
        if (cached) {
          cacheItem = JSON.parse(cached);
        }
      }

      if (!cacheItem) {
        return null;
      }

      // Check if cache is expired
      if (Date.now() > cacheItem.expiresAt) {
        this.delete(key, { storage });
        return null;
      }

      // Check version compatibility
      if (cacheItem.version !== this.version) {
        this.delete(key, { storage });
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  }

  /**
   * Delete an item from cache
   */
  delete(
    key: string, 
    options: { storage?: 'localStorage' | 'sessionStorage' | 'memory' } = {}
  ): void {
    const { storage = 'localStorage' } = options;

    try {
      if (storage === 'memory') {
        this.memoryCache.delete(key);
      } else {
        const storageObj = storage === 'localStorage' ? localStorage : sessionStorage;
        storageObj.removeItem(key);
      }
    } catch (error) {
      console.warn('Cache deletion failed:', error);
    }
  }

  /**
   * Clear all cache items
   */
  clear(storage: 'localStorage' | 'sessionStorage' | 'memory' | 'all' = 'all'): void {
    try {
      if (storage === 'memory' || storage === 'all') {
        this.memoryCache.clear();
      }
      
      if (storage === 'localStorage' || storage === 'all') {
        // Only clear our cache keys, not all localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      if (storage === 'sessionStorage' || storage === 'all') {
        // Only clear our cache keys, not all sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('cache_')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.warn('Cache clearing failed:', error);
    }
  }

  /**
   * Check if an item exists and is valid in cache
   */
  has(
    key: string, 
    options: { storage?: 'localStorage' | 'sessionStorage' | 'memory' } = {}
  ): boolean {
    return this.get(key, options) !== null;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memorySize = this.memoryCache.size;
    let localStorageSize = 0;
    let sessionStorageSize = 0;

    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorageSize++;
        }
      });

      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          sessionStorageSize++;
        }
      });
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
    }

    return {
      memory: memorySize,
      localStorage: localStorageSize,
      sessionStorage: sessionStorageSize,
      total: memorySize + localStorageSize + sessionStorageSize
    };
  }

  /**
   * Clean up expired items
   */
  private cleanupExpiredItems(): void {
    const now = Date.now();

    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiresAt) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '');
            if (now > item.expiresAt) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove invalid cache items
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup localStorage cache:', error);
    }

    // Clean sessionStorage
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const item = JSON.parse(sessionStorage.getItem(key) || '');
            if (now > item.expiresAt) {
              sessionStorage.removeItem(key);
            }
          } catch {
            // Remove invalid cache items
            sessionStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup sessionStorage cache:', error);
    }
  }

  /**
   * Update cache version (invalidates all cached items)
   */
  updateVersion(newVersion: string): void {
    this.version = newVersion;
    this.clear(); // Clear all caches since version changed
  }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Helper functions for specific cache keys
export const getCacheKey = (prefix: string, id?: string | number) => {
  return `cache_${prefix}${id ? `_${id}` : ''}`;
};

// Cache key constants
export const CACHE_KEYS = {
  CAROUSEL_IMAGES: 'carousel_images',
  HELP_SETTINGS: 'help_settings',
  HELP_ITEMS: 'help_items',
  MENU_ITEMS: 'menu_items',
  HEADER_SETTINGS: 'header_settings',
  HOME_DATA: 'home_data',
  IMAGE_BLOB: (url: string) => `image_blob_${btoa(url).replace(/[/+=]/g, '_')}`,
} as const;

// Cache durations
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 2 * 60 * 60 * 1000,  // 2 hours
  DAY: 24 * 60 * 60 * 1000,  // 24 hours
} as const;