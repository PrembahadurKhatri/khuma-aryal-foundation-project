import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import PlaceholderImage from "./PlaceholderImage.jsx";

// Same tag icon used for category badges on Gallery's AlbumCard and
// Projects' ProjectCard — kept identical here so News matches that pattern
// instead of using emoji.
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

// Badge/border color keyed by category — every NEWS_CATEGORIES value (see
// server/models/News.js) covered, cycling through the site's own
// forest/gilt/ink palette rather than one flat color for every card.
// `border` is a separate explicit map (not derived from `bg` by string
// manipulation) because Tailwind's build-time scanner only generates CSS
// for class names that appear as complete literal strings in the source —
// a class name assembled at runtime (e.g. via .replace()) never matches
// anything in the compiled stylesheet and silently renders as nothing.
const CATEGORY_TONE = {
  Health: { bg: "bg-forest-700", border: "border-b-forest-700" },
  Education: { bg: "bg-gilt-600", border: "border-b-gilt-600" },
  Sports: { bg: "bg-forest-600", border: "border-b-forest-600" },
  SelfEmployment: { bg: "bg-ink-700", border: "border-b-ink-700" },
  DisasterRelief: { bg: "bg-ink-800", border: "border-b-ink-800" },
  CommunityDevelopment: { bg: "bg-forest-800", border: "border-b-forest-800" },
  General: { bg: "bg-forest-900", border: "border-b-forest-900" },
};

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };
// Card only ever shows a preview — "Read More" opens the full article on
// its own page (NewsDetail.jsx) rather than expanding in place.
const TRUNCATE_AT = 140;

export default function NewsCard({ news }) {
  const { t, language } = useLanguage();
  const title = pick(news.title, language);
  const description = pick(news.description, language);
  const category = news.category || "General";
  const tone = CATEGORY_TONE[category] || CATEGORY_TONE.General;

  let formatted = news.date;
  try {
    formatted = new Date(news.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    formatted = news.date;
  }

  const shown = description.length > TRUNCATE_AT ? `${description.slice(0, TRUNCATE_AT).trimEnd()}…` : description;

  return (
    <Link
      to={`/news/${news.id}`}
      className={`group flex h-full flex-col overflow-hidden rounded-xl2 border-b-4 border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${tone.border}`}
    >
      <div className="relative h-52 w-full overflow-hidden">
        <PlaceholderImage src={news.image} alt={title} label={title} imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-[11px] font-semibold text-white shadow-soft ${tone.bg}`}>
          <TagIcon />
          {t(`news.category${category}`)}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-forest-950/70 px-3 py-1.5 font-body text-[11px] font-semibold text-white shadow-soft backdrop-blur-sm">
          <CalendarIcon />
          {formatted}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className={`h-1 w-10 rounded-full ${tone.bg}`} aria-hidden="true" />
        <h3 className="font-body text-lg font-bold leading-snug text-forest-900 line-clamp-2">{title}</h3>
        <p className="line-clamp-2 flex-1 font-body text-sm leading-relaxed text-ink-600">{shown}</p>
        <div className="mt-1 flex items-center justify-between gap-2 border-t border-forest-50 pt-4">
          <span className="inline-flex items-center gap-2 font-body text-sm font-semibold text-forest-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-white transition-transform duration-300 group-hover:translate-x-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {t("news.readMore")}
          </span>
          <span className="font-body text-xs text-ink-400">{t(`news.category${category}`)}</span>
        </div>
      </div>
    </Link>
  );
}
