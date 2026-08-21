import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "./Container.jsx";

const SLIDE_INTERVAL = 3000;

/**
 * Full-bleed hero used at the top of every inner page (About, Gallery,
 * Projects, News/Notice, ...): a h-[62vh] background, a small transparent
 * glass pill label top-left (instead of a solid heading placed on the
 * photo), and the same gold-traced curve used on the Home hero. Kept as one
 * shared component so every inner page's hero looks and behaves identically
 * — change it once here and every page picks it up.
 *
 * Pass `images` (an array of URLs) to get the same auto-sliding crossfade
 * the Home hero uses (see components/Hero.jsx) instead of one static photo —
 * used by Gallery.jsx. Omit it (or pass a single-item array) to keep the
 * plain static photo every other page uses.
 *
 * Pass `colorBackground` to skip the photo entirely and use a solid
 * gradient instead — the same dark forest gradient as About.jsx's Contact
 * section (`from-forest-950 via-forest-900 to-forest-800`), for pages that
 * want a calmer, photo-free hero. `description` adds a line of real copy
 * under the label pill (most pages only show the small kicker-style label).
 *
 * Pass `title` for a full premium hero treatment: `label` becomes a small
 * kicker pill, `title` renders as a large heading below it (with a gold
 * accent bar), then `description`, then an optional `badges` row of small
 * glass pills (same look as the Home hero's trust strip). Content is
 * vertically centered instead of pinned to the top-left, since there's
 * enough copy to anchor the section on its own. Pages that only pass
 * `label` keep the original compact top-left pill, unchanged.
 *
 * `titleHighlight` colors a substring of `title` gold instead of white
 * (must be an exact substring — silently ignored otherwise).
 *
 * `badges` accepts either plain strings (small glass pills) or
 * `{ icon, label }` objects (small square icon cards, icon on top of a
 * one/two-line label) — the two can't be mixed within one array.
 *
 * `strongOverlay` swaps the default light, top/bottom-only photo tint for a
 * fuller, more saturated forest-green wash — for backgrounds that need a
 * deliberate, uniform tint to read as intentional (e.g. a pale logo/graphic
 * rather than a natural photo) instead of the light default meant to keep a
 * real photo's subjects visible.
 */
export default function PageHero({ label, images, colorBackground = false, title, titleHighlight, description, badges, strongOverlay = false, hideLabel = false }) {
  const slides = images && images.length > 0 ? images : ["/images/khumalogo.png"];
  const [index, setIndex] = useState(0);

  const [titleBefore, titleAfter] =
    titleHighlight && title?.includes(titleHighlight) ? title.split(titleHighlight) : [title, null];

  const badgesAreIcons = badges && badges.length > 0 && typeof badges[0] === "object";

  useEffect(() => {
    if (colorBackground || slides.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, colorBackground]);

  return (
    <section className="relative h-[62vh] overflow-hidden">
      <div className="absolute inset-0">
        {colorBackground ? (
          <div className="absolute inset-0 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800" />
        ) : (
          <>
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
            {strongOverlay ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-forest-950/92 via-forest-950/70 to-forest-950/40" />
                <div className="absolute inset-0 bg-forest-900/30 mix-blend-multiply" />
              </>
            ) : (
              // Kept light on purpose so the photo reads as a real, natural
              // photo rather than a green-tinted wash — the label pill has
              // its own glass background/blur below, so it stays legible
              // without the whole image needing to be darkened for contrast.
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/55 via-forest-950/5 to-forest-950/25" />
                <div
                  className="absolute inset-0"
                  style={{ background: "radial-gradient(120% 90% at 20% 40%, transparent 30%, rgba(23,59,37,0.2) 100%)" }}
                />
              </>
            )}
          </>
        )}
      </div>

      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-gilt-500/15 blur-3xl" aria-hidden="true" />
      {colorBackground && <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-forest-400/20 blur-3xl" aria-hidden="true" />}
      <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />

      {/* Glass pill. Background is a dark forest tint (not plain white/10)
          specifically so the white label text stays legible even over
          bright/white-heavy photos — it can't rely on the gradient overlay
          above alone, since that's deliberately kept light. */}
      <Container
        className={
          title
            ? "absolute inset-0 z-10 flex flex-col items-start justify-center gap-4"
            : "absolute inset-x-0 top-6 z-10 flex flex-col items-start gap-3 sm:top-8"
        }
      >
        {/* `label` still drives the image's `alt` text either way — `hideLabel`
            only skips the visible pill (e.g. NewsDetail, where the headline
            would otherwise be shown twice: once here, once in the article body). */}
        {!hideLabel && (
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
        )}

        {title && (
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="max-w-2xl font-body text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.35)" }}
          >
            {titleAfter !== null ? (
              <>
                {titleBefore}
                <span className="text-gilt-400">{titleHighlight}</span>
                {titleAfter}
              </>
            ) : (
              title
            )}
          </motion.h1>
        )}

        {description && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: title ? 0.2 : 0.1 }}
            className={`font-body leading-relaxed text-white/85 ${title ? "max-w-xl text-base sm:text-lg" : "max-w-lg text-sm sm:text-base"}`}
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}
          >
            {description}
          </motion.p>
        )}

      </Container>

      {/* Badges row — anchored bottom-center rather than stacked under the
          label/title, so it reads as its own row of section shortcuts
          sitting low in the photo instead of crowding the kicker/title
          block up top. Only News.jsx passes `badges` today. */}
      {badges && badges.length > 0 && (
        <div className="absolute inset-x-0 bottom-20 z-10 flex justify-center px-4 sm:bottom-24">
          <div className="flex flex-wrap justify-center gap-2.5">
            {badgesAreIcons
              ? badges.map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.36 + i * 0.08 }}
                    className="flex w-[4.5rem] flex-col items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-2 py-3 text-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-gilt-400/60 hover:bg-white/20 hover:shadow-lift sm:w-20"
                  >
                    <span className="text-white transition-colors duration-300">{badge.icon}</span>
                    <span className="font-body text-[10px] font-semibold leading-tight text-white sm:text-[11px]">{badge.label}</span>
                  </motion.div>
                ))
              : badges.map((badge, i) => (
                  <motion.span
                    key={badge}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.36 + i * 0.08 }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-body text-xs font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-gilt-400/60 hover:bg-white/20 hover:shadow-lift"
                  >
                    {badge}
                  </motion.span>
                ))}
          </div>
        </div>
      )}

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
