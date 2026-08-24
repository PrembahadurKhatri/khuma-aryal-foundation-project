import { Link } from "react-router-dom";

const VARIANTS = {
  // Emerald Forest (forest-600) is the site's action color — every primary call-to-action uses it.
  primary: "bg-forest-600 text-white hover:bg-forest-700 shadow-soft",
  // Champagne gold is a rare, premium highlight — reserved for a single standout CTA (e.g. Donate).
  gilt: "bg-gilt-500 text-white hover:bg-gilt-600 shadow-soft",
  outline: "border-2 border-white/70 text-white hover:bg-white hover:text-forest-800",
  ghost: "border-2 border-forest-200 text-forest-700 hover:border-forest-600 hover:bg-forest-50",
};

// Diagonal light sweep that slides across on hover — shared by every button
// variant so the whole site's CTAs get the same little flourish rather than
// just sitting there with a flat color change. Exported (not just used
// internally) so non-Button elements that want the identical effect — the
// Navbar links, the Home page's "Read More" pills — can reuse the exact
// same sweep instead of a near-duplicate. The parent needs `group relative
// overflow-hidden` for it to clip and trigger correctly.
export function Shine() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 z-0 w-1/3 -translate-x-[200%] -skew-x-12 bg-white/25 transition-transform duration-700 ease-out group-hover:translate-x-[380%]"
    />
  );
}

/** Renders a <Link> when `to` is given, an <a> when `href` is given, else a <button>. */
export default function Button({ children, to, href, onClick, type = "button", variant = "primary", className = "" }) {
  const classes = `group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0 active:duration-100 ${VARIANTS[variant]} ${className}`;
  const content = (
    <>
      <Shine />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
