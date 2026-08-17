import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const DISPLAY_DURATION = 750;

/**
 * A full-screen white flash with the foundation logo doing a quick coin-flip
 * on every route change — a branded splash moment between pages, layered on
 * top of (not instead of) RouteSweep's top bar and PageTransition's page
 * crossfade in MainLayout.jsx. Briefly blocks interaction with the outgoing
 * page on purpose, so it reads as a deliberate loading beat rather than a
 * decoration you can click straight through.
 */
export default function LogoFlipOverlay() {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = setTimeout(() => setActive(false), DISPLAY_DURATION);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={location.pathname}
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800"
          style={{ perspective: 900 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
        >
          <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-forest-400/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-gilt-500/15 blur-3xl" aria-hidden="true" />
          {/* Soft glow right behind the logo so the flip has some depth */}
          <div className="pointer-events-none absolute h-44 w-44 rounded-full bg-gilt-400/25 blur-3xl" aria-hidden="true" />

          <motion.div
            initial={{ rotateY: 0, scale: 0.6, opacity: 0 }}
            animate={{
              rotateY: [0, 180, 360],
              scale: [0.6, 1.12, 1],
              opacity: 1,
            }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-20 w-20 overflow-hidden rounded-full shadow-lift ring-4 ring-gilt-400/40 sm:h-24 sm:w-24"
          >
            <img src="/images/logo.jpg" alt="Khuma Aryal Foundation" className="h-full w-full object-cover" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
