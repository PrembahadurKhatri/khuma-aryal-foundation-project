import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useContent } from "../hooks/useContent.js";
import { getGalleryAlbums } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import AlbumCard from "../components/gallery/AlbumCard.jsx";

// Real photos of the Foundation's work, cycling in the hero the same way
// the Home page's hero slides through HERO_IMAGES (see components/Hero.jsx).
const GALLERY_HERO_IMAGES = [
  "https://i.redd.it/g2p5honq8ye71.jpg",
  "https://scontent.fpkr1-1.fna.fbcdn.net/v/t39.30808-6/615557641_1218005417181508_659253275639996851_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1365&ctp=s2048x1365&_nc_cat=103&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeF0dfL3ogb2cjv2OcbBsOwLKgFfU6k02dEqAV9TqTTZ0bghn0dckuEVnWWYxWx53ay4LDNF4aJp21tIMh_ascgv&_nc_ohc=_iJocRNUGAYQ7kNvwH9h_0j&_nc_oc=AdoQfzZ3nkxjQOpmDiEr3xWjiwxv2-wiax2w0zaapZxhUaLmG9x3Tv8z5Bba6Wc1JvnunlCBteJigOdkpWYdkBEJ&_nc_zt=23&_nc_ht=scontent.fpkr1-1.fna&_nc_gid=rRKK7TcFYr8nuq8u-2NTNA&_nc_ss=7b2a8&oh=00_AQELcDiFXbWeYT--TJKbvRNNQDyNIzWDflN7tFlbT2mbzQ&oe=6A85D980",
];

const CATEGORIES = ["All", "Event", "Education", "Health", "Community", "Distribution", "DisasterRelief"];
// Shows 9 albums at a time (3 clean rows of 3 on the desktop grid) — "Show
// More" reveals the next 9, repeating until every album for the current
// filter is visible, at which point the button disappears on its own.
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

export default function Gallery() {
  const { t } = useLanguage();
  const { data: albums, loading } = useContent(getGalleryAlbums);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("latest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (!albums) return [];
    const list = category === "All" ? albums : albums.filter((a) => (a.category || "Event") === category);
    return [...list].sort((a, b) =>
      sort === "oldest" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [albums, category, sort]);

  const visible = filtered.slice(0, visibleCount);

  const handleCategory = (key) => {
    setCategory(key);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      <PageHero label={t("gallery.title")} images={GALLERY_HERO_IMAGES} />

      <section className="py-20 sm:py-24">
        <Container>
          {/* Filter pills + sort control */}
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategory(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-body text-sm font-semibold transition-colors duration-150 ${
                    category === key ? "bg-forest-700 text-white shadow-soft" : "bg-cream-200 text-ink-600 hover:bg-forest-50 hover:text-forest-700"
                  }`}
                >
                  {key === "All" ? <GridIcon /> : <TagIcon />}
                  {t(`gallery.category${key}`)}
                </button>
              ))}
            </div>

            <div className="relative inline-flex w-fit items-center">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-full border border-forest-100 bg-white py-2 pl-4 pr-9 font-body text-sm font-medium text-ink-800 outline-none transition-colors focus:border-gilt-400"
              >
                <option value="latest">{t("gallery.sortLatest")}</option>
                <option value="oldest">{t("gallery.sortOldest")}</option>
              </select>
              <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-3 h-4 w-4 text-ink-400" aria-hidden="true">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {loading || !albums ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-ink-600">{t("gallery.empty")}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((album, i) => (
                  <Reveal key={album.id} delay={(i % 6) * 0.05} className="h-full">
                    <AlbumCard album={album} />
                  </Reveal>
                ))}
              </div>

              {visibleCount < filtered.length && (
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
        </Container>
      </section>
    </>
  );
}
