import { Search, Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">LushHeriLoom</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/new-featured" className="text-sm font-medium hover:text-primary transition-colors">
            New & Featured
          </Link>
          <Link to="/family" className="text-sm font-medium hover:text-primary transition-colors">
            Family
          </Link>
          <Link to="/memories" className="text-sm font-medium hover:text-primary transition-colors">
            Memories
          </Link>
          <Link to="/emotions" className="text-sm font-medium hover:text-primary transition-colors">
            Emotions
          </Link>
          <Link to="/customize" className="text-sm font-medium hover:text-primary transition-colors">
            Customize
          </Link>
          <Link to="/sale" className="text-sm font-medium hover:text-primary transition-colors">
            Sale
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search"
              className="w-64 pl-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          {/* Icons */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5 lg:hidden" />
          </Button>
          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <ShoppingBag className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
