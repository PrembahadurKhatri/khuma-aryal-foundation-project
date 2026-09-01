import { useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import PlaceholderImage from "../PlaceholderImage.jsx";
import Lightbox from "./Lightbox.jsx";

// Two sizing modes for two genuinely different contexts:
// - "compact" (default): fixed 132px tiles that never stretch, via
//   auto-fill. Used embedded inside Notice/Event/Project/Story detail
//   pages, sharing space with other content — a couple of photos there
//   should sit as a modest row, not dominate the column.
// - "large": a responsive auto-fit grid that grows tiles to fill the row
//   (up to a cap) when there are few photos. Used by AlbumDetail.jsx, a
//   full page whose only job is showcasing this album's photos — a
//   handful of photos there should read as a proper gallery, not a
//   leftover strip of small thumbnails floating in mostly empty page.
const SIZE_STYLES = {
  compact: { gridTemplateColumns: "repeat(auto-fill, minmax(132px, 132px))" },
  large: { gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" },
};

export default function GalleryGrid({ images, size = "compact" }) {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <>
      <div className="grid gap-3 sm:gap-4" style={SIZE_STYLES[size] || SIZE_STYLES.compact}>
        {images.map((image, idx) => {
          const caption = pick(image.alt, language);
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="group relative aspect-square overflow-hidden rounded-xl2 border border-forest-100 shadow-card transition-shadow duration-300 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-gilt-500"
            >
              <PlaceholderImage src={image.src} alt={caption} label={caption} imgClassName="transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="text-xs font-medium text-white line-clamp-2">{caption}</span>
              </span>
            </button>
          );
        })}
      </div>

      {activeIndex !== null && (
        <Lightbox images={images} index={activeIndex} onClose={() => setActiveIndex(null)} onNavigate={setActiveIndex} />
      )}
    </>
  );
}
