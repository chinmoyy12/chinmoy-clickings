import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { photoCategories, photos } from "@/data/photos";
import { site } from "@/data/site";
import { StillsRoom } from "@/sections/StillsRoom";

interface Props {
  params: Promise<{ category: string }>;
}

export const dynamicParams = false;

const bySlug = (slug: string) => photoCategories.find((name) => name.toLowerCase() === slug);

export function generateStaticParams() {
  return photoCategories.map((name) => ({ category: name.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = bySlug((await params).category);
  if (!category) return {};
  const cover = photos.find((photo) => photo.category === category)!;
  return {
    title: `${category} photography`,
    description: `${category} photographs by ${site.name}, shown as the original files.`,
    alternates: { canonical: `/stills/${category.toLowerCase()}` },
    openGraph: { title: `${category} — ${site.name}`, images: [{ url: cover.src, alt: cover.alt }] },
  };
}

export default async function StillsPage({ params }: Props) {
  const category = bySlug((await params).category);
  if (!category) notFound();
  return <StillsRoom category={category} />;
}
