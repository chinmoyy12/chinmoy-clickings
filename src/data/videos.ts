import type { Film } from "./types";

// Every film is Chinmoy's own, in /public/media/work/films. The full file plays as
// delivered; -preview.mp4 is a short silent loop for cards, -poster.jpg its cover.

type Row = [id: string, title: string, category: string, description: string, width: number, height: number, frame: [number, number], seconds: number];

const rows: Row[] = [
  ["mumbai", "Mumbai", "Travel", "Trains, towers and the Gateway of India, a city cut to its own rhythm.", 1276, 718, [1276, 718], 48],
  ["sunburn-campus-2026", "Sunburn Campus 2026", "Concerts", "The stage, the cryo jets and the crowd, from the barricade.", 720, 1280, [720, 404], 22],
  ["consensio", "Consensio", "Campus", "A whole campus breaks into a dance on the lawn.", 1276, 718, [1276, 718], 83],
  ["prayer-flags", "Prayer Flags", "Travel", "Flags in the wind, a stupa in the trees and a quiet sky.", 1276, 718, [1276, 718], 19],
  ["campus-days", "Campus Days", "Campus", "Two friends, one afternoon, and every corner of the campus.", 1276, 718, [1276, 718], 42],
  ["college-ke-campus", "College ke Campus", "Concerts", "A night of DJs on campus, cut as a vertical reel.", 720, 1280, [720, 1280], 17],
  ["from-above", "From Above", "Events", "A traditional dance performance on the steps, seen from overhead.", 720, 1280, [720, 404], 13],
];

export const films: Film[] = rows.map(([id, title, category, description, width, height, frame, seconds]) => ({
  id,
  title,
  category,
  description,
  width,
  height,
  seconds,
  src: `/media/work/films/${id}.mp4`,
  preview: `/media/work/films/${id}-preview.mp4`,
  poster: { src: `/media/work/films/${id}-poster.jpg`, alt: `A still from ${title}.`, width: frame[0], height: frame[1] },
}));

export const duration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
