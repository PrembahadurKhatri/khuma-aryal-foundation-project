import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import PlaceholderImage from "./PlaceholderImage.jsx";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

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

export default function EventCard({ event }) {
  const { t, language } = useLanguage();
  const name = pick(event.name, language);
  const location = pick(event.location, language);

  let formatted = event.date;
  try {
    formatted = new Date(event.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    formatted = event.date;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl2 border border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative h-36 w-full overflow-hidden">
        <PlaceholderImage src={event.image} alt={name} label={name} />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="font-body text-base font-semibold text-forest-900">{name}</h3>
        <div className="flex flex-col gap-1.5 font-body text-xs text-ink-600">
          <span className="inline-flex items-center gap-2">
            <CalendarIcon />
            {formatted}
          </span>
          {event.time && (
            <span className="inline-flex items-center gap-2">
              <ClockIcon />
              {event.time}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-2">
              <PinIcon />
              {location}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link
            to={`/events/${event.id}`}
            className="inline-flex w-fit items-center gap-1 font-body text-xs font-semibold text-forest-600 transition-transform duration-300 hover:translate-x-0.5"
          >
            {t("news.readMore")} →
          </Link>
          {event.registerLink && (
            <a
              href={event.registerLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-forest-700 px-4 py-2 font-body text-xs font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lift"
            >
              {t("news.register")} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
