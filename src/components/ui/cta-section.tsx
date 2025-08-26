import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Shield, Heart } from "lucide-react";
import communityFunds from "@/assets/community-funds.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const CTASection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 to-success/5">
      <div className="container mx-auto px-4">
        {/* Main CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Join India's Largest
            <br />
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              SHG Network Today
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Connect with thousands of Self-Help Groups across India. Share resources, 
            collaborate on projects, and build stronger communities together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-hero hover:shadow-glow transition-all duration-300 text-lg px-8 py-4 group"
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
            >
              {user ? 'Go to Dashboard' : 'Start Connecting Now'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth text-lg px-8 py-4"
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
            >
              {user ? 'Find SHGs' : 'Learn More'}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            ✅ Free to join • ✅ Secure platform • ✅ 24/7 support in हिंदी & English
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-card border-border/50 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Connection</h3>
              <p className="text-muted-foreground">
                Find and connect with nearby SHGs in minutes using our smart discovery system
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-trust/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-trust" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure & Trusted</h3>
              <p className="text-muted-foreground">
                Bank-level security with verified profiles and encrypted communications
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border/50 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community Impact</h3>
              <p className="text-muted-foreground">
                Join a movement that has already empowered 50,000+ rural women
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Visual Element */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold">
              Ready to Transform Your Community?
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join thousands of SHG leaders who are already using our platform to:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Access New Funding Opportunities</div>
                  <div className="text-sm text-muted-foreground">Connect with donors and partner organizations</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Share Knowledge & Resources</div>
                  <div className="text-sm text-muted-foreground">Learn from successful groups across India</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-trust rounded-full mt-2"></div>
                <div>
                  <div className="font-medium">Build Stronger Networks</div>
                  <div className="text-sm text-muted-foreground">Collaborate on large-scale community projects</div>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground italic">
                "This platform has revolutionized how we work together as SHGs" - Priya Sharma, UP
              </p>
            </div>
          </div>
          <div>
            <img 
              src={communityFunds} 
              alt="Community funds sharing"
              className="rounded-lg shadow-card w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;