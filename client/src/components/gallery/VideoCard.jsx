import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import PlaceholderImage from "../PlaceholderImage.jsx";

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path d="M11 4h6a3 3 0 0 1 3 3v6l-9 9-9-9 9-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-6 w-6" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

// Video thumbnail with a centered play button and duration badge (styled
// after a reference video-gallery screenshot), then the same title/category/
// description footer AlbumCard uses for photo albums, so a Video card reads
// as a sibling of an Album card rather than a different design language.
export default function VideoCard({ video, onPlay }) {
  const { t, language } = useLanguage();
  const title = pick(video.title, language);
  const description = pick(video.description, language);
  const category = video.category || "Event";

  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl2 border border-forest-100 bg-white text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-gilt-500"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-forest-950">
        <PlaceholderImage src={video.thumbnail} alt={title} label={title} imgClassName="transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-forest-950/5 to-transparent" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gilt-500 text-forest-950 shadow-lift transition-transform duration-300 group-hover:scale-110">
            <PlayIcon />
          </span>
        </span>
        {video.duration && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 font-body text-[11px] font-semibold text-white backdrop-blur-sm">
            {video.duration}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="inline-flex w-fit items-center gap-1 font-body text-xs font-semibold text-forest-600">
          <TagIcon />
          {t(`gallery.category${category}`)}
        </span>
        <h3 className="font-body text-base font-semibold leading-snug text-ink-900">{title}</h3>
        {description && <p className="line-clamp-2 flex-1 font-body text-sm leading-relaxed text-ink-600">{description}</p>}
      </div>
    </button>
  );
}
