import type { Film } from "./types";

// REPLACE: drop real footage into /public/media/videos using the same file
// names, or point these paths at new ones. Files ending in -480 are the light
// versions served to phones and data-saver connections.
const film = (id: string, title: string, category: string, description: string): Film => ({
  id,
  title,
  category,
  year: "2026",
  description,
  src: `/media/videos/${id}.mp4`,
  srcMobile: `/media/videos/${id}-480.mp4`,
  poster: { src: `/media/videos/${id}-poster.jpg`, alt: `Still frame from ${title}.`, width: 1280, height: 720 },
  captions: "/media/videos/ambient.vtt",
});

export const reel = film("reel", "Showreel 2026", "Reel", "A minute of the year, cut for feeling rather than order.");

const films: Film[] = [
  film("film-the-moment", "Golden Hour Reel", "Reels", "Vertical stories made for a thumb and a held breath."),
  film("film-the-people", "One Night, Everyone", "Event Films", "The room, the noise, and the people inside it."),
  film("film-between-frames", "Between Frames", "Short Films", "Small fictions built out of long corridors."),
  film("film-after-dark", "After Dark", "Promotional Films", "Brands and places, lit the way they feel at night."),
  film("film-the-journey", "The Long Way", "Cinematic Stories", "Slow films about going somewhere on purpose."),
];

const unseen = film("film-unseen", "Unseen", "Short Films", "Movement studied until it stops being a body.");

export const filmById = (id: string) => {
  const match = [reel, ...films, unseen].find((f) => f.id === id);
  if (!match) throw new Error(`Unknown film: ${id}`);
  return match;
};
