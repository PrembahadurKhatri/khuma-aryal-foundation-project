import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import PlaceholderImage from "./PlaceholderImage.jsx";

const TRUNCATE_AT = 130;

export default function StoryCard({ story }) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const summary = pick(story.summary, language);

  const isLong = summary.length > TRUNCATE_AT;
  const shown = isLong && !expanded ? `${summary.slice(0, TRUNCATE_AT).trimEnd()}…` : summary;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl2 border border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative h-48 w-full overflow-hidden">
        <PlaceholderImage src={story.photo} alt={story.name || "Impact story"} label={story.name} />
        <span className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />
        {story.name && (
          <span className="absolute bottom-3 left-4 font-body text-sm font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">{story.name}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <p className="flex-1 font-body text-sm leading-relaxed text-ink-600">{shown}</p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex w-fit items-center gap-1 font-body text-xs font-semibold text-forest-600 transition-transform duration-300 hover:translate-x-0.5"
          >
            {expanded ? t("news.readLess") : t("news.readMore")} →
          </button>
        )}
      </div>
    </div>
  );
}
