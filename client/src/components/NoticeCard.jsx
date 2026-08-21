import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };
// Card only ever shows a preview — the full notice (if one was written) is
// on its own page (NoticeDetail.jsx).
const TRUNCATE_AT = 90;

// Left border + tinted card wash + badge + chevron circle, all keyed by
// priority — matches the reference design: green/important, gold/new,
// red/urgent.
const PRIORITY_TONE = {
  important: {
    border: "border-l-forest-600",
    wash: "bg-white",
    badge: "bg-forest-100 text-forest-700",
    chevron: "border-forest-200 text-forest-600 group-hover:border-forest-600 group-hover:bg-forest-600 group-hover:text-white",
  },
  new: {
    border: "border-l-gilt-500",
    wash: "bg-white",
    badge: "bg-gilt-100 text-gilt-700",
    chevron: "border-gilt-300 text-gilt-600 group-hover:border-gilt-500 group-hover:bg-gilt-500 group-hover:text-white",
  },
  urgent: {
    border: "border-l-red-500",
    wash: "bg-white",
    badge: "bg-red-100 text-red-600",
    chevron: "border-red-200 text-red-500 group-hover:border-red-500 group-hover:bg-red-500 group-hover:text-white",
  },
};

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NoticeCard({ notice }) {
  const { t, language } = useLanguage();
  const title = pick(notice.title, language);
  const description = pick(notice.description, language);
  const priority = notice.priority || "important";
  const tone = PRIORITY_TONE[priority] || PRIORITY_TONE.important;

  let formatted = notice.date;
  try {
    formatted = new Date(notice.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    formatted = notice.date;
  }

  const shownDescription = description.length > TRUNCATE_AT ? `${description.slice(0, TRUNCATE_AT).trimEnd()}…` : description;

  return (
    <Link
      to={`/notices/${notice.id}`}
      className={`group flex items-center gap-4 rounded-xl2 border border-l-4 border-forest-100 p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5 ${tone.border} ${tone.wash}`}
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wide ${tone.badge}`}>
            {t(`news.priority${priority.charAt(0).toUpperCase()}${priority.slice(1)}`)}
          </span>
          <span className="font-body text-xs text-ink-400">{formatted}</span>
        </div>
        <h3 className="font-body text-base font-bold text-forest-900">{title}</h3>
        {shownDescription && <p className="line-clamp-2 font-body text-sm leading-relaxed text-ink-600">{shownDescription}</p>}
      </div>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white transition-all duration-300 ${tone.chevron}`}>
        <ChevronIcon />
      </span>
    </Link>
  );
}
