import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "./Container.jsx";

const SLIDE_INTERVAL = 3000;

/**
 * Full-bleed photo hero used at the top of every inner page (About, Gallery,
 * Projects, News/Notice, ...): a h-[62vh] background photo, a dark gradient
 * + vignette overlay so text stays readable, a small transparent glass pill
 * label top-left (instead of a solid heading placed on the photo), and the
 * same gold-traced curve used on the Home hero. Kept as one shared component
 * so every inner page's hero looks and behaves identically — change it once
 * here and every page picks it up.
 *
 * Pass `images` (an array of URLs) to get the same auto-sliding crossfade
 * the Home hero uses (see components/Hero.jsx) instead of one static photo —
 * used by Gallery.jsx. Omit it (or pass a single-item array) to keep the
 * plain static photo every other page uses.
 */
export default function PageHero({ label, images }) {
  const slides = images && images.length > 0 ? images : ["/images/khumalogo.png"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  return (
    <section className="relative h-[62vh] overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={index}
            src={slides[index]}
            alt={label}
            initial={slides.length > 1 ? { x: "100%", opacity: 0 } : false}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        {/* Kept light on purpose so the photo reads as a real, natural photo
            rather than a green-tinted wash — the label pill has its own
            glass background/blur below, so it stays legible without the
            whole image needing to be darkened for contrast. */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/55 via-forest-950/5 to-forest-950/25" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 20% 40%, transparent 30%, rgba(23,59,37,0.2) 100%)" }}
        />
      </div>

      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-gilt-500/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />

      {/* Glass pill, top-left over the photo. Background is a dark
          forest tint (not plain white/10) specifically so the white label
          text stays legible even over bright/white-heavy photos (e.g. the
          News page's kafnews.png) — it can't rely on the gradient overlay
          above alone, since that's deliberately kept light. */}
      <Container className="absolute inset-x-0 top-6 z-10 sm:top-8">
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-gilt-400/40 bg-forest-950/55 px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-soft backdrop-blur-md"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gilt-400" />
          {label}
        </motion.span>
      </Container>

      {/* Bottom curve — a layered wave shared by every hero section (Home,
          About, Gallery, Projects, News). The green + gold curve shares the
          exact same control points as the cream curve, only its two
          endpoints are pulled further out — with a cubic bezier that makes
          the gap between them largest right at the two corners and shrink
          to almost nothing by the middle, instead of a band of constant
          thickness running the full width. */}
      <svg className="absolute bottom-0 left-0 block h-16 w-full sm:h-24" viewBox="0 0 1440 74" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 6C420 90 1020 -10 1440 34V74H0V6Z" className="fill-forest-800" />
        <path
          d="M0 6C420 90 1020 -10 1440 34"
          fill="none"
          stroke="#C9A65B"
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 1px 2px rgba(201,166,91,0.45))" }}
        />
        <path d="M0 20C420 90 1020 -10 1440 48V74H0V20Z" className="fill-cream-100" />
      </svg>
    </section>
  );
}
