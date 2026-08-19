import { motion } from "framer-motion";

/**
 * Wraps each routed page (see MainLayout.jsx) so navigating between pages
 * gets a real transition instead of an instant hard cut — a soft blur+scale
 * crossfade with a little vertical drift, timed to overlap with the gold
 * RouteSweep bar's own animation.
 */
// Asymmetric timing on purpose — with mode="wait" (see MainLayout.jsx) the
// outgoing page's exit must fully finish before the incoming one starts, so
// a slow exit + slow entrance would make every navigation feel sluggish.
// The exit is quick (get out of the way), the entrance is the showier half.
export default function PageTransition({ children }) {
  return (
    <motion.div
      // Pure opacity fade — no `y`/`scale`/`blur`. Any of those force the
      // whole routed page onto its own GPU-composited layer for the
      // duration of the animation, and while that layer is active the
      // Hero section's curved SVG (dark fill + gold stroke + cream fill
      // stacked on top of each other) shows a hairline seam at its
      // boundary with the next section — sub-pixel rounding from the
      // transform, not a spacing/z-index bug. It only clears once the
      // transform settles and the layer is dropped, hence "line appears
      // during the transition, gone once it finishes." Opacity alone
      // doesn't force that layer promotion, so the seam never appears.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
    >
      {children}
    </motion.div>
  );
}
