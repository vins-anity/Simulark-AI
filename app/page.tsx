import {
  ArchitectureShowcase,
  CapabilitiesGrid,
  CTAEnhanced,
  DocumentationFAQ,
  FeatureShowcaseEnhanced,
  HeroEnhanced,
  ResourceContracts,
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
      <DocumentationFAQ />
      <CTAEnhanced />
    </MarketingLayout>
  );
}
