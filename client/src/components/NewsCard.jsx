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

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };
// Card only ever shows a preview — "Read More" opens the full article on
// its own page (NewsDetail.jsx) rather than expanding in place.
const TRUNCATE_AT = 140;

export default function NewsCard({ news }) {
  const { t, language } = useLanguage();
  const title = pick(news.title, language);
  const description = pick(news.description, language);
  const category = news.category || "General";

  let formatted = news.date;
  try {
    formatted = new Date(news.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    formatted = news.date;
  }

  const shown = description.length > TRUNCATE_AT ? `${description.slice(0, TRUNCATE_AT).trimEnd()}…` : description;

  return (
    <Link
      to={`/news/${news.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl2 border border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <PlaceholderImage src={news.image} alt={title} label={title} imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-body text-[11px] font-semibold text-forest-700 shadow-soft backdrop-blur-sm">
          <TagIcon />
          {t(`news.category${category}`)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <span className="w-fit rounded-full bg-forest-50 px-3 py-1 font-body text-xs font-semibold text-forest-700">{formatted}</span>
        <h3 className="font-body text-lg font-semibold text-forest-900">{title}</h3>
        <p className="flex-1 font-body text-sm leading-relaxed text-ink-600">{shown}</p>
        <span className="mt-1 inline-flex w-fit items-center gap-1 font-body text-xs font-semibold text-forest-600 transition-transform duration-300 group-hover:translate-x-0.5">
          {t("news.readMore")} →
        </span>
      </div>
    </Link>
  );
}
