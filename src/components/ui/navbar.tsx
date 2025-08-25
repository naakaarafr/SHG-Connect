import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, MessageCircle, Users, IndianRupee } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Discover SHGs", href: "#discover", icon: <MapPin className="h-4 w-4" /> },
    { name: "Chat", href: "#chat", icon: <MessageCircle className="h-4 w-4" /> },
    { name: "Community", href: "#community", icon: <Users className="h-4 w-4" /> },
    { name: "Funds", href: "#funds", icon: <IndianRupee className="h-4 w-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SHG</span>
            </div>
            <div className="font-bold text-xl">
              <span className="text-primary">Connect</span> India
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth"
              >
                {item.icon}
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              Sign In
            </Button>
            <Button className="bg-gradient-hero hover:shadow-glow transition-all duration-300">
              Join Network
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-lg transition-smooth"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-border/50">
                <Button variant="ghost" className="justify-start text-muted-foreground hover:text-primary">
                  Sign In
                </Button>
                <Button className="bg-gradient-hero hover:shadow-glow transition-all duration-300">
                  Join Network
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;