import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { nextProject, projectBySlug, projects } from "@/data/projects";
import { site } from "@/data/site";
import { ProjectDetail } from "@/sections/ProjectDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: `${project.title} — ${site.name}`, description: project.description, images: [{ url: project.hero.src, alt: project.hero.alt }] },
    twitter: { card: "summary_large_image", title: project.title, images: [project.hero.src] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    dateCreated: project.year,
    image: `${site.url}${project.hero.src}`,
    creator: { "@type": "Person", name: "Chinmoy" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ProjectDetail project={project} next={nextProject(slug)} />
    </>
  );
}
