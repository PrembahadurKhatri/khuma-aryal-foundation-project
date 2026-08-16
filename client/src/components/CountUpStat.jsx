import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

// Parses the leading number (with commas) off a stat string like "5,000+"
// or "10+" — everything after the digits (the "+", or anything else the
// admin typed in Settings) is kept as a literal suffix and re-appended
// unchanged once the count finishes.
const NUMBER_RE = /^([\d,]+)(.*)$/;

/**
 * Counts up from 0 to the numeric part of `value` once it scrolls into
 * view (animates only once, same as Reveal's viewport behavior) — used by
 * Home.jsx's stats strip so the numbers feel alive instead of just
 * appearing static.
 */
export default function CountUpStat({ value, duration = 1600 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  const match = String(value ?? "").match(NUMBER_RE);
  const target = match ? Number(match[1].replace(/,/g, "")) : null;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    if (!inView || target === null) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  // Not a recognizable "123+"-style value (unexpected admin input) — just
  // show it verbatim rather than trying to animate nothing.
  if (target === null) {
    return <span ref={ref}>{value}</span>;
  }

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
