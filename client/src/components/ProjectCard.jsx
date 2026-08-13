import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import PlaceholderImage from "./PlaceholderImage.jsx";

export default function ProjectCard({ project }) {
  const { t, language } = useLanguage();
  const title = pick(project.title, language);
  const description = pick(project.description, language);
  const cover = project.images?.[0];

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl2 border border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative h-48 w-full overflow-hidden">
        <PlaceholderImage src={cover} alt={title} label={title} imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-soft ${
            project.status === "ongoing" ? "bg-forest-600 text-white" : "bg-ink-600 text-white"
          }`}
        >
          {project.status === "ongoing" ? t("common.ongoing") : t("common.completed")}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-display text-lg font-semibold text-forest-900">{title}</h3>
        <p className="flex-1 text-sm leading-relaxed text-ink-600">{description}</p>
      </div>
    </article>
  );
}
