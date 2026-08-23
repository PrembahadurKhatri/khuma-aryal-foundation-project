import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { getNewsItem } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import GalleryGrid from "../components/gallery/GalleryGrid.jsx";
import LinkedAlbumCard from "../components/LinkedAlbumCard.jsx";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path d="M11 4h6a3 3 0 0 1 3 3v6l-9 9-9-9 9-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function NewsDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  // Not useContent() here on purpose — same reasoning as every other
  // :id-keyed detail page in this app (ProjectDetail.jsx, NoticeDetail.jsx, ...).
  useEffect(() => {
    let active = true;
    setLoading(true);
    getNewsItem(id)
      .then((result) => {
        if (active) {
          setNews(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setNews(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!loading && !news) {
    return <Navigate to="/news" replace />;
  }

  const title = news ? pick(news.title, language) : "";
  const description = news ? pick(news.description, language) : "";
  const category = news?.category || "General";
  const album = news?.album;
  // GalleryGrid/Lightbox render { id, src, alt } objects — this item's
  // `images` is just an array of URL strings, same pattern as
  // ProjectDetail.jsx/AlbumDetail.jsx.
  const photos = news?.images ? news.images.map((src, i) => ({ id: `${news.id}-${i}`, src, alt: title })) : [];

  let formatted = news?.date;
  try {
    formatted = news?.date ? new Date(news.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  } catch {
    formatted = news?.date;
  }

  return (
    <>
      {/* The article's own photo becomes the hero background instead of a
          generic default — PageHero already falls back to the Foundation's
          logo (see PageHero.jsx's `slides` default) when a news item has no
          photo, so no extra fallback logic is needed here. `hideLabel`
          drops the title-pill overlay since the full headline is already
          shown right below in the article body. */}
      <PageHero label={loading ? t("news.sectionLatestNews") : title} images={news?.image ? [news.image] : undefined} hideLabel />

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

          {loading || !news ? (
            <div className="h-96 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
          ) : (
            <Reveal>
              <div className="overflow-hidden rounded-xl3 border border-forest-100 bg-white shadow-card">
                <div className="flex flex-col gap-5 p-7 sm:p-9">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-3 py-1 font-body text-xs font-semibold text-forest-700">
                      <TagIcon />
                      {t(`news.category${category}`)}
                    </span>
                    <span className="font-body text-sm text-ink-400">{formatted}</span>
                  </div>

                  <h1 className="font-body text-2xl font-bold leading-tight text-forest-900 sm:text-3xl">{title}</h1>
          
                  <p className="whitespace-pre-line font-body text-base leading-relaxed text-ink-600">{description}</p>
                </div>
              </div>
            </Reveal>
          )}

          {!loading && news && photos.length > 0 && (
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
