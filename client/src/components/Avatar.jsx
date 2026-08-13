import { useState } from "react";

const PALETTE = ["bg-forest-600", "bg-gilt-500", "bg-forest-800", "bg-gilt-700", "bg-forest-400"];

function colorForName(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Photo avatar with automatic fallback to a colored initials badge if `src`
 * is empty or fails to load (e.g. the real photo hasn't been added yet).
 */
export default function Avatar({ name, src, size = "md", className = "" }) {
  const [failed, setFailed] = useState(false);

  const sizeClasses = {
    sm: "h-12 w-12 text-sm",
    md: "h-20 w-20 text-lg",
    lg: "h-28 w-28 text-2xl",
    xl: "h-36 w-36 text-3xl",
  }[size];

  const showImage = src && !failed;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full font-body ring-4 ring-cream-50 shadow-card ${sizeClasses} ${className}`}
      title={name}
    >
      {showImage ? (
        <img src={src} alt={name} onError={() => setFailed(true)} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className={`flex h-full w-full items-center justify-center font-body font-semibold text-white ${colorForName(name)}`}>
          {initialsFor(name)}
        </div>
      )}
    </div>
  );
}
