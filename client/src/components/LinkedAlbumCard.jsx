import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import PlaceholderImage from "./PlaceholderImage.jsx";

function ImagesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <rect x="3" y="4" width="14" height="14" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="8.5" r="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 15l3.5-3.5a1.5 1.5 0 0 1 2 0L13 15M12 13l1.3-1.3a1.5 1.5 0 0 1 2 0L18 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 8v10a2 2 0 0 1-2 2H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// Links through to a linked Gallery Album's full photo collection —
// originally ProjectDetail.jsx's card, extracted so News/Notice/Event/Story
// detail pages can show the exact same "linked album" treatment instead of
// four near-duplicate copies. `album` is the populated { id, title,
// coverImage } object (see contentService.js's getProject/getNewsItem/etc,
// which all normalize it the same way).
//
// Deliberately a compact horizontal row (fixed-size thumbnail + text), not
// a tall full-width banner — a banner stretched across a wide desktop
// container reads as oversized for what's essentially a single link.
//
// `badgeLabel`/`description`/`ctaLabel` default to generic wording shared
// across News/Notice/Event/Story; ProjectDetail.jsx passes its own
// slightly more specific copy ("...from this program...") instead.
export default function LinkedAlbumCard({ album, badgeLabel, description, ctaLabel }) {
  const { t, language } = useLanguage();
  const albumTitle = pick(album.title, language);

  return (
    <Link
      to={`/gallery/${album.id}`}
      className="group flex items-center gap-4 overflow-hidden rounded-xl3 border border-forest-100 bg-white p-3.5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-lift sm:gap-5 sm:p-4"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl2 sm:h-20 sm:w-20">
        <PlaceholderImage src={album.coverImage} alt={albumTitle} label={albumTitle} imgClassName="transition-transform duration-500 group-hover:scale-105" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-forest-50 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wide text-forest-600">
          <ImagesIcon />
          {badgeLabel || t("news.sectionGallery")}
        </span>
        <h3 className="truncate font-body text-base font-semibold text-forest-900">{albumTitle}</h3>
        <p className="hidden truncate font-body text-xs leading-relaxed text-ink-600 sm:block">{description || t("news.linkedAlbumDesc")}</p>
      </div>

      <span className="flex shrink-0 items-center gap-1 font-body text-xs font-semibold text-forest-600 transition-transform duration-300 group-hover:translate-x-0.5">
        <span className="hidden sm:inline">{ctaLabel || t("news.viewFullGallery")}</span>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
