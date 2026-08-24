import { useState } from "react";
import { withAutoFormat } from "../utils/cloudinaryUrl.js";

const GRADIENTS = [
  "from-forest-200 via-forest-100 to-cream-100",
  "from-gilt-200 via-gilt-100 to-cream-100",
  "from-forest-300 via-cream-100 to-gilt-100",
  "from-cream-200 via-forest-100 to-forest-200",
];

function gradientFor(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

/** Image with automatic fallback to a soft gradient placeholder card. */
export default function PlaceholderImage({ src, alt, label, className = "", imgClassName = "" }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  if (showImage) {
    return (
      <img
        src={withAutoFormat(src)}
        alt={alt}
        onError={() => setFailed(true)}
        loading="lazy"
        className={`h-full w-full object-cover ${imgClassName} ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center gap-2.5 overflow-hidden bg-gradient-to-br ${gradientFor(
        alt || label || src
      )} text-forest-700 ${className}`}
    >
      {/* Soft radial highlight — keeps the flat gradient from reading as an
          inert "broken" tile even when the card is large. */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/30 blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/20 blur-2xl" aria-hidden="true" />

      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/50 shadow-sm ring-1 ring-white/60">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <rect x="3" y="4.5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8.5" cy="9.5" r="1.4" fill="currentColor" />
          <path d="M21 15.5l-5-4.5a1.1 1.1 0 0 0-1.5.05L8 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="relative px-3 text-center text-xs font-medium font-body opacity-75">{label || alt || "Photo coming soon"}</span>
    </div>
  );
}
