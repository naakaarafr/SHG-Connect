import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sunita Devi",
      role: "SHG Leader, Rajasthan",
      content: "Through SHG Connect, our group raised ₹2 lakhs for our weaving cooperative. We connected with 15 other groups and learned new techniques. Our income increased by 300%!",
      location: "Jaipur District",
      rating: 5
    },
    {
      name: "Meera Kumari", 
      role: "SHG Member, Bihar",
      content: "The platform helped us find groups doing similar work in agriculture. We shared seeds and knowledge, which improved our harvest by 40%. The chat feature made coordination so easy.",
      location: "Patna District", 
      rating: 5
    },
    {
      name: "Kamala Bai",
      role: "SHG Coordinator, Maharashtra",
      content: "We were struggling with funds for our dairy project. SHG Connect helped us find donors and partner groups. Today we supply milk to 5 districts. Technology truly empowers us!",
      location: "Pune District",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-success/10 rounded-full border border-success/20 mb-4">
            <span className="text-success font-medium text-sm">Success Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Empowering Rural Women
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real stories from SHG leaders who transformed their communities through collaboration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-card hover:shadow-glow transition-all duration-300 border-border/50">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Quote className="h-8 w-8 text-primary/30" />
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>

                <div className="space-y-2">
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-primary font-medium">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    📍 {testimonial.location}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-success mb-2">₹100Cr+</div>
              <div className="text-sm text-muted-foreground">Total Impact</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-trust mb-2">50,000+</div>
              <div className="text-sm text-muted-foreground">Women Empowered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-2">5⭐</div>
              <div className="text-sm text-muted-foreground">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;