import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { CustomCursor } from "@/components/CustomCursor";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Navigation } from "@/components/Navigation";
import { PageLoader } from "@/components/PageLoader";
import { PageTransition } from "@/components/PageTransition";
import { ServiceWorker } from "@/components/ServiceWorker";
import { SmoothScroll } from "@/components/SmoothScroll";
import { site } from "@/data/site";
import "@/styles/globals.css";

const display = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-instrument", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    url: "/",
    siteName: site.name,
    type: "website",
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.title }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: [site.ogImage] },
};

export const viewport: Viewport = { themeColor: "#080808", colorScheme: "dark" };

// Runs before first paint so animated elements start hidden only when JS can reveal them.
const boot = `document.documentElement.classList.add("js");document.documentElement.dataset.intro="pending";`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <noscript>
          <style>{`#loader{display:none}`}</style>
        </noscript>
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <PageLoader />
        <SmoothScroll />
        <GrainOverlay />
        <CustomCursor />
        <ServiceWorker />
        <PageTransition>
          <Navigation />
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
