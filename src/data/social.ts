import { photos } from "./photos";

const handle = "chinmoy_clickings";

export const social = {
  email: "chinmoykashyapthakuria@gmail.com",
  instagram: { handle: `@${handle}`, url: `https://www.instagram.com/${handle}/` },
  /** Frames shown in the Follow the process section. */
  process: ["events-01", "portraits-01", "street-01", "campus-02", "travel-02", "editorial-01"].map((id) => {
    const photo = photos.find((p) => p.id === id);
    if (!photo) throw new Error(`Unknown photo id in social.process: ${id}`);
    return photo;
  }),
};
