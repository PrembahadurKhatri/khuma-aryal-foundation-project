import { motion } from "framer-motion";

/**
 * Fades + slides content up into place the first time it scrolls into view.
 * Thin wrapper around framer-motion so pages don't repeat the same variants.
 */
export default function Reveal({ children, delay = 0, y = 20, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
