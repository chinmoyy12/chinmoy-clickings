"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useTransitionRouter } from "@/components/PageTransition";
import { scrollToTarget } from "@/utils/scroll";

type Props = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** Image to carry across the cut; turns the wipe into a morph. */
  morphSrc?: string;
  strip?: boolean;
};

export function TransitionLink({ href, morphSrc, strip, onClick, ...props }: Props) {
  const { go } = useTransitionRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      ref={ref}
      href={href}
      scroll={false}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        const [path, hash] = href.split("#");
        if (path === pathname) {
          scrollToTarget(hash ? `#${hash}` : 0);
          history.replaceState(null, "", hash ? `#${hash}` : path);
          return;
        }
        go(href, morphSrc && ref.current ? { source: ref.current, src: morphSrc, strip } : undefined);
      }}
    />
  );
}
