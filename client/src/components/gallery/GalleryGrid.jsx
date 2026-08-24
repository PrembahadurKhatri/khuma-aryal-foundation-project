import { useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import PlaceholderImage from "../PlaceholderImage.jsx";
import Lightbox from "./Lightbox.jsx";

export default function GalleryGrid({ images }) {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(null);

  // A single photo in a multi-column grid reads as sparse/lonely (one small
  // tile floating with a lot of empty space next to it) — feature it large
  // instead. Two photos get a matching large-tile treatment for the same
  // reason; the grid only kicks in once there's enough to actually fill it.
  const featured = images.length <= 2;

  return (
    <>
      <div className={featured ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4" : "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"}>
        {images.map((image, idx) => {
          const caption = pick(image.alt, language);
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`group relative overflow-hidden rounded-xl2 border border-forest-100 shadow-card transition-shadow duration-300 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-gilt-500 ${
                featured ? "aspect-[4/3] sm:aspect-square" : "aspect-square"
              }`}
            >
              <PlaceholderImage src={image.src} alt={caption} label={caption} imgClassName="transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="text-xs font-medium text-white">{caption}</span>
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
