import { useMemo } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

function formatShort(date, language) {
  try {
    return new Date(date).toLocaleDateString(DATE_LOCALES[language] || "en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function SidebarPanel({ title, children }) {
  return (
    <div className="rounded-xl2 border border-forest-100 bg-white p-5 shadow-card">
      <h3 className="mb-4 font-body text-sm font-bold uppercase tracking-wide text-forest-900">{title}</h3>
      {children}
    </div>
  );
}

/**
 * Desktop-only sidebar (News.jsx hides it below lg) shown alongside the
 * Latest News grid: mini Latest News / Upcoming Events / Important Notices
 * lists, and an Archives-by-year list — the latter drives the same year
 * filter state the search bar above the news grid uses, so clicking here
 * and using the filter bar stay in sync.
 */
export default function NewsSidebar({ news, events, notices, year, onYearChange }) {
  const { t, language } = useLanguage();

  const years = useMemo(() => {
    const counts = new Map();
    news.forEach((item) => {
      const y = new Date(item.date).getFullYear();
      if (Number.isNaN(y)) return;
      counts.set(y, (counts.get(y) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[0] - a[0]);
  }, [news]);

  return (
    <aside className="hidden flex-col gap-5 lg:flex">
      <SidebarPanel title={t("news.sidebarLatestNews")}>
        {news.length === 0 ? (
          <p className="font-body text-xs text-ink-400">{t("news.noResults")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-forest-50">
            {news.slice(0, 4).map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="font-body text-xs font-medium leading-snug text-ink-800">{pick(item.title, language)}</span>
                <span className="shrink-0 font-body text-[11px] text-ink-400">{formatShort(item.date, language)}</span>
              </li>
            ))}
          </ul>
        )}
      </SidebarPanel>

      <SidebarPanel title={t("news.sidebarEvents")}>
        {events.length === 0 ? (
          <p className="font-body text-xs text-ink-400">{t("news.emptyEvents")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-forest-50">
            {events.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="font-body text-xs font-medium leading-snug text-ink-800">{pick(item.name, language)}</span>
                <span className="shrink-0 font-body text-[11px] text-ink-400">{formatShort(item.date, language)}</span>
              </li>
            ))}
          </ul>
        )}
      </SidebarPanel>

      <SidebarPanel title={t("news.sidebarNotices")}>
        {notices.length === 0 ? (
          <p className="font-body text-xs text-ink-400">{t("news.emptyNotices")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-forest-50">
            {notices.slice(0, 3).map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="font-body text-xs font-medium leading-snug text-ink-800">{pick(item.title, language)}</span>
                <span className="shrink-0 font-body text-[11px] text-ink-400">{formatShort(item.date, language)}</span>
              </li>
            ))}
          </ul>
        )}
      </SidebarPanel>

      {years.length > 0 && (
        <SidebarPanel title={t("news.sidebarArchives")}>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onYearChange("All")}
              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 font-body text-xs font-medium transition-colors ${
                year === "All" ? "bg-forest-600 text-white" : "text-ink-700 hover:bg-forest-50"
              }`}
            >
              {t("news.filterAll")}
            </button>
            {years.map(([y, count]) => (
              <button
                key={y}
                type="button"
                onClick={() => onYearChange(String(y))}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 font-body text-xs font-medium transition-colors ${
                  year === String(y) ? "bg-forest-600 text-white" : "text-ink-700 hover:bg-forest-50"
                }`}
              >
                {y}
                <span className={year === String(y) ? "text-white/80" : "text-ink-400"}>{count}</span>
              </button>
            ))}
          </div>
        </SidebarPanel>
      )}
    </aside>
  );
}
