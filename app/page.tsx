import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Hero } from "@/components/marketing/Hero";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";

export default function Home() {
  return (
    <MarketingLayout>
      <Hero />
      <FeatureShowcase />
    </MarketingLayout>
  );
}
