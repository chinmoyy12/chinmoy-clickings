<div align="center">

<img src="public/media/og.jpg" alt="Chinmoy Clickings" width="100%" />

# CHINMOY CLICKINGS

*I capture moments that deserve to stay.*

Photography · Cinematography · Visual Stories
<br />
Guwahati, India

### [**View the live website →**](https://chinmoy-clickings.vercel.app)

[![Live site](https://img.shields.io/badge/live-chinmoy--clickings.vercel.app-8e1f2b?style=flat-square)](https://chinmoy-clickings.vercel.app)
[![Instagram](https://img.shields.io/badge/instagram-@chinmoy__clickings-171717?style=flat-square&logo=instagram&logoColor=f2f0ea)](https://www.instagram.com/chinmoy_clickings/)
![Next.js](https://img.shields.io/badge/Next.js-16-171717?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-171717?style=flat-square&logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-171717?style=flat-square&logo=threedotjs)

</div>

> [!NOTE]
> Apart from Chinmoy's portrait, the photographs, films and project text on the site are generated placeholders. Real work is on its way.

---

## The experience

A bold, cinematic portfolio in black, off-white and one hot red. Every scene shares one motion language, so the site plays like a single film.

<table>
  <tr>
    <td width="50%"><img src="docs/hero.jpg" alt="Chinmoy standing in front of the giant red word CHINMOY" /></td>
    <td width="50%"><img src="docs/work.jpg" alt="Horizontal film strip of selected work" /></td>
  </tr>
  <tr>
    <td><img src="docs/film.jpg" alt="The Work. The Recognition. counter and ranked list" /></td>
    <td><img src="docs/archive.jpg" alt="From Raw. To Real. drag wipe" /></td>
  </tr>
</table>

| Scene | What happens |
| --- | --- |
| **Hero** | A real depth-mapped cutout stands in front of a giant word and reacts to the cursor, device tilt and a moving red rim light |
| **Selected Work** | A horizontal film strip with hover-play cards and a category marquee |
| **The Recognition** | An animated project counter with a ranked list of the work |
| **From Raw. To Real.** | A drag and scroll wipe between the ungraded and graded frame |
| **Photography** | A depth strip with category wipes and a full-screen viewer |
| **About** | A split statement with portrait, craft list and a red quote card |
| **The Journey** | A red timeline that fills as you scroll and lights each row |
| **Contact** | Copy-to-clipboard email, Instagram and a dust-filled call to action |

## Built for everyone

- **Dedicated mobile layouts,** recomposed for tall screens rather than shrunk
- **Graceful fallbacks:** the hero becomes a CSS 3D tilt if WebGL is unavailable, and is never blank
- **Reduced motion respected** throughout
- **Full keyboard support,** visible focus, captions and alt text
- **Responsive AVIF and WebP images,** lazy video and a dynamically loaded hero scene
- **Offline shell** through a small service worker

## Stack

Next.js · React · TypeScript · Tailwind CSS · GSAP · Lenis · Framer Motion · Three.js

## Run it locally

```bash
npm install
npm run dev
```

## Project structure

```text
src/
  app/          routes, metadata, sitemap and robots
  sections/     one file per page section
  components/   cursor, loader, transitions, viewer, player
  animations/   shared easing and transition vocabulary
  three/        the depth-reactive hero shader
  data/         all site content, ready for a CMS
public/media/   images, films and textures
```

## Updating the content

All content lives in `src/data`, so nothing needs changing inside the components.

| Change | Edit |
| --- | --- |
| Projects | `src/data/projects.ts` and `public/media/projects/` |
| Photographs | `src/data/photos.ts` and `public/media/photography/` |
| Films | `src/data/videos.ts` and `public/media/videos/` |
| Email and Instagram | `src/data/social.ts` |
| Name, about text, web address | `src/data/site.ts` |

[`public/media/README.md`](public/media/README.md) lists every file and the recommended sizes.

<details>
<summary>Building on a Windows PC with Application Control</summary>

The scripts use webpack with `@next/swc-wasm-nodejs`, because this project was developed on a machine that blocks Next's native compiler and `sharp`. When `sharp` can't load, `next.config.mjs` serves images unoptimized. Vercel optimizes them as normal.

</details>

---

<div align="center">

**[chinmoy-clickings.vercel.app](https://chinmoy-clickings.vercel.app)** · [@chinmoy_clickings](https://www.instagram.com/chinmoy_clickings/) · [chinmoykashyapthakuria@gmail.com](mailto:chinmoykashyapthakuria@gmail.com)

© 2026 Chinmoy Clickings

</div>
