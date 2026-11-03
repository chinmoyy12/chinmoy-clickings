import { photoById } from "./photos";

// The chapters of the scroll story, and what the avatar guide says in each section.

export const chapters = [
  { word: "See.", line: "It starts with noticing what everyone else walks past.", image: photoById("evening-river") },
  { word: "Wait.", line: "Then the hard part. Staying until the light agrees.", image: photoById("haze") },
  { word: "Click.", line: "One small sound. One moment that will never happen again.", image: photoById("cryo") },
  { word: "Feel.", line: "The grade brings back what it felt like to be there.", image: photoById("synthesis") },
];

export const storyChoices = ["Concerts", "Portraits", "Fashion", "Events"];

export const guideLines: Record<string, string> = {
  hero: "Hi, I'm Chinmoy. Click my face, then scroll. I'll show you around.",
  about: "That's my a6400 behind me. Drag it, then click to fire the shutter.",
  services: "Move across these cards. They react.",
  story: "Keep scrolling. Watch the lens open.",
  work: "Open my wallet. Pull out a card.",
  films: "Drag the reel. The one in front plays.",
  photo: "Pick a category, then open any still in full quality.",
  play: "Bet you can't break my name.",
  contact: "Your turn. Let's make something.",
};
