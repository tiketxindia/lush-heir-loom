import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useImageCache } from "@/lib/imageCache";
import { useEffect, useState } from "react";
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cacheManager, CACHE_KEYS, CACHE_DURATIONS } from "@/lib/cache";
import { useCacheInvalidation } from "@/lib/realtimeCache";

interface CarouselImage {
  id: number;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string;
  image_path: string;
  mobile_image_url: string;
  mobile_image_path: string;
  order_index: number;
  is_active: boolean;
  // Overlay configuration
  overlay_enabled?: boolean;
  overlay_type?: 'none' | 'solid' | 'gradient-lr' | 'gradient-tb' | 'gradient-radial';
  overlay_color?: string;
  overlay_opacity?: number;
  overlay_gradient_start?: number;
  overlay_gradient_end?: number;
  created_at: string;
  updated_at: string;
}

interface ProductDisplaySection {
  id: number;
  section_title: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface ProductDisplayItem {
  id: number;
  section_id: number;
  title: string;
  image_url: string;
  image_path: string;
  button_text: string;
  button_link: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to generate overlay JSX element based on admin configuration
const generateOverlayStyle = (image: CarouselImage): JSX.Element | null => {
  if (!image.overlay_enabled || image.overlay_type === 'none') {
    return null;
  }

  const color = image.overlay_color || '#000000';
  const opacity = image.overlay_opacity || 50;
  const startOpacity = image.overlay_gradient_start || 60;
  const endOpacity = image.overlay_gradient_end || 30;

  // Convert opacity percentage to hex
  const toHex = (percent: number) => Math.round(percent * 2.55).toString(16).padStart(2, '0');

  let backgroundStyle: string;

  switch (image.overlay_type) {
    case 'solid':
      backgroundStyle = `${color}${toHex(opacity)}`;
      break;
    case 'gradient-lr':
      backgroundStyle = `linear-gradient(to right, ${color}${toHex(startOpacity)}, ${color}${toHex(endOpacity)})`;
      break;
    case 'gradient-tb':
      backgroundStyle = `linear-gradient(to bottom, ${color}${toHex(startOpacity)}, ${color}${toHex(endOpacity)})`;
      break;
    case 'gradient-radial':
      backgroundStyle = `radial-gradient(circle, ${color}${toHex(startOpacity)}, ${color}${toHex(endOpacity)})`;
      break;
    default:
      // Default fallback to original gradient
      backgroundStyle = 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3))';
  }

  return (
    <div 
      className="absolute inset-0" 
      style={{ background: backgroundStyle }}
    />
  );
};

