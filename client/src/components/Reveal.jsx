import { motion } from "framer-motion";

// Each variant's { initial, animate } pair — animate is always the resting
// state (opacity 1, no offset), initial is where it starts from before it
// scrolls into view. "up" (the original/default) now also scales in
// slightly for more punch; the others give pages some variety instead of
// every single section using an identical fade-up.
const VARIANTS = {
  up: (y) => ({ initial: { opacity: 0, y, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 } }),
  left: (y) => ({ initial: { opacity: 0, x: -36, y: y / 2 }, animate: { opacity: 1, x: 0, y: 0 } }),
  right: (y) => ({ initial: { opacity: 0, x: 36, y: y / 2 }, animate: { opacity: 1, x: 0, y: 0 } }),
  scale: () => ({ initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 } }),
  flip: () => ({ initial: { opacity: 0, rotateX: -18, y: 24 }, animate: { opacity: 1, rotateX: 0, y: 0 } }),
};

/**
 * Fades (+ slides/scales/flips, depending on `variant`) content into place
 * the first time it scrolls into view. Thin wrapper around framer-motion so
 * pages don't repeat the same variants by hand.
 */
export default function Reveal({ children, delay = 0, y = 20, className = "", variant = "up" }) {
  const { initial, animate } = (VARIANTS[variant] || VARIANTS.up)(y);
  return (
    <motion.div
      className={className}
      style={{ perspective: variant === "flip" ? 800 : undefined }}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
