export const site = {
  name: "CHINMOY CLICKINGS",
  title: "CHINMOY CLICKINGS — Photography & Cinematography",
  description: "Cinematic photography and videography portfolio by Chinmoy Clickings.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/media/og.jpg",
  descriptor: "Photography / Cinematography / Visual Stories",
  location: "Guwahati, India",
  year: "2026",
  statement: ["I capture", "moments", "that deserve", "to stay."],
  about: {
    headline: ["I capture", "what feels", "worth remembering."],
    lead: "I photograph and film the moments that are easy to overlook.",
    details: ["The movement.", "The light.", "The people.", "The atmosphere."],
    close: "The little details that turn an ordinary moment into something worth remembering.",
    practice: "My work sits somewhere between photography, cinematography and visual storytelling.",
    roles: ["Photographer", "Videographer", "Visual storyteller"],
    portrait: {
      src: "/media/about/portrait.jpg",
      alt: "A photographer silhouetted against a tall window, camera raised to the eye.",
      width: 1280,
      height: 1600,
    },
  },
  philosophyLine: "Every frame should make you feel something before you understand it.",
  contact: {
    headline: ["Let's make", "something", "worth remembering."],
    availability: ["Photography", "Videography", "Creative Projects", "Events", "Collaborations"],
  },
};

export const navigation = [
  { label: "Work", href: "/#work", id: "work" },
  { label: "Photo", href: "/#photo", id: "photo" },
  { label: "Film", href: "/#film", id: "film" },
  { label: "About", href: "/#about", id: "about" },
  { label: "Contact", href: "/#contact", id: "contact" },
];
