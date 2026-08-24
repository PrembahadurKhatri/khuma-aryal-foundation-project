import { useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import PlaceholderImage from "../PlaceholderImage.jsx";
import Lightbox from "./Lightbox.jsx";

// Tiles are capped at a fixed size and left-aligned (not stretched to fill
// the row) via auto-fill — a set of 1-2 photos sits as a compact, modestly
// sized row instead of stretching into oversized tiles on a wide desktop
// container, while a full set still packs neatly edge-to-edge.
const TILE = 132;

export default function GalleryGrid({ images }) {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <>
      <div
        className="grid gap-3 sm:gap-4"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${TILE}px, ${TILE}px))` }}
      >
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
