import HeroSection from "@/components/ui/hero-section";
import FeaturesSection from "@/components/ui/features-section";
import TestimonialsSection from "@/components/ui/testimonials-section";
import GovernmentSchemesSection from "@/components/ui/government-schemes-section";
import CTASection from "@/components/ui/cta-section";
import Footer from "@/components/ui/footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <GovernmentSchemesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
