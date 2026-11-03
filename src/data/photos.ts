import type { Photo } from "./types";

// Every still is an original from Chinmoy's work folder, in /public/media/work/photos.
// Add a row to add a frame; the gallery, filters, ring and viewer all read this list.

export const photoCategories = ["Concerts", "Portraits", "Fashion", "Events", "Landscapes"] as const;

type Category = (typeof photoCategories)[number];
type Row = [slug: string, title: string, category: Category, alt: string, width: number, height: number];

const rows: Row[] = [
  ["sunburn-campus", "Sunburn Campus", "Concerts", "A DJ throws an arm up under pink and blue stage light beside the Sunburn Campus sign.", 965, 606],
  ["in-the-smoke", "In the Smoke", "Concerts", "A DJ leans over the decks inside a violet cloud of stage smoke.", 3072, 4096],
  ["pioneer-hands", "Pioneer Hands", "Concerts", "A DJ in a beige top works the mixer under soft violet light.", 3072, 4096],
  ["cryo", "Cryo", "Concerts", "A performer raises an arm as cryo jets burst white on either side.", 2574, 1617],
  ["green-beams", "Green Beams", "Concerts", "A DJ at the decks beneath green stage lights and haze.", 3072, 4096],
  ["facing-the-crowd", "Facing the Crowd", "Concerts", "A DJ seen from behind, one arm raised toward the lights and the haze.", 3072, 4096],
  ["front-row", "Front Row", "Concerts", "Friends in the crowd laughing at the camera at night.", 3812, 1995],
  ["heritage-1", "Heritage I", "Portraits", "A woman in traditional attire sits by a pillar, fastening her bracelet.", 2906, 3874],
  ["heritage-2", "Heritage II", "Portraits", "The same woman reaches for a wall of love locks and notes.", 3072, 4096],
  ["heritage-3", "Heritage III", "Portraits", "Seated by the pillar again, she brushes back her hair.", 3072, 4096],
  ["on-the-mic", "On the Mic", "Portraits", "A host in a leopard-print top holds a microphone and looks aside.", 2229, 2786],
  ["slice-of-light", "Slice of Light", "Portraits", "A young man in a white polo stands in a narrow band of light.", 3277, 4096],
  ["backstage-glance", "Backstage Glance", "Portraits", "A woman in a white top glances across a warmly lit room.", 1440, 1918],
  ["synthesis", "Synthesis", "Fashion", "A model in a black gown with a sculpted sleeve at a graduation design showcase.", 3276, 4096],
  ["synthesis-mono", "Synthesis, Mono", "Fashion", "Models in feathered black looks on the showcase stage, in black and white.", 2252, 2815],
  ["black-gown", "Black Gown", "Fashion", "A model walks the runway in a black gown with a sheer cape.", 3277, 4096],
  ["dandiya-night", "Dandiya Night", "Events", "Friends dance with dandiya sticks, laughing, in a crowd.", 4095, 2144],
  ["mini-on-the-lawn", "Mini on the Lawn", "Events", "A Red Bull Mini with a giant can on its back, parked on a crowded lawn.", 3024, 3023],
  ["parked", "Parked", "Events", "The Red Bull Mini from the side, its can angled into the sky.", 1179, 1179],
  ["the-can", "The Can", "Events", "The rear of the Red Bull Mini under palm trees.", 1126, 1126],
  ["evening-river", "Evening River", "Landscapes", "Pink dusk over a wide river, with hills on the far bank and boats on the water.", 1851, 2315],
  ["haze", "Haze", "Landscapes", "A hazy river beyond a balcony rail and green trees.", 1850, 2314],
];

export const photos: Photo[] = rows.map(([id, title, category, alt, width, height]) => ({ id, title, category, alt, width, height, src: `/media/work/photos/${id}.jpg` }));

export const photoById = (id: string) => {
  const match = photos.find((photo) => photo.id === id);
  if (!match) throw new Error(`Unknown photo: ${id}`);
  return match;
};
