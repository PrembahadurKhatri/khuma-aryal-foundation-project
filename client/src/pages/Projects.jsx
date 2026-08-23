import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useContent } from "../hooks/useContent.js";
import { getProjects } from "../services/contentService.js";
import { pick } from "../utils/localize.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import FeaturedProjectCard from "../components/FeaturedProjectCard.jsx";
import Skeleton from "../components/Skeleton.jsx";

// Real photos of the Foundation's work, cycling in the hero the same way
// the Gallery page's hero does (see GALLERY_HERO_IMAGES in Gallery.jsx).
const PROJECTS_HERO_IMAGES = [
  "/images/projectt.jpg",
  "/images/projectt2.jpg"
];

// Same category list as the Gallery page (see components/gallery's
// AlbumCard/Gallery.jsx) — reuses the exact same gallery.category*
// translation keys rather than duplicating a parallel set for Projects.
const CATEGORIES = ["All", "Event", "Education", "Health", "Community", "Distribution", "DisasterRelief"];
const STATUSES = ["all", "ongoing", "completed", "upcoming"];
// Shows 9 projects at a time (3 clean rows of 3 on the desktop grid) —
// "Show More Projects" reveals the next 9, same pattern as Gallery.jsx.
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

const statusLabelKey = { all: "projects.filterAll", ongoing: "projects.filterOngoing", completed: "projects.filterPast", upcoming: "projects.filterUpcoming" };

export default function Projects() {
  const { t, language } = useLanguage();
  const { data: projects, loading } = useContent(getProjects);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Pinned "Featured" spotlight — only shown on the fully unfiltered view
  // (no category/status/search narrowing it down), and pulled out of the
  // regular grid below so it isn't shown twice. Same convention as Gallery's
  // featuredAlbum (see Gallery.jsx): if more than one project is ever
  // marked featured, the most recently *updated* one wins.
  const featuredProject = useMemo(() => {
    if (!projects || category !== "All" || status !== "all" || search.trim()) return null;
    const candidates = projects.filter((p) => p.featured);
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
  }, [projects, category, status, search]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    let list = projects.filter((p) => p.id !== featuredProject?.id);
    if (category !== "All") list = list.filter((p) => (p.category || "Event") === category);
    if (status !== "all") list = list.filter((p) => (p.status || "ongoing") === status);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => pick(p.title, language).toLowerCase().includes(q) || pick(p.description, language).toLowerCase().includes(q));
    }
    return [...list].sort((a, b) =>
      sort === "oldest" ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [projects, category, status, search, sort, language, featuredProject]);

  const visible = filtered.slice(0, visibleCount);

  const handleCategory = (key) => {
    setCategory(key);
    setVisibleCount(PAGE_SIZE);
  };

  const handleStatus = (key) => {
    setStatus(key);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      <PageHero label={t("projects.title")} images={PROJECTS_HERO_IMAGES} />

      <section className="pb-20 pt-10 sm:pb-24 sm:pt-14">
        <Container className="flex flex-col gap-8">
          {/* Search (its own full-width row), then category pills + sort
              sharing one row below — same structure as News/Notice's
              search/filter block. */}
          <div className="flex flex-col gap-4">
            <label className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 text-ink-400">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder={t("projects.searchPlaceholder")}
                className="w-full rounded-full border border-forest-100 bg-white py-2 pl-9 pr-4 font-body text-sm text-ink-800 outline-none transition-colors focus:border-gilt-400"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Category pills — horizontal scroll below `sm`, same as the
                  Gallery page's filter row, instead of wrapping to several
                  cramped lines on a narrow screen. */}
              <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {CATEGORIES.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCategory(key)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 font-body text-sm font-semibold transition-colors duration-150 ${
                      category === key ? "bg-forest-700 text-white shadow-soft" : "bg-cream-200 text-ink-600 hover:bg-forest-50 hover:text-forest-700"
                    }`}
                  >
                    {key === "All" ? <GridIcon /> : <TagIcon />}
                    {key === "All" ? t("projects.categoryAll") : t(`gallery.category${key}`)}
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
          </div>

          {/* Status section — separate from category, per its own row */}
          <div className="flex flex-wrap items-center gap-3 border-t border-forest-100 pt-6">
            <span className="font-body text-xs font-semibold uppercase tracking-wide text-ink-400">{t("projects.statusLabel")}</span>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleStatus(key)}
                  className={`rounded-full px-4 py-1.5 font-body text-sm font-semibold transition-colors duration-150 ${
                    status === key ? "bg-forest-600 text-white shadow-soft" : "border border-forest-200 text-forest-700 hover:bg-forest-50"
                  }`}
                >
                  {t(statusLabelKey[key])}
                </button>
              ))}
            </div>
          </div>

          {featuredProject && !loading && (
            <Reveal>
              <FeaturedProjectCard project={featuredProject} />
            </Reveal>
          )}

          {loading || !projects ? (
            <Skeleton count={9} />
          ) : filtered.length === 0 ? (
            <p className="text-center text-ink-600">{t("gallery.empty")}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((project, i) => (
                  <Reveal key={project.id} delay={(i % 6) * 0.05} className="h-full">
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>

              {visibleCount < filtered.length && (
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-6 py-2.5 font-body text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-forest-800 hover:shadow-lift"
                  >
                    <RefreshIcon />
                    {t("projects.loadMore")}
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
