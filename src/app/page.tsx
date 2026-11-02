import { Footer } from "@/components/Footer";
import { AboutSection } from "@/sections/AboutSection";
import { CinematicHero } from "@/sections/CinematicHero";
import { ContactSection } from "@/sections/ContactSection";
import { InstagramSection } from "@/sections/InstagramSection";
import { Philosophy } from "@/sections/Philosophy";
import { PhotographyGallery } from "@/sections/PhotographyGallery";
import { SelectedWork } from "@/sections/SelectedWork";
import { ServicesSection } from "@/sections/ServicesSection";
import { Statement } from "@/sections/Statement";
import { ThreeGallery } from "@/sections/ThreeGallery";
import { VideoShowcase } from "@/sections/VideoShowcase";
import { site } from "@/data/site";
import { social } from "@/data/social";

const schema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Chinmoy Clickings",
  url: site.url,
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
        <Statement />
        <SelectedWork />
        <PhotographyGallery />
        <Philosophy />
        <VideoShowcase />
        <ThreeGallery />
        <AboutSection />
        <ServicesSection />
        <InstagramSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
