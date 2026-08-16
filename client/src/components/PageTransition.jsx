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
      initial={{ opacity: 0, y: 26, scale: 0.985, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, y: -10, scale: 0.99, filter: "blur(4px)", transition: { duration: 0.22, ease: "easeIn" } }}
    >
      {children}
    </motion.div>
  );
}
