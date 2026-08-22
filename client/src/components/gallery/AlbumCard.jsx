import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import PlaceholderImage from "../PlaceholderImage.jsx";

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path d="M11 4h6a3 3 0 0 1 3 3v6l-9 9-9-9 9-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function PeopleIcon({ className = "h-3 w-3" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${className} shrink-0`} aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 19.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15.5 5.3c1.3.4 2.2 1.6 2.2 3s-.9 2.6-2.2 3M18 14.3c1.7.5 3 2.2 3 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

// Gallery thumbnail: cover photo on top, then a white body with a category
// tag, title, short description and a photo-count badge — linking through
// to AlbumDetail.jsx where every photo in the album is shown.
//
// Below `sm`, the card switches to a compact layout (just a category badge
// overlaid on the photo, title underneath — no date, description or
// photo-count) so two fit per row without feeling cramped; the richer
// version returns at `sm` and up.
export default function AlbumCard({ album }) {
  const { t, language } = useLanguage();
  const title = pick(album.title, language);
  const description = pick(album.description, language);
  const count = album.photos?.length || 0;
  const category = album.category || "Event";

  return (
    <Link
      to={`/gallery/${album.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl2 border border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-gilt-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <PlaceholderImage src={album.coverImage} alt={title} label={title} imgClassName="transition-transform duration-500 group-hover:scale-105" />

        {/* Mobile-only: category badge overlaid on the photo */}
        <div className="absolute inset-x-2 bottom-2 flex items-end justify-end sm:hidden">
          <span className="rounded-md bg-forest-600 px-1.5 py-1 font-body text-[10px] font-semibold text-white shadow-soft">
            {t(`gallery.category${category}`)}
          </span>
        </div>
      </div>

      {/* Mobile-only: compact body — title + beneficiaries count (when set) */}
      <div className="flex flex-col gap-1 p-3 sm:hidden">
        <h3 className="line-clamp-2 font-body text-sm font-semibold leading-snug text-ink-900">{title}</h3>
        {album.beneficiaries != null && (
          <span className="inline-flex w-fit items-center gap-1 font-body text-[11px] font-semibold text-forest-600">
            <PeopleIcon />
            {album.beneficiaries}+ {t("gallery.beneficiariesLabel")}
          </span>
        )}
      </div>

      {/* sm and up: the original richer body */}
      <div className="hidden flex-1 flex-col gap-1.5 p-4 sm:flex">
        <span className="inline-flex w-fit items-center gap-1 font-body text-xs font-semibold text-forest-600">
          <TagIcon />
          {t(`gallery.category${category}`)}
        </span>
        <h3 className="font-body text-base font-semibold leading-snug text-ink-900">{title}</h3>
        {description && <p className="line-clamp-2 flex-1 font-body text-sm leading-relaxed text-ink-600">{description}</p>}
        {album.beneficiaries != null && (
          <span className="inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-forest-700">
            <PeopleIcon className="h-3.5 w-3.5" />
            {album.beneficiaries}+ {t("gallery.beneficiariesLabel")}
          </span>
        )}

        <div className="mt-2 flex items-center justify-end border-t border-forest-100 pt-2.5">
          <span className="rounded-full bg-cream-200 px-2.5 py-1 font-body text-[11px] font-medium text-ink-600">
            {count} {t("gallery.photosLabel")}
          </span>
        </div>
      </div>
    </Link>
  );
}
