import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { getProject } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import PlaceholderImage from "../components/PlaceholderImage.jsx";
import GalleryGrid from "../components/gallery/GalleryGrid.jsx";

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

function ImagesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <rect x="3" y="4" width="14" height="14" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="8.5" r="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 15l3.5-3.5a1.5 1.5 0 0 1 2 0L13 15M12 13l1.3-1.3a1.5 1.5 0 0 1 2 0L18 14.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 8v10a2 2 0 0 1-2 2H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
  const albumTitle = album ? pick(album.title, language) : "";
  // Dedicated hero photo, set independently in the admin panel — falls back
  // to the first gallery image so older projects without one still show a
  // real photo instead of the generic default PageHero uses.
  const heroImage = project?.thumbnail || project?.images?.[0];

  // GalleryGrid/Lightbox render { id, src, alt } objects — a project's
  // `images` is just an array of URL strings, so wrap each one here rather
  // than changing those shared components. Same pattern as AlbumDetail.jsx.
  const photos = project ? project.images.map((src, i) => ({ id: `${project.id}-${i}`, src, alt: title })) : [];

  const infoItems = project
    ? [
        formattedDate && { icon: <CalendarIcon />, label: t("projects.date"), value: formattedDate },
        formattedEndDate && { icon: <CalendarIcon />, label: t("projects.finishDate"), value: formattedEndDate },
        duration && { icon: <ClockIcon />, label: t("projects.duration"), value: duration },
        location && { icon: <PinIcon />, label: t("projects.location"), value: location },
        { icon: <TagIcon />, label: t("projects.categoryLabel"), value: t(`gallery.category${category}`) },
        { icon: <FlagIcon />, label: t("projects.statusLabel"), value: t(`common.${status}`) },
        beneficiaries && { icon: <UsersIcon />, label: t("projects.beneficiaries"), value: beneficiaries },
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
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div className="h-64 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
              <div className="h-64 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              {/* ================= LEFT: Overview + Objective + Photos ================= */}
              <div className="flex flex-col gap-8">
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
                      <h1 className="font-body text-3xl font-bold leading-tight text-forest-900 sm:text-4xl">{title}</h1>
                  
                    </div>
                    <p className="font-body text-base leading-relaxed text-ink-600 sm:text-lg">{description}</p>
                  </div>
                </Reveal>

                {objective && (
                  <Reveal delay={0.05}>
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
                  <Reveal delay={0.1}>
                    <div className="flex flex-col gap-5 rounded-xl3 border border-forest-100 bg-white p-6 shadow-card sm:p-7">
                      <div className="flex items-center justify-between">
                        <h2 className="font-body text-xl font-bold text-forest-900">{t("gallery.photosLabel")}</h2>
                        <span className="rounded-full bg-forest-50 px-3 py-1 font-body text-xs font-semibold text-forest-600">{photos.length}</span>
                      </div>
                      <GalleryGrid images={photos} />
                    </div>
                  </Reveal>
                )}
              </div>

              {/* ================= RIGHT: Info panel + linked Gallery album ================= */}
              <div className="flex flex-col gap-6">
                {infoItems.length > 0 && (
                  <Reveal delay={0.05} className="h-fit">
                    <div className="overflow-hidden rounded-xl3 border border-forest-100 bg-white shadow-card">
                      <div className="border-b border-forest-100 bg-forest-50/60 px-6 py-4">
                        <h2 className="font-body text-lg font-bold text-forest-900">{t("projects.information")}</h2>
                      </div>
                      <dl className="flex flex-col divide-y divide-forest-50 px-2 py-2">
                        {infoItems.map((item) => (
                          <div key={item.label} className="flex items-start gap-3 rounded-xl2 px-4 py-3 transition-colors duration-200 hover:bg-forest-50/50">
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-600">{item.icon}</span>
                            <div className="flex flex-col">
                              <dt className="font-body text-xs font-medium uppercase tracking-wide text-ink-400">{item.label}</dt>
                              <dd className="font-body text-sm font-semibold text-ink-900">{item.value}</dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </Reveal>
                )}

                {/* Photo Gallery — links through to the linked Album's full
                    photo collection under Gallery, if one was linked in the
                    admin panel. */}
                {album && (
                  <Reveal delay={0.1} className="h-fit">
                    <Link
                      to={`/gallery/${album.id}`}
                      className="group flex flex-col overflow-hidden rounded-xl3 border border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                    >
                      <div className="relative h-36 w-full overflow-hidden">
                        <PlaceholderImage src={album.coverImage} alt={albumTitle} label={albumTitle} imgClassName="transition-transform duration-500 group-hover:scale-105" />
                        <span className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-forest-950/10 to-transparent" />
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 font-body text-[11px] font-semibold text-white backdrop-blur-md">
                          <ImagesIcon />
                          {t("projects.photoGallery")}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 p-5">
                        <h3 className="font-body text-base font-semibold text-forest-900">{albumTitle}</h3>
                        <p className="font-body text-xs leading-relaxed text-ink-600">{t("projects.photoGalleryDesc")}</p>
                        <span className="mt-2 inline-flex w-fit items-center gap-1 font-body text-xs font-semibold text-forest-600 transition-transform duration-300 group-hover:translate-x-0.5">
                          {t("projects.viewFullGallery")} →
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                )}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
