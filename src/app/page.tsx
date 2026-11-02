import dynamic from "next/dynamic";
import { Footer } from "@/components/Footer";
import { site } from "@/data/site";
import { social } from "@/data/social";
import { AboutSection } from "@/sections/AboutSection";
import { AvatarGuide } from "@/components/AvatarGuide";
import { CinematicHero } from "@/sections/CinematicHero";
import { KineticBand } from "@/sections/KineticBand";
import { ServicesSection } from "@/sections/ServicesSection";

// Still server rendered; splitting them keeps the first hydration short.
const StoryFrame = dynamic(() => import("@/sections/StoryFrame").then((m) => m.StoryFrame));
const WalletShowcase = dynamic(() => import("@/sections/WalletShowcase").then((m) => m.WalletShowcase));
const Recognition = dynamic(() => import("@/sections/Recognition").then((m) => m.Recognition));
const PhotoRing = dynamic(() => import("@/sections/PhotoRing").then((m) => m.PhotoRing));
const PhotographyGallery = dynamic(() => import("@/sections/PhotographyGallery").then((m) => m.PhotographyGallery));
const RawToReal = dynamic(() => import("@/sections/RawToReal").then((m) => m.RawToReal));
const Timeline = dynamic(() => import("@/sections/Timeline").then((m) => m.Timeline));
const PixelGame = dynamic(() => import("@/sections/PixelGame").then((m) => m.PixelGame));
const ContactSection = dynamic(() => import("@/sections/ContactSection").then((m) => m.ContactSection));

const schema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Chinmoy Clickings",
  url: site.url,
  image: `${site.url}${site.about.portrait.src}`,
  jobTitle: "Photographer and Cinematographer",
  address: { "@type": "PostalAddress", addressLocality: "Guwahati", addressCountry: "IN" },
  sameAs: [social.instagram.url],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main id="main">
        <CinematicHero />
        <AboutSection />
        <ServicesSection />
        <KineticBand />
        <StoryFrame />
        <WalletShowcase />
        <Recognition />
        <PhotoRing />
        <PhotographyGallery />
        <RawToReal />
        <Timeline />
        <PixelGame />
        <ContactSection />
      </main>
      <Footer />
      <AvatarGuide />
    </>
  );
}
