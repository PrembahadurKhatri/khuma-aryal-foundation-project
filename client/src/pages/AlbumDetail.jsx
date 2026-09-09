import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { getGalleryAlbum } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import GalleryGrid from "../components/gallery/GalleryGrid.jsx";

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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
              ))}
            </div>
          ) : (
            <>
              {/* Title + description shown once, here, instead of overlaid on
                  every photo (see GalleryGrid.jsx/Lightbox.jsx) — title is a
                  required field so this always renders; description is
                  optional and simply omitted when the album doesn't have one,
                  rather than leaving a blank gap. */}
              <Reveal>
                <div className="mb-10">
                  <h1 className="font-body text-2xl font-bold text-forest-900 sm:text-3xl">{title}</h1>
                  {description && <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-ink-600">{description}</p>}
                </div>
              </Reveal>

              {photos.length === 0 ? (
                <p className="text-center text-ink-600">{t("gallery.empty")}</p>
              ) : (
                <Reveal delay={0.06}>
                  <GalleryGrid images={photos} size="large" />
                </Reveal>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  );
}
