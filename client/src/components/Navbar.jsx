import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import Container from "./Container.jsx";
import { Shine } from "./Button.jsx";
import { useSiteInfo } from "../contexts/SiteInfoContext.jsx";

// Same icon set as Footer.jsx's SOCIAL_ICONS (kept separate rather than
// shared, matching how About.jsx already has its own copy in this codebase).
const SOCIAL_ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M13.5 21v-8.2h2.75l.41-3.2H13.5V7.4c0-.93.26-1.56 1.6-1.56h1.7V2.98A22.7 22.7 0 0 0 14.5 2.85c-2.42 0-4.08 1.48-4.08 4.2v2.55H7.65v3.2h2.77V21h3.08Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M12 2.2c2.7 0 3 .01 4.1.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.64.25-1.37.42-2.43.47-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.21 15 2.2 14.7 2.2 12s.01-3 .06-4.1c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 0 1 5.65 2.55c.64-.25 1.37-.42 2.43-.47C9.18 2.03 9.48 2.02 12 2.02Zm0 1.8c-2.66 0-2.97.01-4.02.06-.86.04-1.33.18-1.64.3-.41.16-.71.35-1.02.66-.31.31-.5.61-.66 1.02-.12.31-.26.78-.3 1.64-.05 1.05-.06 1.36-.06 4.02s.01 2.97.06 4.02c.04.86.18 1.33.3 1.64.16.41.35.71.66 1.02.31.31.61.5 1.02.66.31.12.78.26 1.64.3 1.05.05 1.36.06 4.02.06s2.97-.01 4.02-.06c.86-.04 1.33-.18 1.64-.3.41-.16.71-.35 1.02-.66.31-.31.5-.61.66-1.02.12-.31.26-.78.3-1.64.05-1.05.06-1.36.06-4.02s-.01-2.97-.06-4.02c-.04-.86-.18-1.33-.3-1.64a2.76 2.76 0 0 0-.66-1.02 2.76 2.76 0 0 0-1.02-.66c-.31-.12-.78-.26-1.64-.3C14.97 4.01 14.66 4 12 4Zm0 3.38A4.62 4.62 0 1 1 7.38 12 4.62 4.62 0 0 1 12 7.38Zm0 1.8A2.82 2.82 0 1 0 14.82 12 2.82 2.82 0 0 0 12 9.18Zm4.8-2.02a1.08 1.08 0 1 1-1.08-1.08 1.08 1.08 0 0 1 1.08 1.08Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M21.6 7.2s-.21-1.48-.86-2.14c-.82-.86-1.74-.87-2.16-.92C15.6 4 12 4 12 4h-.01s-3.6 0-6.58.14c-.42.05-1.34.06-2.16.92-.65.66-.86 2.14-.86 2.14S2.18 8.94 2.18 10.68v1.53c0 1.74.21 3.48.21 3.48s.21 1.48.86 2.14c.82.86 1.9.83 2.38.92 1.72.16 7.37.21 7.37.21s3.6 0 6.58-.15c.42-.05 1.34-.06 2.16-.92.65-.66.86-2.14.86-2.14s.21-1.74.21-3.48v-1.53c0-1.74-.21-3.48-.21-3.48ZM9.98 14.5v-5.4l4.9 2.71-4.9 2.69Z" />
    </svg>
  ),
};

