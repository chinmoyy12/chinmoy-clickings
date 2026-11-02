# Replacing the media

Everything here except your portrait is a generated placeholder. Overwrite a file with the same name and it updates across the site.

| Folder | What goes here | Edit |
| --- | --- | --- |
| `hero/` | `avatar.webp` (transparent avatar), `avatar-depth.webp` (matching depth map, light is near), `avatar-small.webp` (guide and navigation) | `src/data/site.ts` |
| `raw-real/` | `edited.jpg` (the edited portrait). Add a true raw and graded pair when you have one | `src/data/site.ts` |
| `projects/<slug>/` | `hero.jpg`, `01–03.jpg`, `bts.jpg` | `src/data/projects.ts` |
| `photography/` | `<category>-0N.jpg` | `src/data/photos.ts` |
| `videos/` | `<id>.mp4`, `<id>-480.mp4`, `<id>-poster.jpg`, captions `.vtt` | `src/data/videos.ts` |
| `about/` | `portrait.jpg` | `src/data/site.ts` |
| `textures/` | `grain.png`, tiled film grain | — |
| `og.jpg` | 1200 × 630 social share image | — |

Recommended sizes: long edge 2000–2560 px, JPEG quality around 85. The site
produces AVIF, WebP and smaller sizes automatically when hosted.

When you swap images, also update the `alt` text and any `width` / `height` in
the data file. Project copy and credits are placeholder
writing too and must be replaced with true details.
