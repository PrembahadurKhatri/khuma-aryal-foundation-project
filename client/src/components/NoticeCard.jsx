import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

const PRIORITY_TONE = {
  important: "bg-forest-600 text-white",
  new: "bg-gilt-500 text-white",
  urgent: "bg-red-600 text-white",
};

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12 2v6M12 22v-8M5 10h14l-2 4H7l-2-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ClipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M8 12.5V7a4 4 0 0 1 8 0v9a2.5 2.5 0 0 1-5 0V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NoticeCard({ notice }) {
  const { t, language } = useLanguage();
  const title = pick(notice.title, language);
  const priority = notice.priority || "important";

  let formatted = notice.date;
  try {
    formatted = new Date(notice.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    formatted = notice.date;
  }

  return (
    <div className="flex items-start gap-3 rounded-xl2 border border-forest-100 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-600">
        <PinIcon />
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${PRIORITY_TONE[priority] || PRIORITY_TONE.important}`}>
            {t(`news.priority${priority.charAt(0).toUpperCase()}${priority.slice(1)}`)}
          </span>
          <span className="font-body text-xs text-ink-400">{formatted}</span>
        </div>
        <h3 className="font-body text-sm font-semibold text-forest-900 sm:text-base">{title}</h3>
        {notice.attachment && (
          <a
            href={notice.attachment}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex w-fit items-center gap-1.5 font-body text-xs font-semibold text-forest-600 hover:text-forest-800"
          >
            <ClipIcon />
            {t("news.viewAttachment")}
          </a>
        )}
      </div>
    </div>
  );
}
