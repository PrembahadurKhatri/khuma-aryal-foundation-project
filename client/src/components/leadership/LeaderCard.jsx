import { motion } from "framer-motion";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import Avatar from "../Avatar.jsx";
import SocialLinks from "../SocialLinks.jsx";

/** Supporting leadership voice — deliberately quieter than the Founder/President features. */
export default function LeaderCard({ leader, onRead, delay = 0 }) {
  const { t, language } = useLanguage();
  const name = pick(leader.name, language);
  const title = pick(leader.title, language);
  const message = pick(leader.message, language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-forest-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-gilt-300/70 hover:shadow-lift sm:p-7"
    >
      {/* Decorative glow, same visual language as the site's detail-page
          cards — hidden by default, eases in on hover for a subtle "lit up"
          feel instead of a flat translate/shadow change alone. */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gilt-400/0 blur-2xl transition-all duration-500 group-hover:bg-gilt-400/20"
        aria-hidden="true"
      />

      {/* Large watermark quote mark behind the message text. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-1 top-4 select-none font-body text-8xl font-bold leading-none text-forest-50 transition-colors duration-300 group-hover:text-gilt-50"
      >
        &rdquo;
      </span>

      <div className="relative flex items-center gap-4 pr-8">
        <div className="shrink-0 rounded-full p-0.5 ring-2 ring-gilt-400/50 transition-all duration-300 group-hover:scale-105 group-hover:ring-gilt-400">
          <Avatar name={name} src={leader.photo} fallbackSrc="/images/blank.avif" size="lg" />
        </div>
        <div>
          <p className="font-body text-lg font-bold text-forest-900">{name}</p>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-[#FF8C00]">{title}</p>
          <SocialLinks social={leader.social} className="mt-2" />
        </div>
      </div>

      {/* min-h reserves the same space a full 4-line clamp would take, even
          when a leader's message is short enough not to need clamping --
          without it, cards next to (or stacked above/below, on mobile)
          each other end up visibly different sizes based purely on how
          long each leader's bio happens to be. The "Read Full Message"
          button below already covers seeing the rest either way. */}
      <p className="relative line-clamp-4 min-h-[5.7rem] font-body text-sm leading-relaxed text-ink-900">
        &ldquo;{message}&rdquo;
      </p>

      <button
        type="button"
        onClick={onRead}
        className="group/btn relative mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-gilt-400/60 px-4 py-2 font-body text-sm font-semibold text-forest-900 transition-all duration-300 hover:border-gilt-500 hover:bg-gilt-500 hover:text-white"
      >
        {t("home.readMessage")}
        <span aria-hidden="true" className="transition-transform duration-200 group-hover/btn:translate-x-1">
          →
        </span>
      </button>
    </motion.div>
  );
}
