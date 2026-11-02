// Content contracts. A CMS only needs to return these shapes; no UI code changes.

export interface MediaImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Credit {
  role: string;
  name: string;
}

export interface Film {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  src: string;
  srcMobile: string;
  poster: MediaImage;
  captions: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: string;
  role: string;
  location: string;
  tagline: string;
  description: string;
  /** Scene colour behind this project in the selected work sequence. */
  ambient: string;
  hero: MediaImage;
  images: MediaImage[];
  bts: MediaImage[];
  video?: Film;
  credits: Credit[];
}

export interface Photo extends MediaImage {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  /** Revealed when the frame is dragged aside in the viewer. */
  note: string;
}

export interface PhilosophyScene {
  word: string;
  line: string;
  image: MediaImage;
}

export interface ServiceGroup {
  title: string;
  items: string[];
}
