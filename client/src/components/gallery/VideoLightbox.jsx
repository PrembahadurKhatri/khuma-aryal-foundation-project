import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import { toEmbedUrl } from "../../utils/videoEmbed.js";

// Same modal chrome as Lightbox.jsx (photos) — dark backdrop, top-right
// close button, centered content box — swapped to a 16:9 video player: an
// <iframe> for an embedded link, or a native <video> for a directly-
// uploaded file.
export default function VideoLightbox({ video, onClose }) {
  const { t, language } = useLanguage();

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!video) return null;
  const title = pick(video.title, language);
  const description = pick(video.description, language);
  const embedSrc = video.embedUrl ? toEmbedUrl(video.embedUrl) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-950/90 p-4 sm:p-8"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label={t("common.close")}
        >
          ✕
        </button>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-xl2 bg-black shadow-lift">
            {embedSrc ? (
              <iframe
                src={embedSrc}
                title={title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : video.videoFile ? (
              <video src={video.videoFile} controls autoPlay className="h-full w-full" />
            ) : null}
          </div>
          {(title || description) && (
            <div className="mt-4 rounded-xl2 bg-white/5 p-4 text-white backdrop-blur-sm">
              {title && <h3 className="font-body text-base font-semibold">{title}</h3>}
              {description && <p className="mt-1 font-body text-sm leading-relaxed text-white/80">{description}</p>}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
