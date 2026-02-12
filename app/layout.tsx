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
    description:
      "Intelligent Backend Architecture Design & Visual Simulation Platform",
    url: "https://simulark-ai.vercel.app",
    siteName: "Simulark",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
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
    description:
      "Intelligent Backend Architecture Design & Visual Simulation Platform",
    images: ["/web-app-manifest-512x512.png"],
  },
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
