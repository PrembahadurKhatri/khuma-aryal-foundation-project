import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import PlaceholderImage from "./PlaceholderImage.jsx";

// Card only ever shows a preview — "Read More" opens the full story on its
// own page (StoryDetail.jsx) rather than expanding in place.
const TRUNCATE_AT = 130;

export default function StoryCard({ story }) {
  const { t, language } = useLanguage();
  const name = pick(story.name, language);
  const summary = pick(story.summary, language);
  const shown = summary.length > TRUNCATE_AT ? `${summary.slice(0, TRUNCATE_AT).trimEnd()}…` : summary;

  return (
    <Link
      to={`/stories/${story.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl2 border border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <PlaceholderImage src={story.photo} alt={name || "Impact story"} label={name} imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />
        {name && (
          <span className="absolute bottom-3 left-4 font-body text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">{name}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <p className="flex-1 font-body text-sm leading-relaxed text-ink-600">{shown}</p>
        <span className="inline-flex w-fit items-center gap-1 font-body text-xs font-semibold text-forest-600 transition-transform duration-300 group-hover:translate-x-0.5">
          {t("news.readMore")} →
        </span>
      </div>
    </Link>
  );
}