function Home() {
  const { preloadImages, getCachedImageUrl } = useImageCache();
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productSections, setProductSections] = useState<ProductDisplaySection[]>([]);
  const [productItems, setProductItems] = useState<ProductDisplayItem[]>([]);

  // Set up cache invalidation for carousel images
  useCacheInvalidation(CACHE_KEYS.CAROUSEL_IMAGES, () => {
    fetchCarouselImages();
  });

  // Set up cache invalidation for product display data
  useCacheInvalidation('product_display_sections', () => {
    fetchProductDisplayData();
  });

  useCacheInvalidation('product_display_items', () => {
    fetchProductDisplayData();
  });

  // Define hero images for preloading (will be replaced by admin data)
  const heroImages = [
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1920&q=80",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80", 
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80",
    "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1920&q=80"
  ];

  // Preload hero images on component mount
  useEffect(() => {
    fetchCarouselImages();
    fetchProductDisplayData();
  }, []);

  // Fetch carousel images from admin panel
  const fetchCarouselImages = async () => {
    try {
      // Check cache first
      const cacheKey = CACHE_KEYS.CAROUSEL_IMAGES;
      const cachedData = cacheManager.get<CarouselImage[]>(cacheKey);
      
      if (cachedData) {
        setCarouselImages(cachedData);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) {
        // Fallback to empty array if error
        setCarouselImages([]);
      } else {
        const images = data || [];
        setCarouselImages(images);
        
        // Cache the data
        cacheManager.set(cacheKey, images, {
          ttl: CACHE_DURATIONS.MEDIUM,
          storage: 'localStorage'
        });
      }
    } catch (error) {
      setCarouselImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch product display data from admin panel
  const fetchProductDisplayData = async () => {
    try {
      // Check cache first
      const sectionsCacheKey = 'product_display_sections';
      const itemsCacheKey = 'product_display_items';
      
      const cachedSections = cacheManager.get<ProductDisplaySection[]>(sectionsCacheKey);
      const cachedItems = cacheManager.get<ProductDisplayItem[]>(itemsCacheKey);
      
      if (cachedSections && cachedItems) {
        setProductSections(cachedSections);
        setProductItems(cachedItems);
        return;
      }
      
      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('product_display_sections')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      // Fetch items
      const { data: itemsData, error: itemsError } = await supabase
        .from('product_display_items')
        .select('*')
        .eq('is_active', true)
        .order('section_id, order_index');

      if (sectionsError) {
        setProductSections([]);
      } else {
        const sections = sectionsData || [];
        setProductSections(sections);
        
        // Cache the data
        cacheManager.set(sectionsCacheKey, sections, {
          ttl: CACHE_DURATIONS.MEDIUM,
          storage: 'localStorage'
        });
      }

      if (itemsError) {
        setProductItems([]);
      } else {
        const items = itemsData || [];
        setProductItems(items);
        
        // Cache the data
        cacheManager.set(itemsCacheKey, items, {
          ttl: CACHE_DURATIONS.MEDIUM,
          storage: 'localStorage'
        });
      }
    } catch (error) {
      setProductSections([]);
      setProductItems([]);
    }
  };

  // Helper function to get items for a specific section
  const getItemsForSection = (sectionId: number) => {
    return productItems.filter(item => item.section_id === sectionId);
  };

  // Preload images once carousel data is loaded
  useEffect(() => {
    if (carouselImages.length > 0) {
      const imagesToPreload: string[] = [];
      
      carouselImages.forEach(img => {
        // Add desktop image
        imagesToPreload.push(img.image_url);
        
        // Add mobile image if it exists and is different
        if (img.mobile_image_url && img.mobile_image_url !== img.image_url) {
          imagesToPreload.push(img.mobile_image_url);
        }
      });

      preloadImages(imagesToPreload, {
        format: 'blob',
        maxSize: 2 * 1024 * 1024 // 2MB max per image
      });
    }
  }, [carouselImages, preloadImages]);

  // Preload product display images once data is loaded
  useEffect(() => {
    if (productItems.length > 0) {
      const imagesToPreload: string[] = [];
      
      productItems.forEach(item => {
        if (item.image_url) {
          imagesToPreload.push(item.image_url);
        }
      });

      if (imagesToPreload.length > 0) {
        preloadImages(imagesToPreload, {
          format: 'blob',
          maxSize: 2 * 1024 * 1024 // 2MB max per image
        });
      }
    }
  }, [productItems, preloadImages]);

  // Carousel auto-play and progress animation
  useEffect(() => {
    if (!isPlaying || carouselImages.length === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next slide and reset progress
          setCurrentSlideIndex((current) => 
            current >= carouselImages.length - 1 ? 0 : current + 1
          );
          return 0;
        }
        return prev + (100 / (5 * 60)); // 5 seconds per slide, 60fps
      });
    }, 1000 / 60); // 60fps

    return () => clearInterval(interval);
  }, [isPlaying, carouselImages.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((current) => 
      current <= 0 ? carouselImages.length - 1 : current - 1
    );
    setProgress(0); // Reset progress
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((current) => 
      current >= carouselImages.length - 1 ? 0 : current + 1
    );
    setProgress(0); // Reset progress
  };

  // Get current carousel image
  const currentImage = carouselImages[currentSlideIndex];

  // Handle loading state and fallback

  // Mock product data
  const featuredProducts = [
    {
      id: "1",
      name: "Family Memory Album",
      category: "Handcrafted Album",
      price: 2499,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
      tag: "New",
    },
    {
      id: "2",
      name: "Personalized Family Tree",
      category: "Wall Art",
      price: 3999,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
    },
    {
      id: "3",
      name: "Heritage Memory Box",
      category: "Storage",
      price: 1899,
      image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80",
      tag: "Sale",
    },
    {
      id: "4",
      name: "Custom Photo Frame",
      category: "Home Decor",
      price: 1299,
      image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
    },
    {
      id: "5",
      name: "Emotional Journey Journal",
      category: "Journal",
      price: 899,
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
    },
    {
      id: "6",
      name: "Family Recipe Book",
      category: "Handcrafted Book",
      price: 1599,
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      tag: "Popular",
    },
    {
      id: "7",
      name: "Memory Keepsake Locket",
      category: "Jewelry",
      price: 2199,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    },
    {
      id: "8",
      name: "Vintage Photo Display",
      category: "Wall Art",
      price: 3299,
      image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Empty bar spacing after header */}
      <div className="h-14 bg-gray-100"></div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[350px] xs:h-[380px] sm:h-[420px] md:h-[480px] lg:h-[550px] xl:h-[600px] 2xl:h-[700px] bg-muted overflow-hidden">
          {loading ? (
            // Loading state
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-500">Loading carousel...</div>
            </div>
          ) : currentImage ? (
            // Dynamic carousel image
            <>
              {/* Desktop Image (16:5 aspect ratio) */}
              <img
                src={getCachedImageUrl(currentImage.image_url) || currentImage.image_url}
                alt={currentImage.title}
                className="absolute inset-0 h-full w-full object-cover object-center hidden md:block"
              />
              {/* Mobile Image (4:3 aspect ratio) */}
              <img
                src={getCachedImageUrl(currentImage.mobile_image_url) || currentImage.mobile_image_url || getCachedImageUrl(currentImage.image_url) || currentImage.image_url}
                alt={currentImage.title}
                className="absolute inset-0 h-full w-full object-cover object-center block md:hidden"
              />
              {generateOverlayStyle(currentImage)}
              <div className="relative container h-full flex flex-col justify-end items-center text-center px-4 text-white pb-16 md:pb-20 lg:pb-24">
                {/* Only show title and subtitle if they exist */}
                {(currentImage.title.trim() || currentImage.subtitle.trim()) && (
                  <>
                    {currentImage.title.trim() && (
                      <h1 className="text-1xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-black mb-4 max-w-4xl leading-[0.9] tracking-tight" style={{ fontFamily: "'Futura Condensed Extra Black', 'Futura', 'Arial Black', sans-serif" }}>
                        {currentImage.title}
                      </h1>
                    )}
                    {currentImage.subtitle.trim() && (
                      <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-6 md:mb-8 max-w-2xl leading-relaxed font-normal">
                        {currentImage.subtitle}
                      </p>
                    )}
                  </>
                )}
                
                {/* Only show button if button text and link exist */}
                {currentImage.button_text.trim() && currentImage.button_link.trim() && (
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-white/90 px-6 md:px-8 py-3 text-sm md:text-base font-semibold rounded-full"
                    onClick={() => window.location.href = currentImage.button_link}
                  >
                    {currentImage.button_text}
                  </Button>
                )}
              </div>
            </>
          ) : (
            // Fallback when no carousel images
            <>
              <img
                src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1920&q=80"
                alt="Family Memories"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
              <div className="relative container h-full flex flex-col justify-center items-start px-4 text-white">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 max-w-2xl leading-tight">
                  CRAFTED WITH LOVE
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-xl">
                  Preserve your precious family memories with our handcrafted heirlooms that tell your unique story.
                </p>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Shop Now
                </Button>
              </div>
            </>
          )}
          
          {/* Carousel Dots - Center Bottom */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-1.5">
            {carouselImages.map((_, index) => (
              <button 
                key={index}
                onClick={() => {
                  setCurrentSlideIndex(index);
                  setProgress(0);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlideIndex ? 'bg-white' : 'bg-white/50'
                }`} 
              />
            ))}
          </div>

          {/* Carousel Navigation Controls - Bottom Right */}
          <div className="absolute bottom-8 right-8 flex space-x-2">
            {/* Pause/Play Button with Progress Circle */}
            <button 
              onClick={handlePlayPause}
              className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              {/* Progress Circle */}
              <svg className="absolute inset-0 w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                {/* Background circle */}
                <circle
                  cx="20"
                  cy="20"
                  r="17"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                />
                {/* Progress circle */}
                <circle
                  cx="20"
                  cy="20"
                  r="17"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 17}`}
                  strokeDashoffset={`${2 * Math.PI * 17 * (1 - progress / 100)}`}
                  style={{
                    transition: isPlaying ? 'none' : 'stroke-dashoffset 0.3s ease'
                  }}
                />
              </svg>
              {/* Icon */}
              {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
            </button>
            
            {/* Left Navigation */}
            <button 
              onClick={handlePrevSlide}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-black hover:bg-white/30 transition-colors"
            >
              <ChevronLeft size={16} strokeWidth={3} />
            </button>
            
            {/* Right Navigation */}
            <button 
              onClick={handleNextSlide}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-black hover:bg-white/30 transition-colors"
            >
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        </section>

        {/* Dynamic Product Display Sections */}
        {productSections.map((section) => {
          const sectionItems = getItemsForSection(section.id);
          
          if (sectionItems.length === 0) return null;
          
          return (
            <section key={section.id} className="py-12">
              <div className="max-w-full mx-auto">
                <h2 className="text-xl md:text-2xl font-normal mb-8 text-left px-6 md:px-8 lg:px-12" style={{ fontFamily: "'SF Pro Display Bold', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif" }}>
                  {section.section_title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 px-6 md:px-8 lg:px-12">
                  {sectionItems.map((item) => (
                    <div key={item.id} className="relative group cursor-pointer">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        <img
                          src={getCachedImageUrl(item.image_url) || item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute bottom-6 left-6">
                        <Button 
                          size="lg" 
                          className="bg-white text-black hover:bg-gray-100 px-6 py-3 text-sm font-semibold rounded-full shadow-md"
                          onClick={() => window.location.href = item.button_link}
                        >
                          {item.button_text}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* Featured Products */}
        <section className="container px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Collection</h2>
              <p className="text-muted-foreground">Handcrafted pieces to treasure forever</p>
            </div>
            <Button variant="ghost">View All</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>

        {/* Category Highlights */}
        <section className="bg-muted py-16">
          <div className="container px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative h-80 rounded-lg overflow-hidden group cursor-pointer">
                <img
                  src={getCachedImageUrl("https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80") || "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80"}
                  alt="Family"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-3xl font-bold">Family</h3>
                </div>
              </div>
              <div className="relative h-80 rounded-lg overflow-hidden group cursor-pointer">
                <img
                  src={getCachedImageUrl("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80") || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80"}
                  alt="Memories"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-3xl font-bold">Memories</h3>
                </div>
              </div>
              <div className="relative h-80 rounded-lg overflow-hidden group cursor-pointer">
                <img
                  src={getCachedImageUrl("https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80") || "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80"}
                  alt="Emotions"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-3xl font-bold">Emotions</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Banner Section */}
        <section className="relative h-96 overflow-hidden">
          <img
            src={getCachedImageUrl("https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1920&q=80") || "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1920&q=80"}
            alt="Custom Heirlooms"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Create Your Own Heirloom</h2>
              <p className="text-lg mb-6">Personalize every detail to make it uniquely yours</p>
              <Button size="lg" variant="secondary">
                Start Customizing
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
