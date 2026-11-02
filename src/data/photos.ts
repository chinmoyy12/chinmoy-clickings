import type { Photo } from "./types";

// REPLACE: photographs live in /public/media/photography/<category>-0N.jpg.
// Add a row to add a frame; the gallery, filters and viewer all read this list.

export const photoCategories = ["Portraits", "Events", "Street", "Travel", "Lifestyle", "Campus", "Editorial"] as const;

const WIDE = [2000, 1125] as const;
const STD = [1800, 1200] as const;
const TALL = [1280, 1600] as const;
const SQ = [1400, 1400] as const;

type Row = [string, string, readonly [number, number]];

const rows: Record<(typeof photoCategories)[number], Row[]> = {
  Portraits: [
    ["Edge", "A face in profile, drawn only by a thin line of rose light.", TALL],
    ["Half Light", "A profile turned to the right, warm against the dark.", TALL],
    ["Window Seat", "A figure holding still against a bright rose window.", STD],
  ],
  Events: [
    ["Encore", "A performer raises both arms in amber light above a crowd.", STD],
    ["String Lights", "Rose-coloured lights sweep over a crowd of silhouettes.", WIDE],
    ["Teal Hour", "Cold beams of stage light cross through haze.", TALL],
  ],
  Street: [
    ["Pink Rain", "A lone figure under an umbrella on a shining rose street.", STD],
    ["Crossing", "A monochrome figure with an umbrella, doubled by wet tarmac.", TALL],
    ["Stepwell", "A small walker crossing hard diagonal stairs.", SQ],
  ],
  Travel: [
    ["Ridgeline", "A figure on rose-coloured hills under a burning sky.", WIDE],
    ["First Crossing", "A boat moves across gold water at sunrise.", STD],
    ["Blue Ridge", "Teal mountains recede beneath a pale glow.", TALL],
  ],
  Lifestyle: [
    ["Slow Morning", "Someone stands in a window filled with warm light.", TALL],
    ["Afternoon Bars", "Warm blinds of light stretch across a wall and a shadow.", STD],
    ["Fairground", "Pale green lights loop above a quiet crowd.", SQ],
  ],
  Campus: [
    ["Commons", "Students walk beneath a great tree in muted evening light.", WIDE],
    ["The Long Hall", "A figure in a corridor where amber light falls across the floor.", TALL],
    ["Last Bell", "Rose dusk behind a tree as people head home.", STD],
  ],
  Editorial: [
    ["Silk I", "Crimson ribbons of light twist over a shadowed figure.", TALL],
    ["Silk II", "Amber fabric traced through a long exposure.", WIDE],
    ["Bars", "Rose light through blinds falls across a still silhouette.", TALL],
  ],
};

export const photos: Photo[] = photoCategories.flatMap((category) =>
  rows[category].map(([title, alt, size], i) => {
    const id = `${category.toLowerCase()}-0${i + 1}`;
    return { id, title, category, alt, src: `/media/photography/${id}.jpg`, width: size[0], height: size[1] };
  }),
);
