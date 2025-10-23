import { supabase } from './supabase';
import { cacheManager, CACHE_KEYS } from './cache';

/**
 * Real-time Cache Invalidation System
 * Handles immediate cache invalidation when admin makes changes
 */

export interface CacheInvalidationEvent {
  type: 'invalidate' | 'update';
  keys: string[];
  data?: any;
  source: 'admin' | 'user';
  timestamp: number;
}

class RealtimeCacheManager {
  private channels: { [key: string]: any } = {};
  private invalidationCallbacks = new Map<string, Function[]>();
  private isAdmin = false;

  constructor() {
    this.setupGlobalInvalidationChannel();
  }

  /**
   * Set admin mode for aggressive cache invalidation
   */
  setAdminMode(isAdmin: boolean) {
    this.isAdmin = isAdmin;
    console.log(`🔧 Cache mode: ${isAdmin ? 'ADMIN (aggressive invalidation)' : 'USER (performance optimized)'}`);
  }

  /**
   * Setup global cache invalidation channel
   */
  private setupGlobalInvalidationChannel() {
    const channel = supabase
      .channel('cache_invalidation')
      .on('broadcast', { event: 'cache_invalidate' }, (payload) => {
        console.log('🗑️ Received cache invalidation broadcast:', payload);
        this.handleCacheInvalidation(payload.data);
      })
      .subscribe();

    this.channels['global'] = channel;
  }

  /**
   * Broadcast cache invalidation to all clients
   */
  async broadcastInvalidation(keys: string[], data?: any, source: 'admin' | 'user' = 'admin') {
    const event: CacheInvalidationEvent = {
      type: 'invalidate',
      keys,
      data,
      source,
      timestamp: Date.now()
    };

    try {
      await supabase.channel('cache_invalidation').send({
        type: 'broadcast',
        event: 'cache_invalidate',
        data: event
      });
      
      // Also invalidate locally immediately
      this.handleCacheInvalidation(event);
      
      console.log('📡 Broadcasted cache invalidation for keys:', keys);
    } catch (error) {
      console.error('Failed to broadcast cache invalidation:', error);
    }
  }

