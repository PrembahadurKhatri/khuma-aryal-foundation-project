import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useContent } from "../hooks/useContent.js";
import { NEWS_CATEGORIES } from "../utils/newsCategories.js";
import { getNews, getNotices, getEvents, getStories, getProjects, getVacancies } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import NewsCard from "../components/NewsCard.jsx";
import NoticeCard from "../components/NoticeCard.jsx";
import EventCard from "../components/EventCard.jsx";
import StoryCard from "../components/StoryCard.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import VacancyCard from "../components/VacancyCard.jsx";
import NewsSidebar from "../components/NewsSidebar.jsx";

// Dedicated local hero photo for this page — same idea as
// PROJECTS_HERO_IMAGES/GALLERY_HERO_IMAGES.
const NEWS_HERO_IMAGES = ["/images/kafnews.png"];

const PAGE_SIZE = 6;
const ACTIVITIES_COUNT = 3;

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
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

// Small local heading used by every section below the Latest News grid —
// kicker-style label + title, matching the visual language used on
// ProjectDetail/About (gold accent bar under a bold heading).
function SectionHeader({ title, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="font-body text-2xl font-bold text-forest-900 sm:text-3xl">{title}</h2>
      
      </div>
      {action}
    </div>
  );
}

export default function News() {
  const { t } = useLanguage();
  const { data: news, loading: newsLoading } = useContent(getNews);
  const { data: notices, loading: noticesLoading } = useContent(getNotices);
  const { data: events, loading: eventsLoading } = useContent(getEvents);
  const { data: stories, loading: storiesLoading } = useContent(getStories);
  const { data: projects, loading: projectsLoading } = useContent(getProjects);
  const { data: vacancies, loading: vacanciesLoading } = useContent(getVacancies);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [year, setYear] = useState("All");
  const [sort, setSort] = useState("latest");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredNews = useMemo(() => {
    if (!news) return [];
    const q = search.trim().toLowerCase();
    let list = news;
    if (category !== "All") list = list.filter((n) => (n.category || "General") === category);
    if (year !== "All") list = list.filter((n) => String(new Date(n.date).getFullYear()) === year);
    if (q) {
      list = list.filter((n) => {
        const title = `${n.title?.en || ""} ${n.title?.ne || ""}`.toLowerCase();
        const desc = `${n.description?.en || ""} ${n.description?.ne || ""}`.toLowerCase();
        return title.includes(q) || desc.includes(q);
      });
    }
    return [...list].sort((a, b) => (sort === "oldest" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)));
  }, [news, search, category, year, sort]);

  const visibleNews = filteredNews.slice(0, visibleCount);

  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    return [...events].filter((e) => new Date(e.date) >= new Date(new Date().toDateString())).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const completedProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => p.status === "completed").slice(0, ACTIVITIES_COUNT);
  }, [projects]);

  const openVacancies = useMemo(() => {
    if (!vacancies) return [];
    return vacancies.filter((v) => new Date(v.deadline) >= new Date(new Date().toDateString())).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [vacancies]);

  const resetFilters = (updates) => {
    setVisibleCount(PAGE_SIZE);
    if (updates.category !== undefined) setCategory(updates.category);
    if (updates.year !== undefined) setYear(updates.year);
  };

  return (
    <>
      <PageHero label={t("news.title")} images={NEWS_HERO_IMAGES} />

      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gilt-400/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full bg-forest-100/40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />

        <Container className="relative">
          {/* ================= Latest News + Search/Filter + Sidebar ================= */}
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              <SectionHeader title={t("news.sectionLatestNews")} />

              <div className="mb-8 flex flex-col gap-4">
                <div className="flex items-center gap-2 rounded-full border border-forest-100 bg-white px-4 py-2.5 shadow-card">
                  <SearchIcon />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    placeholder={t("news.searchPlaceholder")}
                    className="w-full bg-transparent font-body text-sm text-ink-800 outline-none placeholder:text-ink-400"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => resetFilters({ category: "All" })}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-body text-xs font-semibold transition-colors duration-150 ${
                        category === "All" ? "bg-forest-700 text-white shadow-soft" : "bg-cream-200 text-ink-600 hover:bg-forest-50 hover:text-forest-700"
                      }`}
                    >
                      <GridIcon />
                      {t("news.filterAll")}
                    </button>
                    {NEWS_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => resetFilters({ category: c })}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-body text-xs font-semibold transition-colors duration-150 ${
                          category === c ? "bg-forest-700 text-white shadow-soft" : "bg-cream-200 text-ink-600 hover:bg-forest-50 hover:text-forest-700"
                        }`}
                      >
                        <TagIcon />
                        {t(`news.category${c}`)}
                      </button>
                    ))}
                  </div>

                  <div className="relative inline-flex w-fit items-center">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="appearance-none rounded-full border border-forest-100 bg-white py-2 pl-4 pr-9 font-body text-sm font-medium text-ink-800 outline-none transition-colors focus:border-gilt-400"
                    >
                      <option value="latest">{t("news.sortLatest")}</option>
                      <option value="oldest">{t("news.sortOldest")}</option>
                    </select>
                    <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute right-3 h-4 w-4 text-ink-400" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {newsLoading || !news ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-72 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                  ))}
                </div>
              ) : filteredNews.length === 0 ? (
                <p className="rounded-xl2 border border-forest-100 bg-white py-10 text-center font-body text-sm text-ink-600 shadow-card">{t("news.noResults")}</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {visibleNews.map((item, i) => (
                      <Reveal key={item.id} delay={(i % 4) * 0.05} className="h-full">
                        <NewsCard news={item} />
                      </Reveal>
                    ))}
                  </div>

                  {visibleCount < filteredNews.length && (
                    <div className="mt-10 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                        className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-6 py-2.5 font-body text-sm font-semibold text-white shadow-soft transition-all duration-200 hover:scale-[1.02] hover:bg-forest-800 hover:shadow-lift"
                      >
                        <RefreshIcon />
                        {t("news.loadMore")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <NewsSidebar news={news || []} events={upcomingEvents} notices={notices || []} year={year} onYearChange={(y) => resetFilters({ year: y })} />
          </div>

          {/* ================= Important Notices ================= */}
          <div className="mt-20">
            <SectionHeader title={t("news.sectionNotices")} />
            {noticesLoading || !notices ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                ))}
              </div>
            ) : notices.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("news.emptyNotices")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {notices.map((notice, i) => (
                  <Reveal key={notice.id} delay={(i % 4) * 0.05}>
                    <NoticeCard notice={notice} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* ================= Job Vacancies ================= */}
          <div className="mt-20">
            <SectionHeader title={t("news.sectionVacancies")} />
            {vacanciesLoading || !vacancies ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-56 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                ))}
              </div>
            ) : openVacancies.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("news.emptyVacancies")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {openVacancies.map((vacancy, i) => (
                  <Reveal key={vacancy.id} delay={(i % 3) * 0.05} className="h-full">
                    <VacancyCard vacancy={vacancy} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* ================= Upcoming Events ================= */}
          <div className="mt-20">
            <SectionHeader title={t("news.sectionEvents")} />
            {eventsLoading || !events ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("news.emptyEvents")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event, i) => (
                  <Reveal key={event.id} delay={(i % 3) * 0.05} className="h-full">
                    <EventCard event={event} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* ================= Recent Activities (completed Projects) ================= */}
          <div className="mt-20">
            <SectionHeader
              title={t("news.sectionActivities")}
              action={
                <Link to="/projects" className="font-body text-sm font-semibold text-forest-600 hover:text-forest-800">
                  {t("news.viewAllActivities")} →
                </Link>
              }
            />
            {projectsLoading || !projects ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                ))}
              </div>
            ) : completedProjects.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("news.emptyActivities")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {completedProjects.map((project, i) => (
                  <Reveal key={project.id} delay={(i % 3) * 0.05} className="h-full">
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* ================= Success Stories ================= */}
          <div className="mt-20">
            <SectionHeader title={t("news.sectionStories")} />
            {storiesLoading || !stories ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                ))}
              </div>
            ) : stories.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("news.emptyStories")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((story, i) => (
                  <Reveal key={story.id} delay={(i % 3) * 0.05} className="h-full">
                    <StoryCard story={story} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

        </Container>
      </section>
    </>
  );
}
