import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { getGalleryAlbum } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import GalleryGrid from "../components/gallery/GalleryGrid.jsx";

// Same tag glyph ProjectDetail.jsx uses for its category badge — kept
// consistent across every detail page's "info card" header.
function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M11 4h6a3 3 0 0 1 3 3v6l-9 9-9-9 9-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function ImagesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect x="3.5" y="5.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8" cy="10" r="1.4" fill="currentColor" />
      <path d="M4 15.5l3.5-3.5a1.3 1.3 0 0 1 1.8 0L13.5 16M13 13.5l1-1a1.3 1.3 0 0 1 1.8 0l1.7 1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.5 8.5V16a2 2 0 0 1-2 2H10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function AlbumDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  // Not useContent() here on purpose — that hook's effect deps are frozen
  // to [] (see hooks/useContent.js), so it only ever fetches once. This
  // page's data is keyed by the :id route param, which can change without
  // unmounting the component (e.g. a future "next album" link), so the
  // fetch needs to explicitly depend on `id`.
  useEffect(() => {
    let active = true;
    setLoading(true);
    getGalleryAlbum(id)
      .then((result) => {
        if (active) {
          setAlbum(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setAlbum(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!loading && !album) {
    return <Navigate to="/gallery" replace />;
  }

  const title = album ? pick(album.title, language) : "";
  const description = album ? pick(album.description, language) : "";
  // GalleryGrid/Lightbox render { id, src, alt } objects — an album's
  // `photos` is just an array of URL strings, so wrap each one here rather
  // than changing those shared components.
  const photos = album ? album.photos.map((src, i) => ({ id: `${album.id}-${i}`, src, alt: title })) : [];

  return (
    <>
      <PageHero label={loading ? t("gallery.title") : title} hideLabel />

      <section className="py-20 sm:py-24">
        <Container>
          <Link
            to="/gallery"
            className="group mb-10 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white py-2.5 pl-3 pr-5 font-body text-sm font-semibold text-forest-700 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-700 hover:bg-forest-700 hover:text-white hover:shadow-lift"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-50 text-forest-700 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:bg-white/15 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {t("gallery.backToGallery")}
          </Link>

          {loading || !album ? (
            <div className="flex flex-col gap-8">
              <div className="h-40 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Title + description shown once, here, as a proper info card
                  — instead of overlaid on every photo (see GalleryGrid.jsx/
                  Lightbox.jsx). Same "info card" shell every other detail
                  page (Project/Event/Vacancy) uses, so this page matches the
                  rest of the site instead of sitting bare on the page
                  background. Title is a required field so it always
                  renders; description is optional and simply omitted (no
                  blank gap) when the album doesn't have one. */}
              <Reveal>
                <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl3 border border-forest-100 bg-white p-7 shadow-card sm:p-9">
                  <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-gilt-400/10 blur-3xl" aria-hidden="true" />

                  <div className="relative flex flex-wrap items-center gap-3">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-forest-50 px-3 py-1 font-body text-xs font-semibold text-forest-600">
                      <TagIcon />
                      {t(`gallery.category${album.category || "Event"}`)}
                    </span>
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gilt-50 px-3 py-1 font-body text-xs font-semibold text-gilt-700">
                      <ImagesIcon />
                      {photos.length} {t("gallery.photosLabel")}
                    </span>
                  </div>

                  <div className="relative flex flex-col gap-3">
                    <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-gilt-600">{t("gallery.kicker")}</span>
                    <h1 className="font-body text-2xl font-bold leading-[1.25] tracking-tight text-forest-900 sm:text-3xl lg:text-[2.25rem]">{title}</h1>
                  </div>

                  {description && <p className="relative font-body text-base leading-relaxed text-ink-600 sm:text-lg">{description}</p>}
                </div>
              </Reveal>

              {photos.length === 0 ? (
                <p className="text-center text-ink-600">{t("gallery.empty")}</p>
              ) : (
                <Reveal delay={0.06}>
                  <GalleryGrid images={photos} size="large" />
                </Reveal>
              )}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
