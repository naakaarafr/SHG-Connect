import { MapPin, Mail, Phone, Heart } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    "About SHG Connect",
    "How It Works", 
    "Success Stories",
    "Support Center"
  ];

  const legalLinks = [
    "Privacy Policy",
    "Terms of Service", 
    "Data Protection",
    "Community Guidelines"
  ];

  const supportLinks = [
    "Help Center",
    "Contact Us",
    "Technical Support",
    "Report Issue"
  ];

  return (
    <footer className="bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SHG</span>
              </div>
              <div className="font-bold text-xl text-white">
                Connect India
              </div>
            </div>
            <p className="text-secondary-foreground/80 leading-relaxed">
              Empowering Self-Help Groups across rural India through digital connectivity, 
              secure communication, and collaborative fund sharing.
            </p>
            <div className="flex items-center gap-2 text-secondary-foreground/80">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Serving villages across 25+ states</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-secondary-foreground/80 hover:text-white transition-smooth text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-secondary-foreground/80 hover:text-white transition-smooth text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-secondary-foreground/80">
                <Mail className="h-4 w-4" />
                <span className="text-sm">help@shgconnect.in</span>
              </div>
              <div className="flex items-center gap-2 text-secondary-foreground/80">
                <Phone className="h-4 w-4" />
                <span className="text-sm">1800-SHG-HELP</span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-secondary-foreground/80 hover:text-white transition-smooth text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <p className="text-xs text-secondary-foreground/60">
                Compliant with Indian Data Protection Laws (DPDP Act 2023)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary-foreground/20 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-secondary-foreground/80">
              © 2024 SHG Connect India. Made with <Heart className="h-4 w-4 inline text-red-400" /> for rural empowerment.
            </div>
            <div className="flex items-center gap-6 text-sm text-secondary-foreground/80">
              <span>🇮🇳 Proudly Indian</span>
              <span>Available in हिंदी & English</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;