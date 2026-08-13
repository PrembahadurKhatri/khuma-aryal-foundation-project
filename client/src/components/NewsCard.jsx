import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

export default function NewsCard({ news }) {
  const { language } = useLanguage();
  const title = pick(news.title, language);
  const description = pick(news.description, language);

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

  return (
    <article className="flex flex-col gap-3 rounded-xl2 border border-forest-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <span className="w-fit rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">{formatted}</span>
      <h3 className="font-display text-lg font-semibold text-forest-900">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-600">{description}</p>
    </article>
  );
}
