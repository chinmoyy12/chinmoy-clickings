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
  statement: ["I capture moments", "that deserve to stay."],
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
  // REPLACE: when a true raw and graded pair exists, use it here with the labels "Raw" and "Graded".
  comparison: {
    caption: "Every frame starts somewhere plain. This is my own portrait, as shot and as edited for this site. Drag to see the difference.",
    beforeLabel: "Original",
    afterLabel: "Edited",
    before: { src: "/media/about/portrait.jpg", alt: "The original black and white portrait in a corridor.", width: 854, height: 1280 },
    after: { src: "/media/raw-real/edited.jpg", alt: "The same portrait cut out from the corridor and set against a deep red glow.", width: 854, height: 1280 },
  },
  // Set to true once a real showreel is in /public/media/videos.
  showreelReady: false,
  philosophyLine: "Every frame should make you feel something before you understand it.",
  contact: {
    headline: ["Let's work", "together."],
    line: "Let's make something worth remembering.",
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
