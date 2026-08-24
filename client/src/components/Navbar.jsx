import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import Container from "./Container.jsx";
import { Shine } from "./Button.jsx";
import { useSiteInfo } from "../contexts/SiteInfoContext.jsx";

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
        className={`flex items-center justify-between gap-5 transition-all duration-500 ${
          scrolled ? "h-16" : "h-20"
        }`}
      >
        {/* Logo */}
        <NavLink
          to="/"
          onClick={closeMenu}
          className="group flex shrink-0 items-center gap-3.5"
        >
          <div
            className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-forest-100/80 bg-white shadow-[0_2px_10px_rgba(31,55,45,0.08)] ring-1 ring-transparent transition-all duration-500 group-hover:border-gilt-300/70 group-hover:shadow-[0_6px_20px_rgba(190,150,70,0.18)] group-hover:ring-gilt-200/60 ${
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

          {/* Foundation name — desktop only; mobile shows just the logo mark */}
          <div className="hidden min-w-0 font-body leading-tight lg:block">
            <span
              className={`block truncate font-semibold tracking-tight text-forest-700 transition-all duration-300 ${
                scrolled ? "text-sm" : "text-sm sm:text-base"
              }`}
            >
              {pick(siteInfo.name, language)}
            </span>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-1 rounded-full border border-forest-100/70 bg-white/50 p-1 shadow-[0_1px_2px_rgba(31,55,45,0.04),0_8px_24px_-8px_rgba(31,55,45,0.10)] backdrop-blur-sm lg:flex"
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
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />

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
  );
}