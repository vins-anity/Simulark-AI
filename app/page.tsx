import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Hero } from "@/components/marketing/Hero";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import { TrustedBy } from "@/components/marketing/TrustedBy";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CTA } from "@/components/marketing/CTA";

export default function Home() {
  return (
    <MarketingLayout>
      <Hero />
      <TrustedBy />
      <FeatureShowcase />
      <Testimonials />
      <CTA />
    </MarketingLayout>
  );
}
