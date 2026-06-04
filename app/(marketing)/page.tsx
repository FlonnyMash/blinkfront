import { BottomCtaSection } from "@/components/marketing/bottom-cta-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { LogoCloudSection } from "@/components/marketing/logo-cloud-section";

export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <LogoCloudSection />
      <FeaturesSection />
      <BottomCtaSection />
    </>
  );
}
