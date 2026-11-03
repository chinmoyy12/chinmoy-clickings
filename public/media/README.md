# The media

Every photograph and film in `work/` is Chinmoy's own, as delivered. Overwrite a file with the same name and it updates across the site.

| Folder | What goes here | Edit |
| --- | --- | --- |
| `work/photos/` | `<slug>.jpg`, the original stills, untouched | `src/data/photos.ts` |
| `work/films/` | `<id>.mp4` (the original film, remuxed losslessly so it streams), `<id>-poster.jpg` (its cover) and `<id>-preview.mp4` (a 6 second silent loop for cards) | `src/data/videos.ts` |
| `hero/` | `avatar.webp` (transparent avatar), `avatar-depth.webp` (matching depth map, light is near), `avatar-small.webp` (guide and navigation) | `src/data/site.ts` |
| `about/` | `portrait.jpg` | `src/data/site.ts` |
| `textures/` | `grain.png`, tiled film grain | — |
| `og.jpg` | 1200 × 630 social share image, cut from a still | — |

To add a still, copy it into `work/photos/` and add a row with its title, category, alt text and pixel size to `src/data/photos.ts`.
To add a film, add its mp4, a poster and a short preview to `work/films/`, then a row in `src/data/videos.ts`.
The site makes AVIF and WebP sizes of every still for the grid when hosted, and the viewer always opens the original.
