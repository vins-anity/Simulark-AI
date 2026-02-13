import type { Metadata } from "next";
import { Geist_Mono, Lora, Poppins } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "@/components/ui/brand-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Simulark -  AI Architecture Engine",
    template: "%s | Simulark",
  },
  description:
    "Simulark is an intelligent platform for Engineing, visualizing, and simulating backend architectures. Transform text into professional cloud diagrams instantly.",
  applicationName: "Simulark",
  authors: [{ name: "Simulark Team" }],
  generator: "Next.js",
  keywords: [
    "Backend Architecture",
    "System Engine",
    "Cloud Architecture",
    "Visual Simulation",
    "AI Architecture Generator",
    "DevOps",
    "Infrastructure as Code",
    "Software Architecture",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Simulark Team",
  publisher: "Simulark",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://simulark-ai.vercel.app",
  },
  metadataBase: new URL("https://simulark-ai.vercel.app"),
  openGraph: {
    title: "Simulark - AI Architecture Engine",
    description:
      "Engine, visualize, and simulate backend architectures with AI. Transform requirements into professional cloud diagrams in seconds.",
    url: "https://simulark-ai.vercel.app",
    siteName: "Simulark",
    images: [
      {
        url: "https://simulark-ai.vercel.app/opengraph-image.png?v=1",
        secureUrl: "https://simulark-ai.vercel.app/opengraph-image.png?v=1",
        width: 1200,
        height: 630,
        alt: "Simulark - AI Architecture Engine",
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulark - AI Architecture Engine",
    description:
      "Engine, visualize, and simulate backend architectures with AI. Transform requirements into professional cloud diagrams in seconds.",
    creator: "@simulark_ai",
    images: ["https://simulark-ai.vercel.app/opengraph-image.png?v=1"],
  },
  manifest: "/site.webmanifest",
};

import { SidebarProvider } from "@/components/layout/SidebarProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${lora.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SidebarProvider>
            <BrandProvider>{children}</BrandProvider>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
