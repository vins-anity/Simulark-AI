import type { Metadata } from "next";
import { Lora, Poppins } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "@/components/ui/brand-provider";
import { Toaster } from "@/components/ui/sonner";

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

export const metadata: Metadata = {
  title: "Simulark",
  description:
    "Intelligent Backend Architecture Design & Visual Simulation Platform",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://simulark-ai.vercel.app"),
  openGraph: {
    title: "Simulark",
    description: "Intelligent Backend Architecture Design & Visual Simulation Platform",
    url: "https://simulark-ai.vercel.app",
    siteName: "Simulark",
    images: [
      {
        url: "/web-app-manifest-512x512.png", // Fallback to largest icon
        width: 512,
        height: 512,
        alt: "Simulark Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulark",
    description: "Intelligent Backend Architecture Design & Visual Simulation Platform",
    images: ["/web-app-manifest-512x512.png"], // Fallback to largest icon
  },
};

import { SidebarProvider } from "@/components/layout/SidebarProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${lora.variable} antialiased bg-[#faf9f5] text-[#141413]`}
        style={
          {
            "--brand-dark": "#141413",
            "--brand-light": "#faf9f5",
            "--brand-gray-mid": "#b0aea5",
            "--brand-gray-light": "#e8e6dc",
            "--brand-orange": "#d97757",
            "--brand-blue": "#6a9bcc",
            "--brand-green": "#788c5d",
          } as React.CSSProperties
        }
      >
        <SidebarProvider>
          <BrandProvider>{children}</BrandProvider>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
