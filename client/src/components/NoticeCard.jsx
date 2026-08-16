import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

// Left border + light-tint badge, keyed by priority — matches the
// reference design: green/important, gold/new, red/urgent.
const PRIORITY_TONE = {
  important: { border: "border-l-forest-600", badge: "bg-forest-50 text-forest-700" },
  new: { border: "border-l-gilt-500", badge: "bg-gilt-50 text-gilt-700" },
  urgent: { border: "border-l-red-500", badge: "bg-red-50 text-red-600" },
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
  const priority = notice.priority || "important";
  const tone = PRIORITY_TONE[priority] || PRIORITY_TONE.important;

  let formatted = notice.date;
  try {
    formatted = new Date(notice.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    formatted = notice.date;
  }

  return (
    <Link
      to={`/notices/${notice.id}`}
      className={`group flex items-center gap-4 rounded-xl2 border border-l-4 border-forest-100 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5 ${tone.border}`}
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wide ${tone.badge}`}>
            {t(`news.priority${priority.charAt(0).toUpperCase()}${priority.slice(1)}`)}
          </span>
          <span className="font-body text-xs text-ink-400">{formatted}</span>
        </div>
        <h3 className="font-body text-base font-bold text-forest-900">{title}</h3>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest-100 text-forest-700 transition-all duration-300 group-hover:border-forest-700 group-hover:bg-forest-700 group-hover:text-white">
        <ChevronIcon />
      </span>
    </Link>
  );
}
