export const site = {
  name: "CHINMOY CLICKINGS",
  title: "CHINMOY CLICKINGS — Photography & Cinematography",
  description: "Cinematic photography and videography portfolio by Chinmoy Clickings.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? "https://starlit-arithmetic-38f269.netlify.app",
  ogImage: "/media/og.jpg",
  descriptor: "Photography / Cinematography / Visual Stories",
  roles: "Photographer and Cinematographer",
  heroWord: "PORTFOLIO",
  loaderName: "CHINMOY",
  heroAlt: "An illustrated 3D avatar of Chinmoy with dark wavy hair and a short beard, smiling.",
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
    stats: [
      { value: 10, suffix: "+", label: "Client works completed" },
      { value: 10, suffix: "+", label: "Works delivered on Fiverr" },
      { value: 20, suffix: "+", label: "Clients as a freelancer" },
    ],
    portrait: {
      src: "/media/about/portrait.jpg",
      alt: "Black and white portrait of Chinmoy in a dark suit, buttoning the blazer in a corridor.",
      width: 854,
      height: 1280,
    },
  },
  philosophyLine: "Every frame should make you feel something before you understand it.",
  hire: {
    line: "Honest rates, shaped around what your story needs.",
    rates: [
      { service: "Reels", price: "₹1,000", unit: "per reel, on average", note: "Shot, cut and graded for vertical." },
      { service: "Photoshoots", price: "₹1,500–6,000", unit: "per photoshoot", note: "Depends on your requirements." },
      { service: "Videos", price: "₹2,000–7,000", unit: "per video", note: "Depends on the video's requirements." },
    ],
    services: ["Reel", "Photoshoot", "Video", "Something else"],
  },
  contact: {
    headline: ["Let's work", "together."],
    line: "Let's make something worth remembering.",
    availability: ["Photography", "Videography", "Creative Projects", "Events", "Collaborations"],
  },
};

export const navigation = [
  { label: "Story", href: "/#story", id: "story" },
  { label: "Work", href: "/#work", id: "work" },
  { label: "Photo", href: "/#photo", id: "photo" },
  { label: "About", href: "/#about", id: "about" },
  { label: "Hire me", href: "/#hire", id: "hire" },
  { label: "Contact", href: "/#contact", id: "contact" },
];
