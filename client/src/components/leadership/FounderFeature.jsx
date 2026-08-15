import { motion } from "framer-motion";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import { useSiteInfo } from "../../contexts/SiteInfoContext.jsx";
import PlaceholderImage from "../PlaceholderImage.jsx";

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 " aria-hidden="true">
      <path d="M4 5.5C4 4.67 4.67 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 5.5c0-.83-.67-1.5-1.5-1.5H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The Founder's message — the single most visually important block in the
 * section: a large light ivory card, a framed gold-bordered portrait, a
 * decorative gold quote mark, and a solid navy "Read Full Message" button.
 * Everything else in Leadership & Messages is deliberately quieter.
 */
export default function FounderFeature({ leader, onRead }) {
  const { t, language } = useLanguage();
  const siteInfo = useSiteInfo();
  if (!leader) return null;

  const name = pick(leader.name, language);
  const title = pick(leader.title, language);
  const message = pick(leader.message, language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-xl3 border border-forest-100 bg-white p-6 shadow-lift sm:p-8 lg:p-10"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
        {/* Portrait */}
        <div className="mx-auto w-full max-w-sm">
          <div className="aspect-[4/5] overflow-hidden rounded-xl2 border-2 border-gilt-400/70 shadow-card">
            <PlaceholderImage src={leader.photo} alt={name} label={name} />
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-5 font-body">
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="font-body text-5xl leading-none text-gilt-500">
              &ldquo;
            </span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-gilt-600">
              {t("home.messageFromFounder")}
            </span>
          </div>

          <p className="font-body text-lg leading-relaxed text-forest-900 sm:text-xl">
            &ldquo;{message}&rdquo;
          </p>

        

          <div>
            <p className="font-body text-lg font-bold text-forest-900">{name}</p>
            <p className="text-sm text-ink-600">{title}</p>
            <p className="text-sm text-ink-600">{pick(siteInfo.name, language)}</p>
          </div>

          <button
            type="button"
            onClick={onRead}
            className="group mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-forest-900 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-forest-800"
          >
            <BookIcon />
            {t("home.readFullMessage")}
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
