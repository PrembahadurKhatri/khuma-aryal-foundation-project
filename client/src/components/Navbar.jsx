import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import Container from "./Container.jsx";
import { useSiteInfo } from "../contexts/SiteInfoContext.jsx";

export default function Navbar() {
  const { t, language } = useLanguage();
  const siteInfo = useSiteInfo();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/about", label: t("nav.about") },
    { to: "/gallery", label: t("nav.gallery") },
    { to: "/projects", label: t("nav.projects") },
    { to: "/news", label: t("nav.news") },
  ];

  // Only the link matching the current route is ever "active" (react-router's
  // isActive is exclusive per NavLink), so at most one item shows the solid
  // navy treatment at a time — every other link stays in its normal state.
  const linkClasses = ({ isActive }) =>
    `group relative rounded-full px-4 py-2.5 font-body text-sm font-medium
     tracking-[0.01em] transition-all duration-300 ease-out
     ${
       isActive
         ? "bg-forest-900 text-white shadow-soft"
         : "text-ink-600 hover:bg-forest-900/[0.045] hover:text-forest-900"
     }`;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "border-b border-forest-100/70 bg-cream-50/75 shadow-[0_10px_40px_-8px_rgba(31,55,45,0.12)] backdrop-blur-2xl"
          : "border-b border-transparent bg-cream-50"
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
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={linkClasses}
            >
              {({ isActive }) => (
                <span className="relative z-10 flex items-center gap-2">
                  {isActive && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gilt-400 shadow-[0_0_8px_rgba(201,162,39,0.6)]" />
                  )}
                  {link.label}
                </span>
              )}
            </NavLink>
          ))}
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
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-4 py-3.5 font-body text-sm font-medium tracking-[0.01em] transition-all duration-300 ${
                    isActive
                      ? "bg-forest-900 text-white shadow-[0_6px_16px_-6px_rgba(31,55,45,0.4)]"
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
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
}