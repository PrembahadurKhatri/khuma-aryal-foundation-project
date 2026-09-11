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
  // YouTube/Vimeo's own embed players are near-always landscape and
  // letterbox correctly inside a 16:9 frame even for the occasional Short.
  // Facebook's video plugin (and any other passthrough embed we don't
  // recognize) has no such guarantee — a portrait clip forced into a 16:9
  // box gets center-cropped by Facebook's player instead of pillarboxed, so
  // those get a taller, portrait-friendly frame instead. Checked against
  // the *raw* URL (not the converted embed src) so this decision doesn't
  // depend on toEmbedUrl's output shape.
  const isLandscapePlatform = video.embedUrl && /youtube\.com|youtu\.be|vimeo\.com/i.test(video.embedUrl);
  // Facebook's plugin needs explicit width/height matching the box it'll
  // actually be displayed in, or it renders its player at its own fixed
  // default size regardless of the real clip's actual shape (see
  // videoEmbed.js) — sized close to a real portrait phone recording
  // (1080x1920) for the portrait box, a plain 16:9 pair otherwise. Ignored
  // by the YouTube/Vimeo branches, which don't take width/height at all.
  const embedSrc = video.embedUrl
    ? toEmbedUrl(video.embedUrl, isLandscapePlatform ? { width: 640, height: 360 } : { width: 380, height: 676 })
    : null;

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
          className="flex max-h-[90vh] w-full max-w-3xl flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {embedSrc ? (
            <div
              className={`w-full overflow-hidden rounded-xl2 bg-black shadow-lift ${
                isLandscapePlatform ? "aspect-video" : "mx-auto aspect-[9/16] max-h-[80vh] max-w-sm"
              }`}
            >
              <iframe
                src={embedSrc}
                title={title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : video.videoFile ? (
            // Directly-uploaded files: size the player to the video's own
            // dimensions (capped to fit the viewport) instead of forcing a
            // 16:9 box, so vertical/portrait clips play uncropped and
            // unstretched, at their original shape.
            <video
              src={video.videoFile}
              controls
              autoPlay
              className="max-h-[80vh] max-w-full rounded-xl2 bg-black shadow-lift"
            />
          ) : null}

          {(title || description) && (
            <div className="mt-4 w-full rounded-xl2 bg-white/5 p-4 text-white backdrop-blur-sm">
              {title && <h3 className="font-body text-base font-semibold">{title}</h3>}
              {description && <p className="mt-1 font-body text-sm leading-relaxed text-white/80">{description}</p>}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
