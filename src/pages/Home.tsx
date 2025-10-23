import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Home = () => {
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] bg-muted overflow-hidden">
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
          
          {/* Carousel Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
            <button className="w-3 h-3 rounded-full bg-white" />
            <button className="w-3 h-3 rounded-full bg-white/50" />
            <button className="w-3 h-3 rounded-full bg-white/50" />
          </div>
        </section>

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
                  src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80"
                  alt="Family"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-3xl font-bold">Family</h3>
                </div>
              </div>
              <div className="relative h-80 rounded-lg overflow-hidden group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80"
                  alt="Memories"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-3xl font-bold">Memories</h3>
                </div>
              </div>
              <div className="relative h-80 rounded-lg overflow-hidden group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80"
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
            src="https://images.unsplash.com/photo-1452457436726-c90d5a4b1c8b?w=1920&q=80"
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
