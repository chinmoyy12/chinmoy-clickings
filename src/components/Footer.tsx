import { site } from "@/data/site";

export function Footer() {
  return (
    <footer data-nav="solid" className="gutter flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-line py-5">
      <p className="label text-paper">{site.name}</p>
      <p className="label">Photography / Cinematography</p>
      <p className="label">
        © {site.year} {site.location}
      </p>
    </footer>
  );
}
