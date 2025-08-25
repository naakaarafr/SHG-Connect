import { Card, CardContent } from "@/components/ui/card";
import { MapPin, MessageCircle, IndianRupee, Users, Shield, Globe } from "lucide-react";
import digitalVillage from "@/assets/digital-village-connect.jpg";
import communityFunds from "@/assets/community-funds.jpg";

const FeaturesSection = () => {
  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Nearby SHG Discovery",
      description: "Find and connect with Self-Help Groups in your area using smart location-based search",
      color: "text-primary"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Secure Communication",
      description: "Real-time messaging with end-to-end encryption for safe group discussions",
      color: "text-trust"
    },
    {
      icon: <IndianRupee className="h-8 w-8" />,
      title: "Fund Sharing",
      description: "Secure platform for sharing resources and funds between trusted SHG communities",
      color: "text-success"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Building",
      description: "Build stronger networks and collaborate on projects across multiple villages",
      color: "text-primary"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Trust & Security",
      description: "Verified profiles and secure transactions with complete data protection",
      color: "text-trust"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Multi-language Support",
      description: "Available in Hindi and English to serve diverse communities across India",
      color: "text-success"
    }
  ];

  return (
    <section className="py-24 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Empowering Rural Communities
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the features that make SHG Connect India the trusted platform for rural collaboration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-card hover:shadow-glow transition-all duration-300 border-border/50">
              <CardContent className="p-8 text-center">
                <div className={`${feature.color} mb-4 flex justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Visual showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src={digitalVillage} 
              alt="Digital village connectivity"
              className="rounded-lg shadow-card w-full h-auto"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold">
              Bridging the Digital Divide
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our platform is designed specifically for rural India, with offline capabilities, 
              low bandwidth optimization, and intuitive interfaces that work seamlessly even 
              with basic smartphones.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Mobile-first responsive design</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Works on 2G/3G networks</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-trust rounded-full"></div>
                <span>Offline mode for basic functions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;