import { Footer } from "@/components/Footer";
import { site } from "@/data/site";
import { social } from "@/data/social";
import { AboutSection } from "@/sections/AboutSection";
import { AvatarGuide } from "@/components/AvatarGuide";
import { CinematicHero } from "@/sections/CinematicHero";
import { ContactSection } from "@/sections/ContactSection";
import { KineticBand } from "@/sections/KineticBand";
import { PhotoRing } from "@/sections/PhotoRing";
import { PhotographyGallery } from "@/sections/PhotographyGallery";
import { PixelGame } from "@/sections/PixelGame";
import { RawToReal } from "@/sections/RawToReal";
import { Recognition } from "@/sections/Recognition";
import { ServicesSection } from "@/sections/ServicesSection";
import { StoryFrame } from "@/sections/StoryFrame";
import { Timeline } from "@/sections/Timeline";
import { WorkStrip } from "@/sections/WorkStrip";

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
        <WorkStrip />
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
