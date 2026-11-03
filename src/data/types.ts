// Content contracts. A CMS only needs to return these shapes; no UI code changes.

export interface MediaImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Film {
  id: string;
  title: string;
  category: string;
  description: string;
  /** The delivered file, played untouched. */
  src: string;
  /** A short silent loop for cards. */
  preview: string;
  poster: MediaImage;
  width: number;
  height: number;
  seconds: number;
}

export interface Photo extends MediaImage {
  id: string;
  title: string;
  category: string;
}

export interface ServiceGroup {
  title: string;
  items: string[];
}
