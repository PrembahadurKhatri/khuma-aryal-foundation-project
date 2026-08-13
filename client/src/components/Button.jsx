import { Link } from "react-router-dom";

const VARIANTS = {
  // Emerald Forest (forest-600) is the site's action color — every primary call-to-action uses it.
  primary: "bg-forest-600 text-white hover:bg-forest-700 shadow-soft",
  // Champagne gold is a rare, premium highlight — reserved for a single standout CTA (e.g. Donate).
  gilt: "bg-gilt-500 text-white hover:bg-gilt-600 shadow-soft",
  outline: "border-2 border-white/70 text-white hover:bg-white hover:text-forest-800",
  ghost: "border-2 border-forest-200 text-forest-700 hover:border-forest-600 hover:bg-forest-50",
};

/** Renders a <Link> when `to` is given, an <a> when `href` is given, else a <button>. */
export default function Button({ children, to, href, onClick, type = "button", variant = "primary", className = "" }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 ${VARIANTS[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
