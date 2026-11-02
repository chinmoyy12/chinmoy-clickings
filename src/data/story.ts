import { photos } from "./photos";

// The chapters of the scroll story, and what the avatar guide says in each section.

const frame = (id: string) => {
  const match = photos.find((photo) => photo.id === id);
  if (!match) throw new Error(`Unknown photo: ${id}`);
  return match;
};

export const chapters = [
  { word: "See.", line: "It starts with noticing what everyone else walks past.", image: frame("street-01") },
  { word: "Wait.", line: "Then the hard part. Staying until the light agrees.", image: frame("travel-02") },
  { word: "Click.", line: "One small sound. One moment that will never happen again.", image: frame("events-01") },
  { word: "Feel.", line: "The grade brings back what it felt like to be there.", image: frame("editorial-01") },
];

export const storyChoices = ["Portraits", "Events", "Travel", "Campus"];

export const guideLines: Record<string, string> = {
  hero: "Hi, I'm Chinmoy. Click my face, then scroll. I'll show you around.",
  about: "This is me. The real one, in the suit.",
  services: "Move across these cards. They react.",
  story: "Keep scrolling. Watch the lens open.",
  work: "Open my wallet. Pull out a card.",
  recognition: "Six projects so far. Every one has a page.",
  photo: "Pick a category, then open any still.",
  raw: "Grab the handle and drag it.",
  process: "Every project, in order. Keep going.",
  play: "Bet you can't break my name.",
  contact: "Your turn. Let's make something.",
};
