import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import PlaceholderImage from "./PlaceholderImage.jsx";

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.6l-6.1 3.4 1.5-6.8-5.2-4.7 6.9-.7L12 2.5Z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 19.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15.5 5.3c1.3.4 2.2 1.6 2.2 3s-.9 2.6-2.2 3M18 14.3c1.7.5 3 2.2 3 4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The large "Featured" spotlight card shown above the regular grid on the
// Projects page — same underlying data as ProjectCard.jsx, just a bigger,
// richer treatment (star badge, beneficiaries, circular arrow button) for
// whichever project the admin marked `featured` in ProjectsManage. Mirrors
// FeaturedAlbumCard.jsx's structure (see components/gallery/) so the two
// "Featured" spotlights across the site feel like the same pattern.
export default function FeaturedProjectCard({ project }) {
  const { t, language } = useLanguage();
  const title = pick(project.title, language);
  const description = pick(project.description, language);
  const beneficiaries = pick(project.beneficiaries, language);
  const cover = project.thumbnail || project.images?.[0];
  const status = project.status || "ongoing";
  const category = project.category || "Event";

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group relative mb-6 flex aspect-[4/5] w-full overflow-hidden rounded-xl2 border border-forest-100 shadow-card transition-all duration-300 hover:shadow-lift sm:mb-8 sm:aspect-[21/9]"
    >
      <div className="absolute inset-0">
        <PlaceholderImage src={cover} alt={title} label={title} imgClassName="transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/25 to-transparent" aria-hidden="true" />

      {/* Featured badge, top-left */}
      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gilt-500 px-3 py-1.5 font-body text-xs font-bold text-white shadow-soft sm:left-6 sm:top-6">
        <StarIcon />
        {t("gallery.featured")}
      </span>

      {/* Status badge, top-right — same info ProjectCard shows on its cover photo */}
      <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 font-body text-xs font-semibold text-forest-800 shadow-soft sm:right-6 sm:top-6">
        {t(`common.${status}`)}
      </span>

      {/* Content, bottom-left */}
      <div className="relative mt-auto flex w-full flex-col gap-2 p-5 sm:max-w-2xl sm:gap-3 sm:p-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-body text-xs font-medium text-white/85 sm:text-sm">
          <span className="rounded-full bg-white/15 px-2.5 py-1 font-semibold text-white backdrop-blur-sm">{t(`gallery.category${category}`)}</span>
        </div>

        <h3 className="font-body text-xl font-bold leading-snug text-white drop-shadow-sm sm:text-2xl lg:text-3xl">{title}</h3>

        {/* `sm:line-clamp-2` already switches display to -webkit-box at that
            breakpoint — an extra `sm:block` here would win the cascade over
            it (same specificity, defined later) and silently undo the
            clamp, letting a long description overflow the fixed-height card. */}
        {description && <p className="hidden max-w-lg font-body text-sm leading-relaxed text-white/80 sm:line-clamp-2">{description}</p>}

        <div className="mt-1 flex items-center justify-between gap-3">
          {beneficiaries ? (
            // Unlike Gallery's numeric beneficiaries count, a project's
            // beneficiaries field is free bilingual text (see Project.js)
            // and can run long (a bullet-style list, a full sentence, ...)
            // — truncated to one line so it can't push the arrow button
            // out of the card or overflow the fixed-height box.
            <span className="flex min-w-0 items-center gap-1.5 font-body text-sm font-semibold text-white">
              <PeopleIcon />
              <span className="truncate">{beneficiaries}</span>
            </span>
          ) : (
            <span />
          )}

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-forest-800 shadow-soft transition-all duration-300 group-hover:scale-105 group-hover:bg-gilt-400 group-hover:text-white sm:h-11 sm:w-11">
            <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}
