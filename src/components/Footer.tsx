import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <h3 className="font-semibold mb-4">FIND A STORE</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/stores" className="hover:underline">Store Locator</Link></li>
              <li><Link to="/membership" className="hover:underline">Become A Member</Link></li>
              <li><Link to="/signup" className="hover:underline">Sign Up for Email</Link></li>
              <li><Link to="/feedback" className="hover:underline">Send Us Feedback</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="font-semibold mb-4">GET HELP</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/order-status" className="hover:underline">Order Status</Link></li>
              <li><Link to="/delivery" className="hover:underline">Delivery</Link></li>
              <li><Link to="/returns" className="hover:underline">Returns</Link></li>
              <li><Link to="/payment-options" className="hover:underline">Payment Options</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="font-semibold mb-4">ABOUT LUSHHEIRLOOM</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/news" className="hover:underline">News</Link></li>
              <li><Link to="/careers" className="hover:underline">Careers</Link></li>
              <li><Link to="/investors" className="hover:underline">Investors</Link></li>
              <li><Link to="/sustainability" className="hover:underline">Sustainability</Link></li>
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">STAY CONNECTED</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email address"
                className="bg-background text-foreground"
              />
              <Button className="w-full" variant="secondary">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="mb-4 md:mb-0">© 2025 LushHeriLoom, Inc. All Rights Reserved</p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link to="/terms" className="hover:underline">Terms of Use</Link>
              <Link to="/cookie-policy" className="hover:underline">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
