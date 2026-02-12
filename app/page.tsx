import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import {
  HeroEnhanced,
  TrustedByEnhanced,
  ArchitectureShowcase,
  FeatureShowcaseEnhanced,
  CapabilitiesGrid,
  ResourceContracts,
  TestimonialsEnhanced,
  DocumentationFAQ,
  DataTransmission,
  CTAEnhanced,
} from "@/components/marketing";

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
