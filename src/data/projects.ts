import type { MediaImage, Project } from "./types";
import { filmById } from "./videos";

// REPLACE: each project lives in /public/media/projects/<slug>/.
// Swap hero.jpg, 01–03.jpg and bts.jpg for real work with the same names, then
// rewrite the title, copy and alt text here. Width and height keep the layout
// stable, so update them if the new image has a different shape.

const WIDE = [2000, 1125] as const;
const STD = [1800, 1200] as const;
const TALL = [1280, 1600] as const;

const img = (slug: string, file: string, size: readonly [number, number], alt: string): MediaImage => ({
  src: `/media/projects/${slug}/${file}.jpg`,
  alt,
  width: size[0],
  height: size[1],
});

const you = (roles: string[]) => roles.map((role) => ({ role, name: "Chinmoy" }));

export const projects: Project[] = [
  {
    id: "01",
    slug: "the-moment",
    title: "The Moment",
    category: "Cinematography",
    year: "2026",
    role: "Director / Camera / Editor",
    location: "Northeast India",
    tagline: "A moment captured.",
    description:
      "One figure, one ridgeline, and the last four minutes of light. This film is about the seconds just before something ends, and how much a single frame can hold if you are patient enough to wait for it.",
    ambient: "#5a2a14",
    hero: img("the-moment", "hero", WIDE, "A lone figure stands on layered hills as the sun sinks into amber haze."),
    images: [
      img("the-moment", "01", TALL, "A face in profile, its edge traced by warm low light."),
      img("the-moment", "02", WIDE, "A boatman poles across still water beneath a pale sun."),
      img("the-moment", "03", TALL, "A figure stands dark against a tall glowing window."),
    ],
    bts: [img("the-moment", "bts", STD, "A photographer works from within a crowd beneath strings of warm lights.")],
    video: filmById("film-the-moment"),
    credits: you(["Direction", "Camera", "Edit", "Colour"]),
  },
  {
    id: "02",
    slug: "after-dark",
    title: "After Dark",
    category: "Photography / Film",
    year: "2026",
    role: "Photographer / Camera",
    location: "City streets",
    tagline: "The city tells the truth at night.",
    description:
      "Rain, sodium light and strangers under umbrellas. A study of what a street becomes once the crowds leave and the reflections take over.",
    ambient: "#0d3440",
    hero: img("after-dark", "hero", WIDE, "A figure with an umbrella crosses a wet street full of teal and red reflections."),
    images: [
      img("after-dark", "01", WIDE, "Red light trails curve through the dark along a bridge."),
      img("after-dark", "02", TALL, "A lone walker in the rain, mirrored in the wet road."),
      img("after-dark", "03", STD, "Beams of teal stage light cut through haze over a crowd."),
    ],
    bts: [img("after-dark", "bts", STD, "A profile lit by the cold glow of the street.")],
    video: filmById("film-after-dark"),
    credits: you(["Photography", "Camera", "Grade"]),
  },
  {
    id: "03",
    slug: "between-frames",
    title: "Between Frames",
    category: "Short Film",
    year: "2025",
    role: "Director / Editor",
    location: "Campus",
    tagline: "What happens when nothing happens.",
    description:
      "A short film set in the pauses: hallways, stairwells and the light moving across them. The story is only ever in the space between two cuts.",
    ambient: "#2d3a2c",
    hero: img("between-frames", "hero", WIDE, "A figure walks down a long corridor striped with pale light."),
    images: [
      img("between-frames", "01", TALL, "Light through window blinds falls across a wall and a shadow."),
      img("between-frames", "02", WIDE, "A small figure crosses a graphic pattern of stairs and shadow."),
      img("between-frames", "03", TALL, "A person stands motionless at a tall window."),
    ],
    bts: [img("between-frames", "bts", STD, "A warm corridor during a lighting setup.")],
    video: filmById("film-between-frames"),
    credits: you(["Direction", "Edit", "Sound"]),
  },
  {
    id: "04",
    slug: "the-people",
    title: "The People",
    category: "Event Film",
    year: "2025",
    role: "Camera / Editor",
    location: "Guwahati",
    tagline: "Nobody remembers the stage. They remember the room.",
    description:
      "Concerts, festivals and the crowds that make them. I point the camera at the people who came, because that is where the night actually happens.",
    ambient: "#54300f",
    hero: img("the-people", "hero", WIDE, "A performer stands in tungsten beams above a dark crowd."),
    images: [
      img("the-people", "01", STD, "Warm festival lights curve above a crowd of silhouettes."),
      img("the-people", "02", TALL, "A portrait in profile, lit in soft tungsten."),
      img("the-people", "03", WIDE, "People cross a campus at sunset beneath a great tree."),
    ],
    bts: [img("the-people", "bts", STD, "A photographer framing the light of a window.")],
    video: filmById("film-the-people"),
    credits: you(["Camera", "Edit", "Colour"]),
  },
  {
    id: "05",
    slug: "the-journey",
    title: "The Journey",
    category: "Travel Film",
    year: "2025",
    role: "Director / Camera",
    location: "The Brahmaputra",
    tagline: "Going somewhere on purpose.",
    description:
      "River mornings and blue hills, shot slowly and on foot. The film follows no plot, only the feeling of distance, and of being small in a very large quiet.",
    ambient: "#26343f",
    hero: img("the-journey", "hero", WIDE, "A boatman on a misty river beneath a pale silver sun."),
    images: [
      img("the-journey", "01", WIDE, "A walker on a ridgeline above blue layers of mountain."),
      img("the-journey", "02", TALL, "Muted green hills dissolving into mist."),
      img("the-journey", "03", STD, "Figures cross open ground beneath a tree in cold light."),
    ],
    bts: [img("the-journey", "bts", STD, "A wet road at dusk, lights blurred in the rain.")],
    video: filmById("film-the-journey"),
    credits: you(["Direction", "Camera"]),
  },
  {
    id: "06",
    slug: "unseen",
    title: "Unseen",
    category: "Conceptual",
    year: "2024",
    role: "Director / Photographer",
    location: "Studio",
    tagline: "A body in motion, photographed as light.",
    description:
      "Long exposures of cloth and movement. What remains is not a person but the record of a person passing through the dark.",
    ambient: "#2b2b2b",
    hero: img("unseen", "hero", WIDE, "Ribbons of pale light sweep across darkness in a long exposure."),
    images: [
      img("unseen", "01", TALL, "A soft shadow standing in bars of white light."),
      img("unseen", "02", STD, "A monochrome profile with a thin edge of light."),
      img("unseen", "03", TALL, "A tiny figure on a staircase washed in deep red."),
    ],
    bts: [img("unseen", "bts", STD, "A wine-coloured trace of moving fabric.")],
    video: filmById("film-unseen"),
    credits: you(["Direction", "Photography", "Edit"]),
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