export default function Navbar() {
  const { t, language } = useLanguage();
  const siteInfo = useSiteInfo();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [galleryHover, setGalleryHover] = useState(false);
  const [galleryMobileOpen, setGalleryMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => {
    setOpen(false);
    setGalleryMobileOpen(false);
  };

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/about", label: t("nav.about") },
    { to: "/gallery", label: t("nav.gallery") },
    { to: "/projects", label: t("nav.projects") },
    { to: "/news", label: t("nav.news") },
  ];

  // Only the link matching the current route is ever "active" (react-router's
  // isActive is exclusive per NavLink), so at most one item shows the solid
  // green treatment at a time — every other link stays in its normal state.
  // forest-600 matches the language toggle's active-pill color
  // (LanguageSwitcher.jsx) rather than the near-black forest-900.
  //
  // `inline-flex` is load-bearing, not decorative: every other link here is
  // a *direct* flex child of the `nav`, which CSS auto-blockifies regardless
  // of its own `display` — but Gallery's <a> sits one level deeper inside a
  // wrapping <div> (for the dropdown), so it isn't a flex item itself and
  // falls back to its native `display: inline`. An inline element's
  // vertical padding (py-2.5) still paints but doesn't correctly size the
  // box, which was rendering Gallery's link at ~68px tall instead of the
  // 40px every sibling gets — tall and mispositioned enough to visibly
  // poke through the pill's rounded edge. `inline-flex` makes the box
  // sizing explicit instead of relying on flex-item auto-blockification.
  const linkClasses = ({ isActive }) =>
    `group relative inline-flex overflow-hidden rounded-full px-4 py-2.5 font-body text-sm font-medium
     tracking-[0.01em] transition-all duration-300 ease-out
     ${
       isActive
         ? "bg-forest-600 text-white shadow-soft"
         : "text-ink-600 hover:bg-forest-900/[0.045] hover:text-forest-900"
     }`;

  return (
    <>
      {/* Contact strip — sits above the sticky header in normal document
          flow (not sticky itself), so it simply scrolls out of view once
          the page moves past it and the header (position: sticky) takes
          over the top of the viewport on its own; no extra scroll-hide
          logic needed for "only the navbar shows once you scroll". */}
      <div className="hidden bg-forest-600 lg:block">
        <Container className="flex items-center justify-between gap-6 py-2 font-body text-xs text-white">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex shrink-0 items-center gap-2.5">
              {Object.entries(siteInfo.social).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="text-white/75 transition-colors hover:text-white"
                >
                  {SOCIAL_ICONS[key]}
                </a>
              ))}
            </div>
            <span className="h-3.5 w-px shrink-0 bg-white/25" />
            <span className="truncate font-medium tracking-wide text-white/90">
              {pick(siteInfo.tagline, language)}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <a href={`tel:${siteInfo.phone}`} className="flex items-center gap-1.5 text-white/90 transition-colors hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0">
                <path d="M4 5.5C4 4.67 4.67 4 5.5 4h2.19c.5 0 .93.35 1.03.84l.77 3.68a1.05 1.05 0 0 1-.29 1L7.9 10.8a12.6 12.6 0 0 0 5.3 5.3l1.28-1.3a1.05 1.05 0 0 1 1-.29l3.68.77c.49.1.84.53.84 1.03V18.5c0 .83-.67 1.5-1.5 1.5h-.25C9.4 20 4 14.6 4 7.75V5.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {siteInfo.phone}
            </a>
            <a href={`mailto:${siteInfo.email}`} className="flex items-center gap-1.5 text-white/90 transition-colors hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0">
                <path d="M4.5 6.5h15a.5.5 0 0 1 .5.5v10a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1V7a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M4.5 7l7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {siteInfo.email}
            </a>
            <span className="flex items-center gap-1.5 text-white/90">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0">
                <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              {pick(siteInfo.address, language)}
            </span>
          </div>
        </Container>
      </div>

      <header
        className={`sticky top-0 z-50 w-full border-b border-transparent transition-all duration-500 ${
          scrolled
            ? "bg-cream-50/75 shadow-[0_10px_40px_-8px_rgba(31,55,45,0.12)] backdrop-blur-2xl"
            : "bg-cream-50"
        }`}
      >
      {/* Hairline gold accent */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gilt-400/50 to-transparent transition-opacity duration-500 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />

      <Container
        className={`flex items-center justify-between gap-5 py-2 transition-all duration-500 ${
          scrolled ? "min-h-16" : "min-h-20"
        }`}
      >
        {/* Logo */}
        <NavLink
          to="/"
          onClick={closeMenu}
          className="group flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3.5 lg:flex-none"
        >
          <div
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-forest-100/80 bg-white shadow-[0_2px_10px_rgba(31,55,45,0.08)] ring-1 ring-transparent transition-all duration-500 group-hover:border-gilt-300/70 group-hover:shadow-[0_6px_20px_rgba(190,150,70,0.18)] group-hover:ring-gilt-200/60 ${
              scrolled ? "h-10 w-10 rounded-xl" : "h-12 w-12"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-forest-50 via-transparent to-gilt-50 opacity-70" />

            <img
              src="/images/logo.jpg"
              alt={`${pick(siteInfo.name, language)} logo`}
              className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Foundation name — shown at every width, next to the logo mark.
              min-w-0 flex-1 on the NavLink above (instead of shrink-0) lets
              this claim whatever space is actually left over after the
              logo + the protected right-side controls (shrink-0 on that
              group below). On real phone widths the language switcher +
              menu button alone leave too little room for the full name on
              one line at a readable size, so instead of a single-line
              mid-word ellipsis (truncate) it's allowed to wrap onto a
              second line (line-clamp-2 caps it there as a safety net) —
              Container's fixed height was switched to min-h so a wrapped
              second line grows the bar instead of spilling out of it. */}
          <div className="min-w-0 font-body">
            <span
              className={`line-clamp-2 font-semibold leading-snug tracking-tight text-forest-700 transition-all duration-300 ${
                scrolled ? "text-sm sm:text-base" : "text-base sm:text-lg"
              }`}
            >
              {pick(siteInfo.name, language)}
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-1 rounded-full border border-forest-200/80 bg-white/50 p-1 shadow-[0_2px_5px_rgba(31,55,45,0.08),0_14px_32px_-8px_rgba(31,55,45,0.24)] backdrop-blur-sm lg:flex"
          aria-label="Primary"
        >
          {links.map((link) =>
            link.to === "/gallery" ? (
              // Gallery gets a hover dropdown instead of a plain link — the
              // page itself no longer has an on-page Photos/Videos toggle
              // (see Gallery.jsx), so this is the only way in. The dropdown
              // panel is only mounted in the DOM while `galleryHover` is
              // true (not always-present-but-invisible) — an always-present
              // absolutely-positioned panel with its own opacity ended up
              // creating a stacking context that broke the nav pill's
              // backdrop-blur rendering (a visible gap/hole in the pill on
              // some browsers), even while the panel was invisible.
              <div
                key={link.to}
                className="relative"
                onMouseEnter={() => setGalleryHover(true)}
                onMouseLeave={() => setGalleryHover(false)}
              >
                <NavLink to={link.to} className={linkClasses}>
                  {({ isActive }) => (
                    <>
                      <Shine />
                      <span className="relative z-10 flex items-center gap-2">
                        {isActive && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gilt-400 shadow-[0_0_8px_rgba(201,166,91,0.6)]" />
                        )}
                        {link.label}
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className={`h-3 w-3 transition-transform duration-200 ${galleryHover ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        >
                          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </>
                  )}
                </NavLink>

                {galleryHover && (
                  <div className="absolute left-0 top-full z-20 w-44 pt-2">
                    <div className="[animation:fadeUp_0.15s_ease-out] overflow-hidden rounded-xl border border-forest-100 bg-white py-1.5 shadow-lift">
                      <Link to="/gallery?tab=videos" className="block px-4 py-2.5 font-body text-sm font-medium text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-800">
                        {t("nav.videoGallery")}
                      </Link>
                      <Link to="/gallery?tab=photos" className="block px-4 py-2.5 font-body text-sm font-medium text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-800">
                        {t("nav.photoGallery")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={linkClasses}
              >
                {({ isActive }) => (
                  <>
                    <Shine />
                    <span className="relative z-10 flex items-center gap-2">
                      {isActive && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gilt-400 shadow-[0_0_8px_rgba(201,166,91,0.6)]" />
                      )}
                      {link.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>

        {/* Desktop Language */}
        <div className="hidden items-center lg:flex">
          <div className="rounded-full border border-forest-100/70 bg-white/60 p-1 shadow-[0_1px_2px_rgba(31,55,45,0.04),0_6px_18px_-6px_rgba(31,55,45,0.10)] backdrop-blur-sm">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Language + Menu Button */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <LanguageSwitcher compact />

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`group inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${
              open
                ? "border-forest-800 bg-forest-900 text-white shadow-[0_6px_18px_-4px_rgba(31,55,45,0.35)]"
                : "border-forest-100 bg-white/80 text-forest-800 shadow-sm hover:border-gilt-300/70 hover:bg-white hover:shadow-[0_4px_14px_-4px_rgba(190,150,70,0.25)]"
            }`}
            aria-expanded={open}
            aria-label="Toggle navigation menu"
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span
                className={`absolute h-0.5 w-5 rounded-full transition-all duration-300 ${
                  open ? "rotate-45 bg-white" : "-translate-y-1.5 bg-current"
                }`}
              />

              <span
                className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />

              <span
                className={`absolute h-0.5 w-5 rounded-full transition-all duration-300 ${
                  open ? "-rotate-45 bg-white" : "translate-y-1.5 bg-current"
                }`}
              />
            </span>
          </button>
        </div>
      </Container>

      {/* Mobile Navigation */}
      <div
        className={`overflow-hidden border-t border-forest-100/70 bg-cream-50/95 backdrop-blur-2xl transition-all duration-500 ease-out lg:hidden ${
          open ? "max-h-[500px] opacity-100" : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <Container className="pb-5 pt-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {links.map((link) =>
              link.to === "/gallery" ? (
                // No hover on mobile, so Gallery is a tap-to-expand
                // accordion instead of a plain link — tapping it reveals
                // the same Photo/Video destinations the desktop dropdown
                // links to (see the hover `nav` block above), collapsed by
                // default so the menu doesn't show two extra rows nobody
                // asked to see yet.
                <div key={link.to}>
                  <button
                    type="button"
                    onClick={() => setGalleryMobileOpen((v) => !v)}
                    aria-expanded={galleryMobileOpen}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 font-body text-sm font-medium tracking-[0.01em] text-ink-600 transition-all duration-300 hover:bg-forest-900/[0.05] hover:text-forest-900"
                  >
                    <span>{link.label}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`h-4 w-4 shrink-0 transition-transform duration-300 ${galleryMobileOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      galleryMobileOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-forest-100 pl-3">
                      <Link
                        to="/gallery?tab=photos"
                        onClick={closeMenu}
                        className="rounded-lg px-4 py-2.5 font-body text-sm text-ink-600 transition-colors hover:bg-forest-900/[0.05] hover:text-forest-900"
                      >
                        {t("nav.photoGallery")}
                      </Link>
                      <Link
                        to="/gallery?tab=videos"
                        onClick={closeMenu}
                        className="rounded-lg px-4 py-2.5 font-body text-sm text-ink-600 transition-colors hover:bg-forest-900/[0.05] hover:text-forest-900"
                      >
                        {t("nav.videoGallery")}
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-4 py-3.5 font-body text-sm font-medium tracking-[0.01em] transition-all duration-300 ${
                      isActive
                        ? "bg-forest-600 text-white shadow-[0_6px_16px_-6px_rgba(63,150,84,0.4)]"
                        : "text-ink-600 hover:bg-forest-900/[0.05] hover:text-forest-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{link.label}</span>

                      <span
                        className={`text-lg transition-all duration-300 ${
                          isActive
                            ? "translate-x-0 text-gilt-400 opacity-100"
                            : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        }`}
                      >
                        →
                      </span>
                    </>
                  )}
                </NavLink>
              )
            )}
          </nav>
        </Container>
      </div>
    </header>
    </>
  );
}