import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding - Simulark",
  description: "Configure your Simulark experience",
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-bg-primary">{children}</div>;
}