  /**
   * Handle cache invalidation events
   */
  private handleCacheInvalidation(event: CacheInvalidationEvent) {
    const { keys, type, source, data } = event;

    // Invalidate cache for specified keys
    keys.forEach(key => {
      cacheManager.delete(key);
      console.log(`🗑️ Invalidated cache for key: ${key}`);

      // Trigger callbacks for this key
      const callbacks = this.invalidationCallbacks.get(key) || [];
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in cache invalidation callback for ${key}:`, error);
        }
      });
    });

    // If this is from admin and we're in user mode, be more aggressive
    if (source === 'admin' && !this.isAdmin) {
      console.log('🔄 Admin made changes, forcing refresh');
      
      // Invalidate related cache keys
      this.invalidateRelatedKeys(keys);
    }
  }

  /**
   * Invalidate related cache keys
   */
  private invalidateRelatedKeys(originalKeys: string[]) {
    const relatedKeys: string[] = [];

    originalKeys.forEach(key => {
      switch (key) {
        case CACHE_KEYS.MENU_ITEMS:
          // Menu changes affect header
          relatedKeys.push(CACHE_KEYS.HEADER_SETTINGS);
          break;
        case CACHE_KEYS.CAROUSEL_IMAGES:
          // Carousel changes might affect home page
          relatedKeys.push(CACHE_KEYS.HOME_DATA);
          break;
        case CACHE_KEYS.HELP_SETTINGS:
        case CACHE_KEYS.HELP_ITEMS:
          // Help changes affect header
          relatedKeys.push(CACHE_KEYS.HEADER_SETTINGS);
          break;
      }
    });

    // Invalidate related keys
    relatedKeys.forEach(key => {
      cacheManager.delete(key);
      console.log(`🔗 Invalidated related cache key: ${key}`);
    });
  }

  /**
   * Register callback for cache invalidation
   */
  onCacheInvalidated(key: string, callback: Function) {
    if (!this.invalidationCallbacks.has(key)) {
      this.invalidationCallbacks.set(key, []);
    }
    this.invalidationCallbacks.get(key)?.push(callback);
  }

  /**
   * Unregister callback
   */
  offCacheInvalidated(key: string, callback: Function) {
    const callbacks = this.invalidationCallbacks.get(key) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Setup table-specific real-time invalidation
   */
  setupTableInvalidation(tableName: string, cacheKeys: string[]) {
    if (this.channels[tableName]) {
      return; // Already setup
    }

    const channel = supabase
      .channel(`${tableName}_invalidation`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: tableName
      }, async (payload) => {
        console.log(`📋 Table ${tableName} changed:`, payload.eventType);
        
        // Immediate local cache invalidation
        cacheKeys.forEach(key => {
          cacheManager.delete(key);
        });

        // Broadcast to other clients
        await this.broadcastInvalidation(cacheKeys, payload, 'admin');
      })
      .subscribe();

    this.channels[tableName] = channel;
  }

  /**
   * Force refresh specific data with cache bypass
   */
  async forceRefresh(cacheKey: string, refreshFunction: () => Promise<any>) {
    try {
      // Delete from cache first
      cacheManager.delete(cacheKey);
      
      // Fetch fresh data
      const freshData = await refreshFunction();
      
      // Cache the fresh data with short TTL for immediate use
      cacheManager.set(cacheKey, freshData, {
        ttl: 5 * 60 * 1000, // 5 minutes
        version: Date.now().toString() // Use timestamp as version
      });

      return freshData;
    } catch (error) {
      console.error(`Failed to force refresh for ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Setup smart cache invalidation for admin panel
   */
  setupAdminInvalidation() {
    // Menu items
    this.setupTableInvalidation('menu_items', [CACHE_KEYS.MENU_ITEMS]);
    
    // Header settings
    this.setupTableInvalidation('header_settings', [CACHE_KEYS.HEADER_SETTINGS]);
    
    // Carousel images
    this.setupTableInvalidation('carousel_images', [CACHE_KEYS.CAROUSEL_IMAGES]);
    
    // Help settings and items
    this.setupTableInvalidation('help_settings', [CACHE_KEYS.HELP_SETTINGS]);
    this.setupTableInvalidation('help_items', [CACHE_KEYS.HELP_ITEMS]);

    console.log('🔧 Admin cache invalidation setup complete');
  }

  /**
   * Cleanup all channels
   */
  cleanup() {
    Object.values(this.channels).forEach(channel => {
      if (channel && typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      }
    });
    this.channels = {};
    this.invalidationCallbacks.clear();
  }
}

// Export singleton instance
export const realtimeCacheManager = new RealtimeCacheManager();

/**
 * Hook for components to handle cache invalidation
 */
export function useCacheInvalidation(cacheKey: string, onInvalidated?: () => void) {
  const handleInvalidation = () => {
    console.log(`🔄 Cache invalidated for ${cacheKey}, triggering refresh`);
    if (onInvalidated) {
      onInvalidated();
    }
  };

  // Register callback
  realtimeCacheManager.onCacheInvalidated(cacheKey, handleInvalidation);

  // Cleanup function
  const cleanup = () => {
    realtimeCacheManager.offCacheInvalidated(cacheKey, handleInvalidation);
  };

  return { cleanup };
}

/**
 * Admin panel helper for immediate cache invalidation
 */
export async function invalidateAdminChanges(tableName: string, data?: any) {
  const keyMap: { [key: string]: string[] } = {
    'menu_items': [CACHE_KEYS.MENU_ITEMS],
    'header_settings': [CACHE_KEYS.HEADER_SETTINGS],
    'carousel_images': [CACHE_KEYS.CAROUSEL_IMAGES],
    'help_settings': [CACHE_KEYS.HELP_SETTINGS],
    'help_items': [CACHE_KEYS.HELP_ITEMS]
  };

  const cacheKeys = keyMap[tableName] || [];
  if (cacheKeys.length > 0) {
    await realtimeCacheManager.broadcastInvalidation(cacheKeys, data, 'admin');
  }
}