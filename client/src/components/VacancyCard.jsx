import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12 21s-6.5-5.86-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.14-6.5 11-6.5 11Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function VacancyCard({ vacancy }) {
  const { t, language } = useLanguage();
  const title = pick(vacancy.title, language);
  const description = pick(vacancy.description, language);
  const location = pick(vacancy.location, language);
  const type = vacancy.type || "FullTime";

  let deadline = vacancy.deadline;
  try {
    deadline = new Date(vacancy.deadline).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    deadline = vacancy.deadline;
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl2 border border-forest-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <span className="w-fit rounded-full bg-forest-50 px-3 py-1 font-body text-xs font-semibold text-forest-700">{t(`news.vacancy${type}`)}</span>
      <h3 className="font-body text-lg font-semibold text-forest-900">{title}</h3>
      <p className="line-clamp-3 flex-1 font-body text-sm leading-relaxed text-ink-600">{description}</p>
      <div className="flex flex-col gap-1.5 font-body text-xs text-ink-600">
        <span className="inline-flex items-center gap-2">
          <ClockIcon />
          {t("news.deadline")}: {deadline}
        </span>
        {location && (
          <span className="inline-flex items-center gap-2">
            <PinIcon />
            {location}
          </span>
        )}
      </div>
      {vacancy.applyLink && (
        <a
          href={vacancy.applyLink}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-forest-700 px-4 py-2 font-body text-xs font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lift"
        >
          {t("news.applyNow")} →
        </a>
      )}
    </div>
  );
}
