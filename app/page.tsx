import {
  ArchitectureShowcase,
  CapabilitiesGrid,
  CTAEnhanced,
  DataTransmission,
  DocumentationFAQ,
  FeatureShowcaseEnhanced,
  HeroEnhanced,
  ResourceContracts,
  TestimonialsEnhanced,
  TrustedByEnhanced,
} from "@/components/marketing";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

export default function Home() {
  return (
    <MarketingLayout>
      <HeroEnhanced />
      <TrustedByEnhanced />
      <ArchitectureShowcase />
      <FeatureShowcaseEnhanced />
      <CapabilitiesGrid />
      <ResourceContracts />
      <TestimonialsEnhanced />
      <DocumentationFAQ />
      <DataTransmission />
      <CTAEnhanced />
    </MarketingLayout>
  );
}
