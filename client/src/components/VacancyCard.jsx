import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

// Top border + badge + button tone, keyed by employment type — kept within
// the site's forest/gilt/ink palette rather than introducing new colors.
const TYPE_TONE = {
  FullTime: { border: "border-t-forest-600", badge: "bg-forest-50 text-forest-700", button: "bg-forest-700 hover:bg-forest-800", wave: "text-forest-600" },
  PartTime: { border: "border-t-forest-400", badge: "bg-forest-50 text-forest-600", button: "bg-forest-500 hover:bg-forest-600", wave: "text-forest-400" },
  Volunteer: { border: "border-t-gilt-500", badge: "bg-gilt-50 text-gilt-700", button: "bg-gilt-500 hover:bg-gilt-600", wave: "text-gilt-500" },
  Internship: { border: "border-t-ink-600", badge: "bg-ink-100 text-ink-800", button: "bg-ink-800 hover:bg-ink-900", wave: "text-ink-600" },
  Contract: { border: "border-t-ink-800", badge: "bg-ink-100 text-ink-900", button: "bg-ink-900 hover:bg-ink-800", wave: "text-ink-800" },
};

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

// Purely decorative — a few overlapping ribbon-like wave lines, very low
// opacity, sitting behind the Apply button. Matches the flowing line
// pattern in the reference design.
function WaveDecoration({ toneClass }) {
  return (
    <svg
      className={`pointer-events-none absolute bottom-0 right-0 h-full w-2/3 opacity-[0.07] ${toneClass}`}
      viewBox="0 0 300 200"
      fill="none"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
    >
      <path d="M-20 60C60 20 100 100 180 60S300 20 340 60" stroke="currentColor" strokeWidth="2" />
      <path d="M-20 100C60 60 100 140 180 100S300 60 340 100" stroke="currentColor" strokeWidth="2" />
      <path d="M-20 140C60 100 100 180 180 140S300 100 340 140" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function VacancyCard({ vacancy }) {
  const { t, language } = useLanguage();
  const title = pick(vacancy.title, language);
  const description = pick(vacancy.description, language);
  const location = pick(vacancy.location, language);
  const type = vacancy.type || "FullTime";
  const tone = TYPE_TONE[type] || TYPE_TONE.FullTime;

  let deadline = vacancy.deadline;
  try {
    deadline = new Date(vacancy.deadline).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    deadline = vacancy.deadline;
  }

  return (
    <Link
      to={`/vacancies/${vacancy.id}`}
      className={`group relative flex h-full flex-col gap-3 overflow-hidden rounded-xl2 border border-t-4 border-forest-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${tone.border}`}
    >
      <WaveDecoration toneClass={tone.wave} />

      <span className={`relative w-fit rounded-full px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wide ${tone.badge}`}>{t(`news.vacancy${type}`)}</span>
      <h3 className="relative font-body text-lg font-bold text-forest-900">{title}</h3>
      <p className="relative line-clamp-2 flex-1 font-body text-sm leading-relaxed text-ink-600">{description}</p>

      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs text-ink-600">
        <span className="inline-flex items-center gap-1.5">
          <ClockIcon />
          {t("news.deadline")}: <strong className="font-semibold text-ink-800">{deadline}</strong>
        </span>
        {location && (
          <>
            <span className="text-ink-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <PinIcon />
              {location}
            </span>
          </>
        )}
      </div>

      <span
        className={`relative mt-1 inline-flex w-fit items-center gap-1.5 self-end rounded-full px-4 py-2 font-body text-xs font-semibold text-white shadow-soft transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lift ${tone.button}`}
      >
        {t("news.applyNow")} →
      </span>
    </Link>
  );
}
