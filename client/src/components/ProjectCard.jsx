import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import PlaceholderImage from "./PlaceholderImage.jsx";

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path d="M11 4h6a3 3 0 0 1 3 3v6l-9 9-9-9 9-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

const STATUS_TONE = {
  ongoing: "text-forest-700",
  completed: "text-ink-600",
  upcoming: "text-gilt-700",
};

// Badge/border color keyed by category — every ALBUM_CATEGORIES value
// (Project reuses Album's category enum — see server/models/Project.js)
// covered. `border` is a separate explicit map, not derived from `bg` by
// string manipulation, because Tailwind's build-time scanner only
// generates CSS for class names that appear as complete literal strings
// in the source — a class assembled at runtime never matches anything in
// the compiled stylesheet. Only use shades that actually exist in
// tailwind.config.js's ramps — "ink" in particular only defines
// 50/100/400/600/800/900 (no 700), and a nonexistent shade fails the
// exact same silent way (no CSS generated, no build error) as the
// string-manipulation mistake above.
const CATEGORY_TONE = {
  Event: { bg: "bg-forest-700", border: "border-b-forest-700" },
  Education: { bg: "bg-gilt-600", border: "border-b-gilt-600" },
  Health: { bg: "bg-forest-600", border: "border-b-forest-600" },
  Community: { bg: "bg-forest-800", border: "border-b-forest-800" },
  Distribution: { bg: "bg-ink-600", border: "border-b-ink-600" },
  DisasterRelief: { bg: "bg-ink-800", border: "border-b-ink-800" },
};

// Links through to ProjectDetail.jsx, which shows the full description and
// every photo attached to the project (same GalleryGrid/Lightbox pattern
// AlbumDetail.jsx uses for gallery albums).
export default function ProjectCard({ project }) {
  const { t, language } = useLanguage();
  const title = pick(project.title, language);
  const description = pick(project.description, language);
  const cover = project.thumbnail || project.images?.[0];
  const status = project.status || "ongoing";
  const category = project.category || "Event";
  const tone = CATEGORY_TONE[category] || CATEGORY_TONE.Event;

  let formattedDate = "";
  try {
    formattedDate = project.date
      ? new Date(project.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "short", day: "numeric" })
      : "";
  } catch {
    formattedDate = "";
  }

  return (
    <Link
      to={`/projects/${project.id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-xl2 border-b-4 border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-gilt-500 ${tone.border}`}
    >
      <div className="relative h-52 w-full overflow-hidden">
        <PlaceholderImage src={cover} alt={title} label={title} imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-[11px] font-semibold text-white shadow-soft ${tone.bg}`}>
          <TagIcon />
          {t(`gallery.category${category}`)}
        </span>
        {formattedDate && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-forest-950/70 px-3 py-1.5 font-body text-[11px] font-semibold text-white shadow-soft backdrop-blur-sm">
            <CalendarIcon />
            {formattedDate}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-body text-lg font-bold leading-snug text-forest-900 line-clamp-2">{title}</h3>
        <p className="line-clamp-2 flex-1 font-body text-sm leading-relaxed text-ink-600">{description}</p>
        <div className="mt-1 flex items-center justify-between gap-2 border-t border-forest-50 pt-4">
          <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-forest-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-white transition-transform duration-300 group-hover:translate-x-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {t("common.readMore")}
          </span>
          <span className={`font-body text-xs font-semibold ${STATUS_TONE[status] || STATUS_TONE.ongoing}`}>{t(`common.${status}`)}</span>
        </div>
      </div>
    </Link>
  );
}
