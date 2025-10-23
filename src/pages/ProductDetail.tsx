import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, Truck, RotateCcw, Shield } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");

  const productImages = [
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
  ];

  const sizes = ["Small", "Medium", "Large", "Custom"];

  const relatedProducts = [
    {
      id: "r1",
      name: "Vintage Photo Album",
      category: "Album",
      price: 2199,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    },
    {
      id: "r2",
      name: "Memory Keepsake Box",
      category: "Storage",
      price: 1899,
      image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80",
    },
    {
      id: "r3",
      name: "Family Tree Wall Art",
      category: "Wall Decor",
      price: 3499,
      image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
    },
    {
      id: "r4",
      name: "Heritage Journal",
      category: "Journal",
      price: 999,
      image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b">
          <div className="container px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Home / Family / Memory Albums / Handcrafted Family Album
            </p>
          </div>
        </div>

        {/* Product Details */}
        <div className="container px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={productImages[selectedImage]}
                  alt="Product"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-primary font-medium mb-2">Featured Product</p>
                <h1 className="text-3xl font-bold mb-2">Handcrafted Family Memory Album</h1>
                <p className="text-lg text-muted-foreground">Premium Leather Collection</p>
              </div>

              <div className="space-y-2">
                <p className="text-2xl font-bold">₹ 2,499.00</p>
                <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Select Size</h3>
                  <Button variant="link" className="text-sm p-0 h-auto">
                    Size Guide
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className="h-12"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full h-12" size="lg">
                  Add to Cart
                </Button>
                <Button variant="outline" className="w-full h-12" size="lg">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Wishlist
                </Button>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Free shipping on orders above ₹1,999
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Easy Returns</p>
                    <p className="text-sm text-muted-foreground">
                      30-day return policy for all products
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Quality Guaranteed</p>
                    <p className="text-sm text-muted-foreground">
                      Handcrafted with premium materials
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="pt-6 border-t space-y-4">
                <h3 className="font-semibold">Product Details</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our Handcrafted Family Memory Album is meticulously created to preserve your most
                  precious moments. Made from premium leather and featuring acid-free pages, this album
                  is designed to last for generations. Each album is unique, handcrafted by skilled
                  artisans who pour their heart into every detail. Perfect for storing family photos,
                  important documents, and cherished memories.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Premium genuine leather cover</li>
                  <li>• 50 acid-free pages (100 sides)</li>
                  <li>• Holds up to 200 photos</li>
                  <li>• Handcrafted binding</li>
                  <li>• Customization options available</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
