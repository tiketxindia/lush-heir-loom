import { Search, Heart, ShoppingBag, User, LogOut, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { cacheManager, CACHE_KEYS, CACHE_DURATIONS } from "@/lib/cache";
import { realtimeCacheManager, useCacheInvalidation } from "@/lib/realtimeCache";

interface MenuItem {
  id: number;
  name: string;
  href: string;
  order_index: number;
  is_active: boolean;
}

interface HelpSettings {
  id: number;
  label: string;
  is_active: boolean;
}

interface HelpItem {
  id: number;
  name: string;
  href: string;
  order_index: number;
  is_active: boolean;
  opens_in_new_tab: boolean;
}

const Header = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [helpSettings, setHelpSettings] = useState<HelpSettings | null>(null);
  const [helpItems, setHelpItems] = useState<HelpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSticky, setIsSticky] = useState(true);

  // Set up cache invalidation hooks for real-time updates
  useCacheInvalidation(CACHE_KEYS.MENU_ITEMS, () => {
    console.log('🔄 Menu items cache invalidated, refreshing...');
    fetchMenuItems();
  });

  useCacheInvalidation(CACHE_KEYS.HEADER_SETTINGS, () => {
    console.log('🔄 Header settings cache invalidated, refreshing...');
    fetchHeaderSettings();
  });

  useCacheInvalidation(CACHE_KEYS.HELP_SETTINGS, () => {
    console.log('🔄 Help settings cache invalidated, refreshing...');
    fetchHelpData();
  });

  useCacheInvalidation(CACHE_KEYS.HELP_ITEMS, () => {
    console.log('🔄 Help items cache invalidated, refreshing...');
    fetchHelpData();
  });

  // Set admin mode for cache manager
  useEffect(() => {
    realtimeCacheManager.setAdminMode(isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    fetchMenuItems();
    fetchHeaderSettings();
    fetchHelpData();

    // Setup real-time cache invalidation
    realtimeCacheManager.setupAdminInvalidation();

    return () => {
      // Cleanup is handled by the real-time cache manager
    };
  }, []);

  const fetchMenuItems = async () => {
    try {
      // Check cache first
      const cacheKey = CACHE_KEYS.MENU_ITEMS;
      const cachedData = cacheManager.get<MenuItem[]>(cacheKey);
      
      if (cachedData) {
        console.log('Using cached menu items');
        setMenuItems(cachedData);
        setLoading(false);
        return;
      }

      console.log('Fetching menu items from database');
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching menu items:', error);
        // Fallback to default menu items if database fetch fails
        const defaultMenuItems = [
          { id: 1, name: 'New & Featured', href: '/new-featured', order_index: 1, is_active: true },
          { id: 2, name: 'Family', href: '/family', order_index: 2, is_active: true },
          { id: 3, name: 'Memories', href: '/memories', order_index: 3, is_active: true },
          { id: 4, name: 'Emotions', href: '/emotions', order_index: 4, is_active: true },
          { id: 5, name: 'Customize', href: '/customize', order_index: 5, is_active: true },
          { id: 6, name: 'Sale', href: '/sale', order_index: 6, is_active: true },
        ];
        setMenuItems(defaultMenuItems);
      } else {
        const menuData = data || [];
        setMenuItems(menuData);
        
        // Cache the data
        cacheManager.set(cacheKey, menuData, {
          ttl: CACHE_DURATIONS.MEDIUM,
          storage: 'localStorage'
        });
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Fallback to default menu items
      const defaultMenuItems = [
        { id: 1, name: 'New & Featured', href: '/new-featured', order_index: 1, is_active: true },
        { id: 2, name: 'Family', href: '/family', order_index: 2, is_active: true },
        { id: 3, name: 'Memories', href: '/memories', order_index: 3, is_active: true },
        { id: 4, name: 'Emotions', href: '/emotions', order_index: 4, is_active: true },
        { id: 5, name: 'Customize', href: '/customize', order_index: 5, is_active: true },
        { id: 6, name: 'Sale', href: '/sale', order_index: 6, is_active: true },
      ];
      setMenuItems(defaultMenuItems);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeaderSettings = async () => {
    try {
      // Check cache first
      const cacheKey = CACHE_KEYS.HEADER_SETTINGS;
      const cachedData = cacheManager.get<{ is_sticky: boolean }>(cacheKey);
      
      if (cachedData) {
        console.log('Using cached header settings');
        setIsSticky(cachedData.is_sticky);
        return;
      }

      console.log('Fetching header settings from database');
      const { data, error } = await supabase
        .from('header_settings')
        .select('is_sticky')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching header settings:', error);
        // Default to sticky if can't fetch
        setIsSticky(true);
      } else {
        const sticky = data?.is_sticky ?? true;
        setIsSticky(sticky);
        
        // Cache the data
        cacheManager.set(cacheKey, { is_sticky: sticky }, {
          ttl: CACHE_DURATIONS.MEDIUM,
          storage: 'localStorage'
        });
      }
    } catch (error) {
      console.error('Error fetching header settings:', error);
      setIsSticky(true);
    }
  };

  const fetchHelpData = async () => {
    try {
      // Check cache first for help settings
      const settingsCacheKey = CACHE_KEYS.HELP_SETTINGS;
      const cachedSettings = cacheManager.get<HelpSettings>(settingsCacheKey);
      
      if (!cachedSettings) {
        console.log('Fetching help settings from database');
        const { data: settingsData, error: settingsError } = await supabase
          .from('help_settings')
          .select('*')
          .limit(1)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('Error fetching help settings:', settingsError);
          setHelpSettings({ id: 0, label: 'Help', is_active: true });
        } else if (settingsData) {
          setHelpSettings(settingsData);
          cacheManager.set(settingsCacheKey, settingsData, {
            ttl: CACHE_DURATIONS.MEDIUM,
            storage: 'localStorage'
          });
        } else {
          setHelpSettings({ id: 0, label: 'Help', is_active: true });
        }
      } else {
        console.log('Using cached help settings');
        setHelpSettings(cachedSettings);
      }

      // Check cache first for help items
      const itemsCacheKey = CACHE_KEYS.HELP_ITEMS;
      const cachedItems = cacheManager.get<HelpItem[]>(itemsCacheKey);
      
      if (!cachedItems) {
        console.log('Fetching help items from database');
        const { data: itemsData, error: itemsError } = await supabase
          .from('help_items')
          .select('*')
          .eq('is_active', true)
          .order('order_index');

        if (itemsError) {
          console.error('Error fetching help items:', itemsError);
          setHelpItems([]);
        } else {
          const items = itemsData || [];
          setHelpItems(items);
          cacheManager.set(itemsCacheKey, items, {
            ttl: CACHE_DURATIONS.MEDIUM,
            storage: 'localStorage'
          });
        }
      } else {
        console.log('Using cached help items');
        setHelpItems(cachedItems);
      }
    } catch (error) {
      console.error('Error fetching help data:', error);
      setHelpSettings({ id: 0, label: 'Help', is_active: true });
      setHelpItems([]);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className={`${isSticky ? 'sticky top-0' : ''} z-50 w-full bg-white`}>
      {/* Top Bar - Help | Sign In */}
      <div className="bg-gray-100">
        <div className="max-w-full flex h-9 items-center justify-end px-6">
          <div className="flex items-center space-x-3 text-xs font-medium text-gray-700">
            {/* Help Dropdown */}
            {helpSettings?.is_active && (
              <>
                {helpItems.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-1 hover:text-black transition-colors">
                      <span>{helpSettings.label}</span>
                      <ChevronDown className="h-3 w-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {helpItems.map((item) => (
                        <DropdownMenuItem key={item.id} asChild>
                          {item.opens_in_new_tab ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full"
                            >
                              {item.name}
                            </a>
                          ) : (
                            <Link to={item.href} className="w-full">
                              {item.name}
                            </Link>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span className="hover:text-black transition-colors cursor-pointer">
                    {helpSettings.label}
                  </span>
                )}
                <span className="text-gray-400">|</span>
              </>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-600">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
                {isAdmin && (
                  <>
                    <span className="text-gray-400">|</span>
                    <Link to="/admin" className="hover:text-black transition-colors flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>Admin</span>
                    </Link>
                  </>
                )}
                <span className="text-gray-400">|</span>
                <button 
                  onClick={handleSignOut}
                  className="hover:text-black transition-colors flex items-center space-x-1"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link to="/signin" className="hover:text-black transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - Logo, Menu, Search, Cart */}
      <div className="bg-white">
        <div className="max-w-full flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/Lush.png" 
              alt="Lush Heir Loom" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {loading ? (
              // Loading skeleton
              <div className="flex items-center space-x-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                ))}
              </div>
            ) : (
              // Dynamic menu items from database
              menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="text-base font-medium text-black hover:text-gray-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))
            )}
          </nav>

          {/* Right Section - Search and Cart */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative hidden lg:flex items-center">
              <Search className="absolute left-4 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search"
                className="w-44 h-10 pl-12 pr-4 bg-gray-100 border-0 rounded-full text-sm font-normal placeholder:text-gray-500 focus-visible:ring-0 focus-visible:outline-none"
              />
            </div>

            {/* Icons */}
            <Button variant="ghost" size="sm" className="p-3 h-18 w-18 hover:bg-transparent">
              <Heart className="h-18 w-18 text-black stroke-2" />
            </Button>
            <Button variant="ghost" size="sm" className="p-3 h-18 w-18 hover:bg-transparent pr-6">
              <ShoppingBag className="h-18 w-18 text-black stroke-2" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
