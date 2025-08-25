import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-shg-meeting.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="SHG women meeting in rural village"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center">
        <div className="space-y-8">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-primary font-medium text-sm">🇮🇳 Connecting Rural India</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              SHG Connect India
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Empowering Self-Help Groups across villages to collaborate, share resources, and build stronger communities through digital connectivity
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-hero hover:shadow-glow transition-all duration-300 text-lg px-8 py-4"
            >
              Join SHG Network
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth text-lg px-8 py-4"
            >
              Discover SHGs
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-muted-foreground">Active SHGs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">₹50L+</div>
              <div className="text-muted-foreground">Funds Shared</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-trust">25+</div>
              <div className="text-muted-foreground">States Connected</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;