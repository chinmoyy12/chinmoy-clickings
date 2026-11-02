import type { PhilosophyScene, Photo } from "./types";

// REPLACE: photographs live in /public/media/photography/<category>-0N.jpg.
// Add a row to add a frame; the gallery, filters, 3D archive and viewer all
// read from this one list.

export const photoCategories = ["Portraits", "Events", "Street", "Travel", "Lifestyle", "Campus", "Editorial"] as const;

const WIDE = [2000, 1125] as const;
const STD = [1800, 1200] as const;
const TALL = [1280, 1600] as const;
const SQ = [1400, 1400] as const;

type Row = [string, string, readonly [number, number], string, string, string];

const rows: Record<(typeof photoCategories)[number], Row[]> = {
  Portraits: [
    ["Edge", "A face in profile, drawn only by a thin line of rose light.", TALL, "Guwahati", "2026", "Lit by one window and a lot of waiting."],
    ["Half Light", "A profile turned to the right, warm against the dark.", TALL, "Guwahati", "2026", "The shot came after the sitter stopped posing."],
    ["Window Seat", "A figure holding still against a bright rose window.", STD, "Shillong", "2025", "Exposed for the glass, the person falls to shadow."],
  ],
  Events: [
    ["Encore", "A performer raises both arms in amber light above a crowd.", STD, "Guwahati", "2026", "Third song. Everyone had their hands up by then."],
    ["String Lights", "Rose-coloured lights sweep over a crowd of silhouettes.", WIDE, "Guwahati", "2025", "Shot wide open from inside the crowd."],
    ["Teal Hour", "Cold beams of stage light cross through haze.", TALL, "Tezpur", "2025", "Haze machines are a photographer's best friend."],
  ],
  Street: [
    ["Pink Rain", "A lone figure under an umbrella on a shining rose street.", STD, "Guwahati", "2026", "Waited under an awning for forty minutes."],
    ["Crossing", "A monochrome figure with an umbrella, doubled by wet tarmac.", TALL, "Kolkata", "2025", "Black and white made the rain the subject."],
    ["Stepwell", "A small walker crossing hard diagonal stairs.", SQ, "Shillong", "2025", "Hard noon light, for once on purpose."],
  ],
  Travel: [
    ["Ridgeline", "A figure on rose-coloured hills under a burning sky.", WIDE, "Meghalaya", "2026", "A two-hour climb for the last ten minutes of sun."],
    ["First Crossing", "A boat moves across gold water at sunrise.", STD, "Majuli", "2025", "The ferryman let me ride along for free."],
    ["Blue Ridge", "Teal mountains recede beneath a pale glow.", TALL, "Arunachal Pradesh", "2025", "Everything turns blue at this altitude."],
  ],
  Lifestyle: [
    ["Slow Morning", "Someone stands in a window filled with warm light.", TALL, "Guwahati", "2026", "Nothing happened that morning. That was the point."],
    ["Afternoon Bars", "Warm blinds of light stretch across a wall and a shadow.", STD, "Guwahati", "2025", "The light lasts about six minutes in this room."],
    ["Fairground", "Pale green lights loop above a quiet crowd.", SQ, "Dibrugarh", "2025", "Long after the rides stopped."],
  ],
  Campus: [
    ["Commons", "Students walk beneath a great tree in muted evening light.", WIDE, "Guwahati", "2026", "The same tree, the same hour, a different year."],
    ["The Long Hall", "A figure in a corridor where amber light falls across the floor.", TALL, "Guwahati", "2025", "Between lectures the building belongs to the light."],
    ["Last Bell", "Rose dusk behind a tree as people head home.", STD, "Guwahati", "2025", "Everyone is always leaving at this hour."],
  ],
  Editorial: [
    ["Silk I", "Crimson ribbons of light twist over a shadowed figure.", TALL, "Studio", "2026", "A six-second exposure and one very patient dancer."],
    ["Silk II", "Amber fabric traced through a long exposure.", WIDE, "Studio", "2025", "The cloth moves. The camera does not."],
    ["Bars", "Rose light through blinds falls across a still silhouette.", TALL, "Studio", "2025", "One bulb, one blind, one hour."],
  ],
};

export const photos: Photo[] = photoCategories.flatMap((category) =>
  rows[category].map(([title, alt, size, location, year, note], i) => {
    const id = `${category.toLowerCase()}-0${i + 1}`;
    return { id, title, category, location, year, note, alt, src: `/media/photography/${id}.jpg`, width: size[0], height: size[1] };
  }),
);

const photo = (id: string) => {
  const match = photos.find((p) => p.id === id);
  if (!match) throw new Error(`Unknown photo: ${id}`);
  return match;
};

export const philosophy: PhilosophyScene[] = [
  { word: "Light", line: "Everything begins with where it falls.", image: photo("lifestyle-02") },
  { word: "Motion", line: "A still frame can still be moving.", image: photo("editorial-02") },
  { word: "People", line: "The reason any of it matters.", image: photo("events-01") },
  { word: "Places", line: "Every location has a mood if you stay.", image: photo("travel-02") },
  { word: "Moments", line: "They only happen once. Be ready.", image: photo("street-01") },
];

/** Frames hung in the 3D archive, in the order the camera meets them. */
export const archive = [
  "travel-01", "portraits-01", "events-02", "street-02", "campus-01", "editorial-01", "travel-03", "lifestyle-01",
  "events-01", "street-03", "portraits-03", "editorial-02", "campus-02", "travel-02", "lifestyle-03", "street-01",
].map(photo);
