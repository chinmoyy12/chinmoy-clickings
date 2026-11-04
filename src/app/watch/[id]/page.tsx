import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import { films } from "@/data/videos";
import { ScreeningRoom } from "@/sections/ScreeningRoom";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return films.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const film = films.find((item) => item.id === id);
  if (!film) return {};
  return {
    title: film.title,
    description: film.description,
    alternates: { canonical: `/watch/${film.id}` },
    openGraph: { title: `${film.title} — ${site.name}`, description: film.description, images: [{ url: film.poster.src, alt: film.poster.alt }], videos: [{ url: film.src }] },
    twitter: { card: "summary_large_image", title: film.title, images: [film.poster.src] },
  };
}

export default async function WatchPage({ params }: Props) {
  const { id } = await params;
  const film = films.find((item) => item.id === id);
  if (!film) notFound();
  return <ScreeningRoom film={film} />;
}
