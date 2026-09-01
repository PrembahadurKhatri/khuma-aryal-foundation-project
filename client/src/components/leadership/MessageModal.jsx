import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import Avatar from "../Avatar.jsx";

/** Full, untruncated leader message — opened from "Read Message →" links. */
export default function MessageModal({ leader, onClose }) {
  const { t, language } = useLanguage();

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!leader) return null;

  const name = pick(leader.name, language);
  const title = pick(leader.title, language);
  const message = pick(leader.message, language);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-950/70 p-4 backdrop-blur-sm sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-label={name}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl3 bg-cream-50 p-8 shadow-lift sm:p-12"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-forest-100 text-ink-600 transition-colors hover:border-gilt-400 hover:text-forest-900"
          >
            ✕
          </button>

          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
            <Avatar name={name} src={leader.photo} fallbackSrc="/images/blank.avif" size="xl" />
            <div>
              <span className="font-body text-5xl leading-none text-[#FF8C00]">&ldquo;</span>
              <h3 className="font-body text-xl font-semibold text-forest-900">{name}</h3>
              <p className="text-sm font-medium uppercase tracking-wide text-[#FF8C00]">{title}</p>
            </div>
          </div>

          <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-ink-800 sm:text-lg">{message}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
