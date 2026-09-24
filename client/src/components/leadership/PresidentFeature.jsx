import { motion } from "framer-motion";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import { useSiteInfo } from "../../contexts/SiteInfoContext.jsx";
import PlaceholderImage from "../PlaceholderImage.jsx";
import Button from "../Button.jsx";

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 5.5C4 4.67 4.67 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 5.5c0-.83-.67-1.5-1.5-1.5H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The President's message — the second-strongest block. Same light ivory
 * card, framed portrait, gold quote mark and navy button as the Founder's,
 * but the layout mirrors it (photo/content swap sides on desktop) so the
 * pair reads as a matched set with its own rhythm rather than one repeated
 * template.
 */
export default function PresidentFeature({ leader, onRead }) {
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
      className="group relative overflow-hidden rounded-xl3 border border-forest-100 bg-white p-6 shadow-lift transition-shadow duration-500 hover:shadow-2xl sm:p-8 lg:p-10"
    >
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gilt-400/10 blur-3xl transition-transform duration-700 group-hover:scale-110"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-forest-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
        {/* Portrait — first in the DOM (so it's on top on mobile), pushed to
            the right on desktop. Capped smaller on mobile than the
            sm:/desktop size (max-w-sm/384px read as oversized on a narrow
            phone screen, dwarfing the message text below it). Unchanged
            from sm: up. */}
        <div className="order-1 mx-auto w-full max-w-[220px] sm:max-w-sm lg:order-2">
          <div className="aspect-[4/5] overflow-hidden rounded-xl2 border-2 border-gilt-400/70 shadow-card transition-transform duration-500 group-hover:scale-[1.02]">
            {/* Falls back to a real placeholder photo, not PlaceholderImage's
                gradient card — an admin who hasn't uploaded the President's
                photo yet still gets a proper-looking portrait silhouette. */}
            <PlaceholderImage src={leader.photo || "/images/blank.avif"} alt={name} label={name} />
          </div>
        </div>

        {/* Message */}
        <div className="order-2 flex flex-col gap-5 font-body lg:order-1">
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="font-body text-5xl leading-none text-[#FF8C00]">
              &ldquo;
            </span>
            <span className="mt-2 text-sm font-semibold font-body uppercase tracking-[0.25em] text-[#FF8C00]">
              {t("home.messageFromPresident")}
            </span>
          </div>

          {/* Clamped at every breakpoint now, not just mobile -- previously
              un-clamped from sm: up, but that let the Founder and President
              cards (each with a different-length message) end up visibly
              different heights on desktop. The "Read Full Message" button
              below is the whole point of not needing the entire
              essay-length message rendered inline. min-h reserves the same
              space a full clamp would take even for a shorter message, so
              a short bio doesn't shrink the card either. */}
          <p className="line-clamp-5 min-h-[9.15rem] font-body text-lg leading-relaxed text-forest-900 sm:min-h-[10.2rem] sm:text-xl">
            &ldquo;{message}&rdquo;
          </p>

        
          <div>
            <p className="font-body text-lg font-bold text-forest-900">{name}</p>
            <p className="text-sm text-ink-600">{title}</p>
            <p className="text-sm text-ink-600">{pick(siteInfo.name, language)}</p>
          </div>

          <Button type="button" onClick={onRead} variant="primary" className="mt-1 w-fit">
            <BookIcon />
            {t("home.readFullMessage")}
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
