# CHINMOY CLICKINGS

Cinematic photography and cinematography portfolio. Next.js, TypeScript, Tailwind,
GSAP, Lenis, Framer Motion and React Three Fiber.

```bash
npm install
npm run dev
```

## Before going live

1. **Replace the media.** Everything in `public/media` is a generated placeholder.
   See `public/media/README.md`.
2. **Replace the writing.** Project copy, credits, photo locations and field notes in
   `src/data` are placeholder text.
3. **Set `NEXT_PUBLIC_SITE_URL`** on your host to your real address, for canonical
   URLs, the sitemap and share cards.

Email and Instagram live in `src/data/social.ts`.

## Where things live

- `src/data` — all content. A CMS only has to return the shapes in `types.ts`.
- `src/sections` — one file per page section.
- `src/components` — shared UI: cursor, loader, page transitions, viewer, player.
- `src/animations` — the shared easing and transition vocabulary.
- `src/three` — the WebGL archive, loaded on demand with a 2D fallback.

## Notes

Scripts run webpack with the `@next/swc-wasm-nodejs` compiler because the development
machine's Windows Application Control policy blocks Next's native compiler and `sharp`.
Where `sharp` cannot load, `next.config.mjs` serves images unoptimized. Hosts that can
run it, such as Vercel, get AVIF, WebP and responsive sizes automatically.
