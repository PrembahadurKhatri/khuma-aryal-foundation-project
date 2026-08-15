import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import PlaceholderImage from "./PlaceholderImage.jsx";

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path d="M11 4h6a3 3 0 0 1 3 3v6l-9 9-9-9 9-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

const STATUS_TONE = {
  ongoing: "bg-forest-600 text-white",
  completed: "bg-ink-600 text-white",
  upcoming: "bg-gilt-500 text-white",
};

// Links through to ProjectDetail.jsx, which shows the full description and
// every photo attached to the project (same GalleryGrid/Lightbox pattern
// AlbumDetail.jsx uses for gallery albums).
export default function ProjectCard({ project }) {
  const { t, language } = useLanguage();
  const title = pick(project.title, language);
  const description = pick(project.description, language);
  const cover = project.images?.[0];
  const status = project.status || "ongoing";
  const category = project.category || "Event";

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl2 border border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-gilt-500"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <PlaceholderImage src={cover} alt={title} label={title} imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-soft ${STATUS_TONE[status] || STATUS_TONE.ongoing}`}>
          {t(`common.${status}`)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-6">
        <span className="inline-flex w-fit items-center gap-1 font-body text-xs font-semibold text-forest-600">
          <TagIcon />
          {t(`gallery.category${category}`)}
        </span>
        <h3 className="font-body text-lg font-semibold text-forest-900">{title}</h3>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-ink-600">{description}</p>
      </div>
    </Link>
  );
}
