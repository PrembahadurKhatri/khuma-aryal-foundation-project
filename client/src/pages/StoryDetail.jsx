import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { getStory } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import GalleryGrid from "../components/gallery/GalleryGrid.jsx";
import LinkedAlbumCard from "../components/LinkedAlbumCard.jsx";

export default function StoryDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getStory(id)
      .then((result) => {
        if (active) {
          setStory(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setStory(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!loading && !story) {
    return <Navigate to="/news" replace />;
  }

  const name = story ? pick(story.name, language) : "";
  const summary = story ? pick(story.summary, language) : "";
  const description = story ? pick(story.description, language) : "";
  const album = story?.album;
  const photos = story?.images ? story.images.map((src, i) => ({ id: `${story.id}-${i}`, src, alt: name })) : [];

  return (
    <>
      {/* Same pattern as NewsDetail: the story's own photo becomes the hero
          background (falls back to the Foundation's logo when there isn't
          one), no title text overlaid since the headline is already shown
          right below in the card. */}
      <PageHero
        label={loading ? t("news.sectionStories") : name || t("news.sectionStories")}
        images={story?.photo ? [story.photo] : undefined}
        hideLabel
      />

      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gilt-400/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-forest-100/40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />

        <Container className="relative max-w-3xl">
          <Link
            to="/news"
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white py-2.5 pl-3 pr-5 font-body text-sm font-semibold text-forest-700 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-700 hover:bg-forest-700 hover:text-white hover:shadow-lift"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-50 text-forest-700 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:bg-white/15 group-hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {t("news.backToNews")}
          </Link>

          {loading || !story ? (
            <div className="h-96 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
          ) : (
            <Reveal>
              <div className="overflow-hidden rounded-xl3 border border-forest-100 bg-white shadow-card">
                <div className="flex flex-col gap-5 p-7 sm:p-9">
                  {name && <h1 className="font-body text-2xl font-bold leading-tight text-forest-900 sm:text-3xl">{name}</h1>}
                  <p className="font-body text-lg font-medium leading-relaxed text-forest-800">{summary}</p>
                  {/* Full write-up, if the admin added one — falls back to
                      just the summary above for older stories that only
                      ever had one. */}
                  {description && (
                    <p className="whitespace-pre-line border-t border-forest-100 pt-5 font-body text-base leading-relaxed text-ink-600">{description}</p>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {!loading && story && photos.length > 0 && (
            <Reveal delay={0.05}>
              <div className="mt-6 flex flex-col gap-5 rounded-xl3 border border-forest-100 bg-white p-6 shadow-card sm:p-7">
                <div className="flex items-center justify-between">
                  <h2 className="font-body text-xl font-bold text-forest-900">{t("gallery.photosLabel")}</h2>
                  <span className="rounded-full bg-forest-50 px-3 py-1 font-body text-xs font-semibold text-forest-600">{photos.length}</span>
                </div>
                <GalleryGrid images={photos} />
              </div>
            </Reveal>
          )}

          {!loading && album && (
            <Reveal delay={0.1} className="mt-6">
              <LinkedAlbumCard album={album} />
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
