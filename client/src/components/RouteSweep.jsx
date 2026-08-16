import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * A thin gold-to-green gradient bar that sweeps across the very top of the
 * viewport on every route change — a small, distinctive signature flourish
 * (like a progress bar, but purely decorative) that makes navigating
 * between pages feel like something actually happened, on every page.
 */
export default function RouteSweep() {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = setTimeout(() => setActive(false), 650);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={location.pathname}
          className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] origin-left bg-gradient-to-r from-forest-600 via-gilt-400 to-forest-600 shadow-[0_0_12px_rgba(201,166,91,0.6)]"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
        />
      )}
    </AnimatePresence>
  );
}
