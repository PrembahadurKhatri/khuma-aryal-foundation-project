import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import Container from "./Container.jsx";
import { useSiteInfo } from "../contexts/SiteInfoContext.jsx";

const SOCIAL_ICONS = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M13.5 21v-8.2h2.75l.41-3.2H13.5V7.4c0-.93.26-1.56 1.6-1.56h1.7V2.98A22.7 22.7 0 0 0 14.5 2.85c-2.42 0-4.08 1.48-4.08 4.2v2.55H7.65v3.2h2.77V21h3.08Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.2c2.7 0 3 .01 4.1.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.64.25-1.37.42-2.43.47-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.21 15 2.2 14.7 2.2 12s.01-3 .06-4.1c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 0 1 5.65 2.55c.64-.25 1.37-.42 2.43-.47C9.18 2.03 9.48 2.02 12 2.02Zm0 1.8c-2.66 0-2.97.01-4.02.06-.86.04-1.33.18-1.64.3-.41.16-.71.35-1.02.66-.31.31-.5.61-.66 1.02-.12.31-.26.78-.3 1.64-.05 1.05-.06 1.36-.06 4.02s.01 2.97.06 4.02c.04.86.18 1.33.3 1.64.16.41.35.71.66 1.02.31.31.61.5 1.02.66.31.12.78.26 1.64.3 1.05.05 1.36.06 4.02.06s2.97-.01 4.02-.06c.86-.04 1.33-.18 1.64-.3.41-.16.71-.35 1.02-.66.31-.31.5-.61.66-1.02.12-.31.26-.78.3-1.64.05-1.05.06-1.36.06-4.02s-.01-2.97-.06-4.02c-.04-.86-.18-1.33-.3-1.64a2.76 2.76 0 0 0-.66-1.02 2.76 2.76 0 0 0-1.02-.66c-.31-.12-.78-.26-1.64-.3C14.97 4.01 14.66 4 12 4Zm0 3.38A4.62 4.62 0 1 1 7.38 12 4.62 4.62 0 0 1 12 7.38Zm0 1.8A2.82 2.82 0 1 0 14.82 12 2.82 2.82 0 0 0 12 9.18Zm4.8-2.02a1.08 1.08 0 1 1-1.08-1.08 1.08 1.08 0 0 1 1.08 1.08Z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M21.6 7.2s-.21-1.48-.86-2.14c-.82-.86-1.74-.87-2.16-.92C15.6 4 12 4 12 4h-.01s-3.6 0-6.58.14c-.42.05-1.34.06-2.16.92-.65.66-.86 2.14-.86 2.14S2.18 8.94 2.18 10.68v1.53c0 1.74.21 3.48.21 3.48s.21 1.48.86 2.14c.82.86 1.9.83 2.38.92 1.72.16 7.37.21 7.37.21s3.6 0 6.58-.15c.42-.05 1.34-.06 2.16-.92.65-.66.86-2.14.86-2.14s.21-1.74.21-3.48v-1.53c0-1.74-.21-3.48-.21-3.48ZM9.98 14.5v-5.4l4.9 2.71-4.9 2.69Z" />
    </svg>
  ),
};

export default function Footer() {
  const { t, language } = useLanguage();
  const siteInfo = useSiteInfo();

  const quickLinks = [
    { to: "/about", label: t("nav.about") },
    { to: "/gallery", label: t("nav.gallery") },
    { to: "/projects", label: t("nav.projects") },
    { to: "/news", label: t("nav.news") },
  ];

  return (
    <footer className="bg-forest-950 text-forest-100">
      <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt={`${pick(siteInfo.name, language)} logo`} className="h-10 w-10 rounded-full bg-white p-0.5" />
            <span className="font-body text-lg font-semibold text-white">{pick(siteInfo.name, language)}</span>
          </div>
          <p className="text-sm leading-relaxed text-forest-200">{t("footer.tagline")}</p>
          <div className="flex items-center gap-3 pt-1">
            {Object.entries(siteInfo.social).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-gilt-500"
              >
                {SOCIAL_ICONS[key]}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-white">{t("common.quickLinks")}</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-forest-200 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-white">{t("common.contactUs")}</h3>
          <ul className="mt-4 space-y-3 text-sm text-forest-200">
            <li className="flex gap-2">
              <span className="text-gilt-400">📍</span>
              <span>{pick(siteInfo.address, language)}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gilt-400">📞</span>
              <a href={`tel:${siteInfo.phone}`} className="hover:text-white">
                {siteInfo.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <span className="text-gilt-400">✉️</span>
              <a href={`mailto:${siteInfo.email}`} className="hover:text-white">
                {siteInfo.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-white">{t("home.exploreTitle")}</h3>
          <p className="mt-4 text-sm leading-relaxed text-forest-200">{t("footer.tagline")}</p>
        </div>
      </Container>

      <div className="border-t border-white/10 py-5">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-forest-300 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {pick(siteInfo.name, language)}. {t("footer.rights")}
          </span>
          <span>{t("footer.madeWith")}</span>
        </Container>
      </div>
    </footer>
  );
}
