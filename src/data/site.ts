export const site = {
  name: "CHINMOY CLICKINGS",
  title: "CHINMOY CLICKINGS — Photography & Cinematography",
  description: "Cinematic photography and videography portfolio by Chinmoy Clickings.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? "https://starlit-arithmetic-38f269.netlify.app",
  ogImage: "/media/og.jpg",
  descriptor: "Photography / Cinematography / Visual Stories",
  roles: "Photographer and Cinematographer",
  heroWord: "CHINMOY",
  heroAlt: "Chinmoy in a dark suit, adjusting the blazer, lit by a red rim light.",
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
      alt: "Black and white portrait of Chinmoy in a dark suit, buttoning the blazer in a corridor.",
      width: 854,
      height: 1280,
    },
  },
  // REPLACE: use a real ungraded frame and its final grade. The raw file is currently simulated.
  rawReal: {
    caption: "Every frame starts flat. The feeling arrives in the grade. Drag to see the difference.",
    raw: { src: "/media/raw-real/raw.jpg", alt: "The same frame, flat and ungraded.", width: 2000, height: 1125 },
    graded: { src: "/media/raw-real/graded.jpg", alt: "A lone figure on layered hills at sunset, fully graded in warm amber.", width: 2000, height: 1125 },
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
  { label: "About", href: "/#about", id: "about" },
  { label: "Process", href: "/#process", id: "process" },
  { label: "Contact", href: "/#contact", id: "contact" },
];
