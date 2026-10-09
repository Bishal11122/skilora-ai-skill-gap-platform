import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import CareerPathsSection from '../components/landing/CareerPathsSection';
import CtaSection from '../components/landing/CtaSection';

/**
 * Public Landing Page composing all five required sections in order.
 */
export default function LandingPage() {
  return (
    <div className="w-full">
      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Features (7 cards) */}
      <FeaturesSection />

      {/* Section 3: How It Works (9 steps) */}
      <HowItWorksSection />

      {/* Section 4: Career Paths (5 careers) */}
      <CareerPathsSection />

      {/* Section 5: Final Call to Action */}
      <CtaSection />
    </div>
  );
}
