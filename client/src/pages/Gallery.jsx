import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useContent } from "../hooks/useContent.js";
import { getGalleryAlbums, getGalleryVideos } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import AlbumCard from "../components/gallery/AlbumCard.jsx";
import VideoCard from "../components/gallery/VideoCard.jsx";
import VideoLightbox from "../components/gallery/VideoLightbox.jsx";

// Real photos of the Foundation's work, cycling in the hero the same way
// the Home page's hero slides through HERO_IMAGES (see components/Hero.jsx).
const GALLERY_HERO_IMAGES = [
  "/images/gallery.webp",
  "/images/galleyr2.jpg",
];

const CATEGORIES = ["All", "Event", "Education", "Health", "Community", "Distribution", "DisasterRelief"];
// Shows 9 at a time (3 clean rows of 3 on the desktop grid) — "Show More"
// reveals the next 9, repeating until everything for the current filter is
// visible, at which point the button disappears on its own. Same page size
// for both Photos and Videos tabs.
const PAGE_SIZE = 9;

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M11 4h6a3 3 0 0 1 3 3v6l-9 9-9-9 9-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M21 16l-5.5-5.5a1 1 0 0 0-1.4 0L5 19" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function PlayCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.3 9v6l5-3-5-3Z" fill="currentColor" />
    </svg>
  );
}

// Category filter pills + sort dropdown — identical structure for both
// Photos and Videos, only the data/handlers differ, so it's factored out
// once rather than duplicated per tab.
function FilterBar({ category, onCategory, sort, onSort, sortLabels, allLabel }) {
  const { t } = useLanguage();
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onCategory(key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-body text-sm font-semibold transition-colors duration-150 ${
              category === key ? "bg-forest-700 text-white shadow-soft" : "bg-cream-200 text-ink-600 hover:bg-forest-50 hover:text-forest-700"
            }`}
          >
            {key === "All" ? <GridIcon /> : <TagIcon />}
            {key === "All" && allLabel ? allLabel : t(`gallery.category${key}`)}
          </button>
        ))}
      </div>

      <div className="relative inline-flex w-fit items-center">
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="appearance-none rounded-full border border-forest-100 bg-white py-2 pl-4 pr-9 font-body text-sm font-medium text-ink-800 outline-none transition-colors focus:border-gilt-400"
        >
          <option value="latest">{sortLabels ? sortLabels.latest : t("gallery.sortLatest")}</option>
          <option value="oldest">{sortLabels ? sortLabels.oldest : t("gallery.sortOldest")}</option>
        </select>
        <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-3 h-4 w-4 text-ink-400" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export default function Gallery() {
  const { t } = useLanguage();
  const [tab, setTab] = useState("photos");

  const { data: albums, loading: albumsLoading } = useContent(getGalleryAlbums);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("latest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: videos, loading: videosLoading } = useContent(getGalleryVideos);
  const [videoCategory, setVideoCategory] = useState("All");
  const [videoSort, setVideoSort] = useState("latest");
  const [videoVisibleCount, setVideoVisibleCount] = useState(PAGE_SIZE);
  const [activeVideo, setActiveVideo] = useState(null);

  const filteredAlbums = useMemo(() => {
    if (!albums) return [];
    const list = category === "All" ? albums : albums.filter((a) => (a.category || "Event") === category);
    return [...list].sort((a, b) =>
      sort === "oldest" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [albums, category, sort]);
  const visibleAlbums = filteredAlbums.slice(0, visibleCount);

  const filteredVideos = useMemo(() => {
    if (!videos) return [];
    const list = videoCategory === "All" ? videos : videos.filter((v) => (v.category || "Event") === videoCategory);
    return [...list].sort((a, b) =>
      videoSort === "oldest" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [videos, videoCategory, videoSort]);
  const visibleVideos = filteredVideos.slice(0, videoVisibleCount);

  const handleCategory = (key) => {
    setCategory(key);
    setVisibleCount(PAGE_SIZE);
  };
  const handleVideoCategory = (key) => {
    setVideoCategory(key);
    setVideoVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      <PageHero label={t("gallery.title")} images={GALLERY_HERO_IMAGES} />

      <section className="py-20 sm:py-24">
        <Container>
          {/* Photos / Videos tab toggle — right-aligned in both tabs */}
          <div className="mb-8 flex justify-end">
            <div className="inline-flex w-fit gap-1 rounded-full border border-forest-100 bg-white p-1 shadow-card">
              <button
                type="button"
                onClick={() => setTab("photos")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-body text-sm font-semibold transition-colors duration-150 ${
                  tab === "photos" ? "bg-forest-700 text-white shadow-soft" : "text-ink-600 hover:text-forest-700"
                }`}
              >
                <ImageIcon />
                {t("gallery.tabPhotos")}
              </button>
              <button
                type="button"
                onClick={() => setTab("videos")}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 font-body text-sm font-semibold transition-colors duration-150 ${
                  tab === "videos" ? "bg-forest-700 text-white shadow-soft" : "text-ink-600 hover:text-forest-700"
                }`}
              >
                <PlayCircleIcon />
                {t("gallery.tabVideos")}
              </button>
            </div>
          </div>

          {tab === "photos" ? (
            <>
              <FilterBar category={category} onCategory={handleCategory} sort={sort} onSort={setSort} />

              {albumsLoading || !albums ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-[4/3] animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                  ))}
                </div>
              ) : filteredAlbums.length === 0 ? (
                <p className="text-center text-ink-600">{t("gallery.empty")}</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleAlbums.map((album, i) => (
                      <Reveal key={album.id} delay={(i % 6) * 0.05} className="h-full">
                        <AlbumCard album={album} />
                      </Reveal>
                    ))}
                  </div>

                  {visibleCount < filteredAlbums.length && (
                    <div className="mt-12 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-6 py-2.5 font-body text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-forest-800 hover:shadow-lift"
                      >
                        <RefreshIcon />
                        {t("gallery.loadMore")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <FilterBar category={videoCategory} onCategory={handleVideoCategory} sort={videoSort} onSort={setVideoSort} allLabel={t("gallery.categoryAllVideos")} />

              {videosLoading || !videos ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-video animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                  ))}
                </div>
              ) : filteredVideos.length === 0 ? (
                <p className="text-center text-ink-600">{t("gallery.emptyVideos")}</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleVideos.map((video, i) => (
                      <Reveal key={video.id} delay={(i % 6) * 0.05} className="h-full">
                        <VideoCard video={video} onPlay={setActiveVideo} />
                      </Reveal>
                    ))}
                  </div>

                  {videoVisibleCount < filteredVideos.length && (
                    <div className="mt-12 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVideoVisibleCount((c) => c + PAGE_SIZE)}
                        className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-6 py-2.5 font-body text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-forest-800 hover:shadow-lift"
                      >
                        <RefreshIcon />
                        {t("gallery.loadMoreVideos")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </section>

      {activeVideo && <VideoLightbox video={activeVideo} onClose={() => setActiveVideo(null)} />}
    </>
  );
}
