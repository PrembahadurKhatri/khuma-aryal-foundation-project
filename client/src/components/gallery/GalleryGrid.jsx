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
// - "large": a plain fixed-column-count grid (not auto-fit/minmax — that
//   approach let tile width vary with exactly how many columns fit at a
//   given viewport width, which read as inconsistent sizing between
//   photos). A fixed column count is what AlbumCard.jsx's own grid already
//   uses for the same reason: every tile is guaranteed the exact same
//   width, full stop, regardless of photo count or window width. Used by
//   AlbumDetail.jsx, a full page whose only job is showcasing an album's
//   photos.
const SIZE_CLASSES = {
  compact: "",
  large: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
};

export default function GalleryGrid({ images, size = "compact" }) {
  const { language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(null);
  const isCompact = size !== "large";

  return (
    <>
      <div
        className={`grid gap-3 sm:gap-4 ${SIZE_CLASSES[size] || ""}`}
        style={isCompact ? { gridTemplateColumns: "repeat(auto-fill, minmax(132px, 132px))" } : undefined}
      >
        {images.map((image, idx) => {
          // `image.alt` is really just the parent content's own title/name,
          // repeated identically across every photo in the set (there's no
          // per-photo caption in the data model) — every caller passes the
          // same string for all of an item's images. Showing that as a
          // hover overlay just repeated the same text on every single photo
          // rather than saying anything about that specific photo, so it's
          // kept only as the <img>'s real `alt` attribute (accessibility,
          // and PlaceholderImage's broken-image fallback text) and no longer
          // rendered as a visible on-photo overlay.
          const caption = pick(image.alt, language);
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="group relative aspect-square overflow-hidden rounded-xl2 border border-forest-100 shadow-card transition-shadow duration-300 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-gilt-500"
            >
              <PlaceholderImage src={image.src} alt={caption} label={caption} imgClassName="transition-transform duration-300 group-hover:scale-105" />
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
