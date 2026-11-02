"use client";

import { Frame } from "@/components/Frame";
import { TransitionLink } from "@/components/TransitionLink";
import type { Project } from "@/data/types";
import { optimizedUrl } from "@/utils/media";

interface Props {
  project: Project;
  index: number;
  onFocusProject: (index: number) => void;
}

/** One film scene. Stacks in place on large screens; flows as a vertical story on small ones. */
export function ProjectScene({ project, index, onFocusProject }: Props) {
  const flipped = index % 2 === 1;
  return (
    <li data-scene={index} className="scene relative mb-20 last:mb-0 sm:mb-28 lg:mb-0">
      <TransitionLink
        href={`/work/${project.slug}`}
        morphSrc={optimizedUrl(project.hero.src, 2048)}
        data-cursor="View project"
        data-frame
        aria-label={`${project.title}, view project`}
        onFocus={(event) => event.currentTarget.matches(":focus-visible") && onFocusProject(index)}
        className={`zoom-host relative block aspect-[4/5] overflow-hidden bg-surface sm:aspect-[3/2] lg:absolute lg:aspect-auto ${
          flipped ? "lg:left-[var(--gutter)] lg:right-[34%]" : "lg:left-[34%] lg:right-[var(--gutter)]"
        } lg:bottom-[11vh] lg:top-[13vh]`}
      >
        <div data-image className="absolute inset-0 will-change-transform">
          <div className="zoom-img absolute inset-0">
            <Frame image={project.hero} sizes="(min-width: 1024px) 66vw, 100vw" quality={85} />
          </div>
        </div>
        <div data-shade className="absolute inset-0 bg-black opacity-0" aria-hidden />
      </TransitionLink>

      <div className={`mt-5 grid grid-cols-4 gap-x-4 lg:absolute lg:bottom-[11vh] lg:mt-0 lg:block lg:w-[28%] ${flipped ? "lg:right-[var(--gutter)]" : "lg:left-[var(--gutter)]"}`}>
        <p className="label col-span-4 mb-3 text-ember lg:hidden">{project.id}</p>
        <h3 className="display type-project col-span-4">
          <span className="ml">
            <span data-text>{project.title}</span>
          </span>
        </h3>
        <div className="col-span-4 mt-3 lg:mt-5">
          <span className="ml">
            <span data-text className="block max-w-[26ch] text-[0.9375rem] leading-snug text-ash">
              {project.tagline}
            </span>
          </span>
        </div>
        <dl className="col-span-4 mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 border-t border-line pt-4">
          {[
            ["Year", project.year],
            ["Category", project.category],
            ["Role", project.role],
          ].map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="label text-smoke">
                <span className="ml">
                  <span data-text>{term}</span>
                </span>
              </dt>
              <dd className="label text-paper">
                <span className="ml">
                  <span data-text>{value}</span>
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </li>
  );
}
