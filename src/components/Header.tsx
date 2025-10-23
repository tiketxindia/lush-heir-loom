import { Search, Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Top Bar - Help | Sign In */}
      <div className="bg-gray-100">
        <div className="max-w-full flex h-9 items-center justify-end px-6">
          <div className="flex items-center space-x-3 text-xs font-medium text-gray-700">
            <Link to="/help" className="hover:text-black transition-colors">
              Help
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/signin" className="hover:text-black transition-colors">
              Sign In
            </Link>
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
              className="h-6 w-auto object-contain"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/new-featured" className="text-base font-semibold text-black hover:text-gray-600 transition-colors">
              New & Featured
            </Link>
            <Link to="/family" className="text-base font-semibold text-black hover:text-gray-600 transition-colors">
              Family
            </Link>
            <Link to="/memories" className="text-base font-semibold text-black hover:text-gray-600 transition-colors">
              Memories
            </Link>
            <Link to="/emotions" className="text-base font-semibold text-black hover:text-gray-600 transition-colors">
              Emotions
            </Link>
            <Link to="/customize" className="text-base font-semibold text-black hover:text-gray-600 transition-colors">
              Customize
            </Link>
            <Link to="/sale" className="text-base font-semibold text-black hover:text-gray-600 transition-colors">
              Sale
            </Link>
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
            <Button variant="ghost" size="sm" className="hidden lg:flex p-2 h-10 w-10 hover:bg-transparent">
              <Search className="h-6 w-6 text-black" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 h-10 w-10 hover:bg-transparent">
              <Heart className="h-6 w-6 text-black stroke-2" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 h-10 w-10 hover:bg-transparent">
              <ShoppingBag className="h-6 w-6 text-black stroke-2" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
