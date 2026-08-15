import { motion } from "framer-motion";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { pick } from "../../utils/localize.js";
import Avatar from "../Avatar.jsx";

/** Supporting leadership voice — deliberately quieter than the Founder/President features. */
export default function LeaderCard({ leader, onRead, delay = 0 }) {
  const { t, language } = useLanguage();
  const name = pick(leader.name, language);
  const title = pick(leader.title, language);
  const message = pick(leader.message, language);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col gap-5 rounded-2xl border border-forest-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gilt-300/60 hover:shadow-lift sm:p-7"
    >
     

      <div className="flex items-center gap-4 pr-8">
        <div className="shrink-0 rounded-full p-0.5 ring-2 ring-gilt-400/50 transition-transform duration-300 group-hover:scale-105">
          <Avatar name={name} src={leader.photo} size="lg" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-forest-900">{name}</p>
          <p className="font-body text-xs font-semibold uppercase tracking-wide text-gilt-600">{title}</p>

        </div>
      </div>

      <p className="line-clamp-4 font-body text-sm leading-relaxed text-ink-900">&ldquo;{message}&rdquo;</p>

      <button
        type="button"
        onClick={onRead}
        className="group/btn mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-gilt-400/60 px-4 py-2 font-body text-sm font-semibold text-forest-900 transition-colors hover:border-gilt-500 hover:bg-gilt-50"
      >
        {t("home.readMessage")}
        <span aria-hidden="true" className="transition-transform duration-200 group-hover/btn:translate-x-1">
          →
        </span>
      </button>
    </motion.div>
  );
}
