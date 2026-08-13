import { useState } from "react";

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
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        loading="lazy"
        className={`h-full w-full object-cover ${imgClassName} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${gradientFor(
        alt || label || src
      )} text-forest-700 ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-9 w-9 opacity-60">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
        <path d="M21 16l-5.5-5.5a1 1 0 0 0-1.4 0L5 19" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span className="px-3 text-center text-xs font-medium opacity-70">{label || alt || "Photo coming soon"}</span>
    </div>
  );
}
