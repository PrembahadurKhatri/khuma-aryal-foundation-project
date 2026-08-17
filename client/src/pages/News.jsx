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

// Each of these sections shows a capped preview with a "More X" button in
// its header (not incremental "load +N more" pagination) — clicking it just
// reveals everything at once.
const NEWS_CAP = 6;
const NOTICES_CAP = 6;
const STORIES_CAP = 3;
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

// Header-row "More X" button — only rendered by the caller when there's
// actually more to reveal. A plain state toggle (not a Link, not
// incremental "+N" pagination): clicking it just shows everything at once.
function MoreButton({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="group inline-flex items-center gap-1 font-body text-sm font-semibold text-forest-600 hover:text-forest-800">
      {label}
      <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
    </button>
  );
}

// Small local heading used by every section below the Latest News grid —
// title (+ optional short subtitle) on the left, an optional action
// (MoreButton/ViewAllButton) on the right.
function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-body text-2xl font-bold text-forest-900 sm:text-3xl">{title}</h2>
        {subtitle && <p className="font-body text-sm text-ink-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Pill-style "View All X" button (white, bordered, chevron-in-a-circle) —
// used where a section wants a more prominent call-to-action than
// MoreButton's plain text link (e.g. Important Notices).
function ViewAllButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white py-2 pl-4 pr-2 font-body text-sm font-semibold text-forest-700 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-700 hover:shadow-lift"
    >
      {label}
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-600 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-forest-700 group-hover:text-white">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
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
  const [newsShowAll, setNewsShowAll] = useState(false);
  const [noticesShowAll, setNoticesShowAll] = useState(false);
  const [storiesShowAll, setStoriesShowAll] = useState(false);

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

  const visibleNews = newsShowAll ? filteredNews : filteredNews.slice(0, NEWS_CAP);
  const visibleNotices = noticesShowAll ? notices || [] : (notices || []).slice(0, NOTICES_CAP);
  const visibleStories = storiesShowAll ? stories || [] : (stories || []).slice(0, STORIES_CAP);

  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    return [...events].filter((e) => new Date(e.date) >= new Date(new Date().toDateString())).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  // "Recent Activities" — projects from the last 30 days (falls back to
  // createdAt when a project has no explicit `date` set), any status, newest
  // first, capped at 3. Not restricted to status="completed" — the section
  // is about what's recently happened/been added, not specifically finished
  // work.
  const recentActivities = useMemo(() => {
    if (!projects) return [];
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return projects
      .filter((p) => new Date(p.date || p.createdAt).getTime() >= cutoff)
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, ACTIVITIES_COUNT);
  }, [projects]);

  const openVacancies = useMemo(() => {
    if (!vacancies) return [];
    return vacancies.filter((v) => new Date(v.deadline) >= new Date(new Date().toDateString())).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [vacancies]);

  const resetFilters = (updates) => {
    setNewsShowAll(false);
    if (updates.category !== undefined) setCategory(updates.category);
    if (updates.year !== undefined) setYear(updates.year);
  };

  return (
    <>
      <PageHero
        label={t("news.kicker")}
        title={t("news.title")}
        colorBackground
        description={t("news.subtitle")}
        badges={[
          t("news.sectionLatestNews"),
          t("news.sectionNotices"),
          t("news.sectionEvents"),
          t("news.sectionActivities"),
          t("news.sectionStories"),
        ]}
      />

      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gilt-400/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full bg-forest-100/40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />

        <Container className="relative">
          {/* ================= Latest News heading + Search/Filter (full width) ================= */}
          <SectionHeader
            title={t("news.sectionLatestNews")}
            action={
              !newsShowAll && filteredNews.length > NEWS_CAP && <MoreButton label={t("news.moreLatestNews")} onClick={() => setNewsShowAll(true)} />
            }
          />

          <div className="mb-10 flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-full border border-forest-100 bg-white px-4 py-2.5 shadow-card">
              <SearchIcon />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setNewsShowAll(false);
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

          {/* ================= News grid ================= */}
          {newsLoading || !news ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <p className="rounded-xl2 border border-forest-100 bg-white py-10 text-center font-body text-sm text-ink-600 shadow-card">{t("news.noResults")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleNews.map((item, i) => (
                <Reveal key={item.id} delay={(i % 6) * 0.05} className="h-full">
                  <NewsCard news={item} />
                </Reveal>
              ))}
            </div>
          )}

          {/* ================= Important Notices ================= */}
          <div className="mt-20">
            <SectionHeader
              title={t("news.sectionNotices")}
              subtitle={t("news.noticesSubtitle")}
              action={
                !noticesShowAll && (notices?.length || 0) > NOTICES_CAP && <ViewAllButton label={t("news.moreNotices")} onClick={() => setNoticesShowAll(true)} />
              }
            />
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
                {visibleNotices.map((notice, i) => (
                  <Reveal key={notice.id} delay={(i % 4) * 0.05}>
                    <NoticeCard notice={notice} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* ================= Job Vacancies — section is skipped entirely
              (not even shown with an empty-state message) once loaded with
              zero open positions ================= */}
          {(vacanciesLoading || !vacancies || openVacancies.length > 0) && (
            <div className="mt-20">
              <SectionHeader title={t("news.sectionVacancies")} />
              {vacanciesLoading || !vacancies ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-56 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                  ))}
                </div>
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
          )}

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

          {/* ================= Recent Activities (Projects, last 30 days) ================= */}
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
            ) : recentActivities.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("news.emptyActivities")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recentActivities.map((project, i) => (
                  <Reveal key={project.id} delay={(i % 3) * 0.05} className="h-full">
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* ================= Success Stories ================= */}
          <div className="mt-20">
            <SectionHeader
              title={t("news.sectionStories")}
              action={
                !storiesShowAll && (stories?.length || 0) > STORIES_CAP && <MoreButton label={t("news.moreStories")} onClick={() => setStoriesShowAll(true)} />
              }
            />
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
                {visibleStories.map((story, i) => (
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
