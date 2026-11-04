import type { MetadataRoute } from "next";
import { photoCategories } from "@/data/photos";
import { site } from "@/data/site";
import { films } from "@/data/videos";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, priority: 1 },
    ...films.map((film) => ({ url: `${site.url}/watch/${film.id}`, priority: 0.8 })),
    ...photoCategories.map((name) => ({ url: `${site.url}/stills/${name.toLowerCase()}`, priority: 0.7 })),
  ];
}
