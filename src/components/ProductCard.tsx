import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  tag?: string;
}

const ProductCard = ({ id, name, category, price, image, tag }: ProductCardProps) => {
  return (
    <div className="group relative">
      <Link to={`/product/${id}`}>
        <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-muted">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {tag && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded">
              {tag}
            </span>
          )}
        </div>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background"
      >
        <Heart className="h-4 w-4" />
      </Button>

      <div className="space-y-1">
        <Link to={`/product/${id}`}>
          <p className="text-sm font-medium text-primary group-hover:underline">{name}</p>
        </Link>
        <p className="text-sm text-muted-foreground">{category}</p>
        <p className="text-sm font-semibold">₹ {price.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
};

export default ProductCard;
