/** Sized image URL for code that loads images outside next/image (WebGL textures, the overlay). */
export function optimizedUrl(src: string, width: number) {
  if (process.env.NEXT_PUBLIC_IMAGE_OPTIMIZER !== "1") return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=70`;
}

export function preloadImage(src: string) {
  const image = new Image();
  image.src = src;
  return image.decode().catch(() => undefined);
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}
