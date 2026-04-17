import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Navbar } from "@/components/layout/navbar";
import { getSiteUrl } from "@/lib/site";
import { Providers } from "./providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "PortiBoard | Developer Activity Dashboard",
    template: "%s | PortiBoard",
  },
  description:
    "A production-grade portfolio dashboard built with Next.js App Router, showing real GitHub activity, projects, and MDX writing.",
  openGraph: {
    title: "PortiBoard",
    description:
      "Track contributions, language trends, repo activity, and writing in one developer dashboard.",
    siteName: "PortiBoard",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortiBoard",
    description: "A personal developer activity dashboard powered by Next.js.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable} scroll-smooth antialiased`}
    >
      <body className="bg-background text-foreground">
        <Providers>
          <div className="relative flex min-h-dvh flex-col overflow-x-clip">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
