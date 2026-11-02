<div align="center">

<img src="public/media/og.jpg" alt="Chinmoy Clickings" width="100%" />

# CHINMOY CLICKINGS

*An interactive film made from photographs.*

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
> The photographs, films and project text currently on the site are generated placeholders. Real work is on its way.

---

## The experience

A cinematic portfolio where the interface steps back and the work leads. Every scene change is built from one shared motion language, so the site plays like a single film rather than a stack of sections.

<table>
  <tr>
    <td width="50%"><img src="docs/hero.jpg" alt="Hero with the name layered around a photographer" /></td>
    <td width="50%"><img src="docs/work.jpg" alt="Selected work scene with an editorial project number" /></td>
  </tr>
  <tr>
    <td><img src="docs/film.jpg" alt="Film slats, one expanded on hover" /></td>
    <td><img src="docs/archive.jpg" alt="3D gallery of floating photographs" /></td>
  </tr>
</table>

| Scene | What happens |
| --- | --- |
| **Opening** | A short loader, then a layered hero that reacts to the cursor, device tilt and scroll speed |
| **Selected Work** | Six projects change like film scenes, with rolling numerals and shifting ambient colour |
| **Project pages** | The chosen image morphs to fill the screen, and closing returns you to your exact scroll position |
| **Photography** | A horizontal strip with depth, cinematic category wipes and a full-screen viewer |
| **Philosophy** | Light, Motion, People, Places, Moments: each word changes the scene |
| **Cinematography** | Showreel with hover preview, expanding film slats and a minimal player with captions |
| **The Archive** | Walk through floating photographs in WebGL, then select one to fly to it |
| **The ending** | The contact scene slowly loses its colour, then the film fades to black |

## Built for everyone

- **Dedicated mobile layouts,** recomposed for tall screens rather than shrunk
- **Graceful fallbacks:** a 2D gallery when WebGL, battery or memory are limited
- **Reduced motion respected** throughout
- **Full keyboard support,** visible focus, captions and alt text
- **Responsive AVIF and WebP images,** lazy video and on-demand 3D
- **Offline shell** through a small service worker

## Stack

Next.js · React · TypeScript · Tailwind CSS · GSAP · Lenis · Framer Motion · Three.js · React Three Fiber · Drei

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
  three/        the WebGL archive
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
