import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { getProject } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import GalleryGrid from "../components/gallery/GalleryGrid.jsx";
import LinkedAlbumCard from "../components/LinkedAlbumCard.jsx";

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M11 4h6a3 3 0 0 1 3 3v6l-9 9-9-9 9-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12 21s-6.5-5.86-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.14-6.5 11-6.5 11Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 20c0-3.31 2.46-6 5.5-6s5.5 2.69 5.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 4.6c1.44.5 2.5 1.9 2.5 3.4s-1.06 2.9-2.5 3.4M20.5 20c0-2.9-1.9-5.3-4.5-5.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M5 21V4M5 4h13l-3 4 3 4H5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const STATUS_TONE = {
  ongoing: "bg-forest-600 text-white",
  completed: "bg-ink-600 text-white",
  upcoming: "bg-gilt-500 text-white",
};

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

export default function ProjectDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Not useContent() here on purpose — see the identical note in
  // AlbumDetail.jsx: this page's data is keyed by the :id route param,
  // which useContent's frozen effect deps don't handle if it ever changes
  // without a full remount.
  useEffect(() => {
    let active = true;
    setLoading(true);
    getProject(id)
      .then((result) => {
        if (active) {
          setProject(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setProject(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!loading && !project) {
    return <Navigate to="/projects" replace />;
  }

  const title = project ? pick(project.title, language) : "";
  const description = project ? pick(project.description, language) : "";
  const status = project?.status || "ongoing";
  const category = project?.category || "Event";
  const duration = project ? pick(project.duration, language) : "";
  const location = project ? pick(project.location, language) : "";
  const beneficiaries = project ? pick(project.beneficiaries, language) : "";
  const objective = project ? pick(project.objective, language) : "";
  const formattedDate = project?.date
    ? new Date(project.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const formattedEndDate = project?.endDate
    ? new Date(project.endDate).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const album = project?.album;
  // Dedicated hero photo, set independently in the admin panel — falls back
  // to the first gallery image so older projects without one still show a
  // real photo instead of the generic default PageHero uses.
  const heroImage = project?.thumbnail || project?.images?.[0];

  // GalleryGrid/Lightbox render { id, src, alt } objects — a project's
  // `images` is just an array of URL strings, so wrap each one here rather
  // than changing those shared components. Same pattern as AlbumDetail.jsx.
  const photos = project ? project.images.map((src, i) => ({ id: `${project.id}-${i}`, src, alt: title })) : [];

  // Short, single-line facts only — these render as compact stat tiles
  // below. `beneficiaries` is kept separate (see the dedicated block
  // further down) since it's routinely a full sentence or two of impact
  // description, not a short fact, and cramming that into a small tile
  // alongside a date breaks the tile's proportions.
  const infoItems = project
    ? [
        formattedDate && { icon: <CalendarIcon />, label: t("projects.date"), value: formattedDate },
        formattedEndDate && { icon: <CalendarIcon />, label: t("projects.finishDate"), value: formattedEndDate },
        duration && { icon: <ClockIcon />, label: t("projects.duration"), value: duration },
        location && { icon: <PinIcon />, label: t("projects.location"), value: location },
        { icon: <TagIcon />, label: t("projects.categoryLabel"), value: t(`gallery.category${category}`) },
        { icon: <FlagIcon />, label: t("projects.statusLabel"), value: t(`common.${status}`) },
      ].filter(Boolean)
    : [];

  return (
    <>
      <PageHero label={loading ? t("projects.title") : title} images={heroImage ? [heroImage] : undefined} hideLabel />

      <section className="relative overflow-hidden py-20 sm:py-24">
        {/* Decorative glows + grain — same premium background treatment used
            on About/Home, so this page doesn't read as bare compared to them. */}
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gilt-400/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-forest-100/40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />

        <Container className="relative">
          <Link
            to="/projects"
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white py-2.5 pl-3 pr-5 font-body text-sm font-semibold text-forest-700 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-700 hover:bg-forest-700 hover:text-white hover:shadow-lift"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-50 text-forest-700 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:bg-white/15 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {t("projects.backToProjects")}
          </Link>

          {loading || !project ? (
            <div className="flex flex-col gap-8">
              <div className="h-64 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
              <div className="h-40 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
            </div>
          ) : (
            // Single editorial column, not a two-column split — a project
            // title here can run as long as a news headline (see the 6th
            // Anniversary project), and a narrower sidebar column forced it
            // into near-one-word-per-line wrapping. Giving the title the
            // full container width to breathe fixes that regardless of how
            // long any given title is, and reads as a proper case-study
            // page rather than a cramped dashboard split.
            <div className="mx-auto flex max-w-4xl flex-col gap-8">
              <Reveal>
                <div className="flex flex-col gap-5 rounded-xl3 border border-forest-100 bg-white p-7 shadow-card sm:p-9">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1 font-body text-xs font-semibold text-forest-600">
                      <TagIcon />
                      {t(`gallery.category${category}`)}
                    </span>
                    <span className={`rounded-full px-3 py-1 font-body text-xs font-semibold shadow-soft ${STATUS_TONE[status] || STATUS_TONE.ongoing}`}>
                      {t(`common.${status}`)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-gilt-600">{t("projects.overview")}</span>
                    <h1 className="font-body text-2xl font-bold leading-[1.25] tracking-tight text-forest-900 sm:text-3xl lg:text-[2.25rem]">{title}</h1>
                  </div>
                  <p className="font-body text-base leading-relaxed text-ink-600 sm:text-lg">{description}</p>
                </div>
              </Reveal>

              {/* Meta info as a stat-tile grid rather than a stacked
                  icon/label/value list — reflows naturally at full width
                  instead of being squeezed into a sidebar. */}
              {infoItems.length > 0 && (
                <Reveal delay={0.05}>
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                    {infoItems.map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col gap-2.5 rounded-xl2 border border-forest-100 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-200 hover:shadow-lift sm:p-5"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-600">{item.icon}</span>
                        <div className="flex flex-col gap-0.5">
                          <dt className="font-body text-[11px] font-medium uppercase tracking-wide text-ink-400">{item.label}</dt>
                          <dd className="font-body text-sm font-semibold leading-snug text-ink-900">{item.value}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              )}

              {beneficiaries && (
                <Reveal delay={0.08}>
                  <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl3 border border-forest-100 bg-white p-6 shadow-card sm:p-7">
                    <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-forest-500/10 blur-2xl" aria-hidden="true" />
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-forest-50 px-3 py-1.5 font-body text-sm font-semibold text-forest-700">
                      <UsersIcon />
                      {t("projects.beneficiaries")}
                    </span>
                    <p className="relative font-body text-sm leading-relaxed text-ink-600 sm:text-base">{beneficiaries}</p>
                  </div>
                </Reveal>
              )}

              {objective && (
                <Reveal delay={0.1}>
                  <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl3 border border-forest-100 bg-white p-6 shadow-card sm:p-7">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gilt-400/10 blur-2xl" aria-hidden="true" />
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-forest-50 px-3 py-1.5 font-body text-sm font-semibold text-forest-700">
                      <TargetIcon />
                      {t("projects.objective")}
                    </span>
                    <p className="font-body text-sm leading-relaxed text-ink-600 sm:text-base">{objective}</p>
                  </div>
                </Reveal>
              )}

              {photos.length > 0 && (
                <Reveal delay={0.15}>
                  <div className="flex flex-col gap-5 rounded-xl3 border border-forest-100 bg-white p-6 shadow-card sm:p-7">
                    <div className="flex items-center justify-between">
                      <h2 className="font-body text-xl font-bold text-forest-900">{t("gallery.photosLabel")}</h2>
                      <span className="rounded-full bg-forest-50 px-3 py-1 font-body text-xs font-semibold text-forest-600">{photos.length}</span>
                    </div>
                    <GalleryGrid images={photos} />
                  </div>
                </Reveal>
              )}

              {/* Photo Gallery — links through to the linked Album's full
                  photo collection under Gallery, if one was linked in the
                  admin panel. */}
              {album && (
                <Reveal delay={0.2}>
                  <LinkedAlbumCard
                    album={album}
                    badgeLabel={t("projects.photoGallery")}
                    description={t("projects.photoGalleryDesc")}
                    ctaLabel={t("projects.viewFullGallery")}
                  />
                </Reveal>
              )}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
