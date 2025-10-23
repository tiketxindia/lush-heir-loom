import { invalidateAdminChanges } from '@/lib/realtimeCache';

/**
 * Admin Panel Integration Helper
 * Use these functions in admin components to ensure immediate cache invalidation
 */

export class AdminCacheManager {
  /**
   * Invalidate cache after menu item changes
   */
  static async invalidateMenuItems() {
    await invalidateAdminChanges('menu_items');
    console.log('✅ Menu items cache invalidated - changes will appear immediately on website');
  }

  /**
   * Invalidate cache after header settings changes
   */
  static async invalidateHeaderSettings() {
    await invalidateAdminChanges('header_settings');
    console.log('✅ Header settings cache invalidated - changes will appear immediately on website');
  }

  /**
   * Invalidate cache after carousel image changes
   */
  static async invalidateCarouselImages() {
    await invalidateAdminChanges('carousel_images');
    console.log('✅ Carousel images cache invalidated - changes will appear immediately on website');
  }

  /**
   * Invalidate cache after help settings changes
   */
  static async invalidateHelpSettings() {
    await invalidateAdminChanges('help_settings');
    console.log('✅ Help settings cache invalidated - changes will appear immediately on website');
  }

  /**
   * Invalidate cache after help items changes
   */
  static async invalidateHelpItems() {
    await invalidateAdminChanges('help_items');
    console.log('✅ Help items cache invalidated - changes will appear immediately on website');
  }

  /**
   * Show success message with cache invalidation info
   */
  static showCacheInvalidatedMessage(itemType: string) {
    return `${itemType} updated successfully! Changes are now live on the website.`;
  }

  /**
   * Wrapper for database operations with automatic cache invalidation
   */
  static async withCacheInvalidation<T>(
    operation: () => Promise<T>,
    tableName: string,
    successMessage?: string
  ): Promise<T> {
    try {
      const result = await operation();
      await invalidateAdminChanges(tableName);
      
      if (successMessage) {
        console.log(`✅ ${successMessage} - Cache invalidated, changes are live!`);
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to update ${tableName}:`, error);
      throw error;
    }
  }
}

/**
 * Hook for admin components to use cache invalidation
 */
export function useAdminCacheInvalidation() {
  return {
    invalidateMenuItems: AdminCacheManager.invalidateMenuItems,
    invalidateHeaderSettings: AdminCacheManager.invalidateHeaderSettings,
    invalidateCarouselImages: AdminCacheManager.invalidateCarouselImages,
    invalidateHelpSettings: AdminCacheManager.invalidateHelpSettings,
    invalidateHelpItems: AdminCacheManager.invalidateHelpItems,
    withCacheInvalidation: AdminCacheManager.withCacheInvalidation,
    showSuccess: AdminCacheManager.showCacheInvalidatedMessage
  };
}