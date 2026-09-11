// Small inline spinner for in-flight admin actions — dropped into a submit
// button next to its "Saving…"/"Uploading…" label so it's obvious at a
// glance (not just from text) that the click registered and the admin
// should wait rather than press the button again.
export default function Spinner({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
