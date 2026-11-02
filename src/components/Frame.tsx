"use client";

import Image from "next/image";
import { useState } from "react";
import type { MediaImage } from "@/data/types";

interface Props {
  image: MediaImage;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Decorative use: the same picture is already described nearby. */
  decorative?: boolean;
  quality?: 70 | 80 | 85;
}

/** A filled image with a quiet fallback if the file is missing. */
export function Frame({ image, sizes, priority, className, decorative, quality = 80 }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div role="img" aria-label={decorative ? undefined : image.alt} className={`absolute inset-0 flex items-end bg-surface p-4 ${className ?? ""}`}>
        <span className="label">Frame unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={decorative ? "" : image.alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      draggable={false}
      onError={() => setFailed(true)}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
