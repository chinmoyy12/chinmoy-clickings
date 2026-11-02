import { site } from "@/data/site";

export function Footer() {
  return (
    <footer data-nav="solid" className="overflow-hidden border-t border-line pt-5">
      <div className="gutter flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <p className="label text-paper">{site.name}</p>
        <p className="label">Photography / Cinematography</p>
        <p className="label">
          © {site.year} {site.location}
        </p>
      </div>
      <p aria-hidden className="footer-word chrome-word mt-4 text-center">
        {site.loaderName}
      </p>
    </footer>
  );
}
