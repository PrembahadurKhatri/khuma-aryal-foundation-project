import { motion } from "framer-motion";
import Container from "./Container.jsx";

/**
 * Full-bleed photo hero used at the top of every inner page (About, Gallery,
 * Projects, News/Notice, ...): a h-[62vh] background photo, a dark gradient
 * + vignette overlay so text stays readable, a small transparent glass pill
 * label top-left (instead of a solid heading placed on the photo), and the
 * same gold-traced curve used on the Home hero. Kept as one shared component
 * so every inner page's hero looks and behaves identically — change it once
 * here and every page picks it up.
 */
export default function PageHero({ label }) {
  return (
    <section className="relative h-[62vh] overflow-hidden">
      <div className="absolute inset-0">
        <img src="/images/khuma.png" alt={label} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/45 to-forest-950/70" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 20% 40%, transparent 30%, rgba(11,31,58,0.55) 100%)" }}
        />
      </div>

      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-gilt-500/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />

      {/* Transparent glass pill, top-left over the photo */}
      <Container className="absolute inset-x-0 top-6 z-10 sm:top-8">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-gilt-400/40 bg-white/10 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gilt-400" />
          {label}
        </motion.span>
      </Container>

      {/* Bottom curve, matching the Home hero's gold-traced wave */}
      <svg className="absolute bottom-0 left-0 block h-10 w-full text-cream-100 sm:h-14" viewBox="0 0 1440 74" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40C240 74 480 74 720 50C960 26 1200 10 1440 34V74H0V40Z" fill="currentColor" />
        <path
          d="M0 40C240 74 480 74 720 50C960 26 1200 10 1440 34"
          fill="none"
          stroke="#C9A227"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 1px 2px rgba(201,162,39,0.45))" }}
        />
      </svg>
    </section>
  );
}
