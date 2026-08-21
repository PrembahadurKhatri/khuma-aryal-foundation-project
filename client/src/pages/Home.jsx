import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useContent } from "../hooks/useContent.js";
import { getMessages, getBoardMembers, getProjects, getNews, getNotices, getSiteInfo } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import Hero from "../components/Hero.jsx";
import Reveal from "../components/Reveal.jsx";
import LeadershipMessages from "../components/leadership/LeadershipMessages.jsx";
import BoardMembers from "../components/BoardMembers.jsx";
import NewsCard from "../components/NewsCard.jsx";
import NoticeCard from "../components/NoticeCard.jsx";
import ProjectCard from "../components/ProjectCard.jsx";

const UPDATES_COUNT = 3;

// Kicker-style heading + optional "View All" action link, used by all four
// teaser sections below. No gold accent bar here — kept plain so the eye
// goes to the button, not a decorative underline.
function SectionHeader({ title, action }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <h2 className="font-display text-3xl font-semibold text-forest-900 sm:text-4xl">{title}</h2>
      {action}
    </div>
  );
}

// Pill button (not a plain text link) so "Read More" reads as a real call
// to action, matching the weight of buttons used elsewhere on the site
// (e.g. the "Back to Projects" pill on ProjectDetail).
function ViewAllLink({ to, label }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 rounded-full bg-forest-700 py-2.5 pl-5 pr-3 font-body text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lift"
    >
      {label}
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

function CardSkeleton({ count = 3, className = "h-72" }) {
  return (
    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${className} animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60`} />
      ))}
    </div>
  );
}

const PILLARS = [
  { key: "pillarEducation", descKey: "pillarEducationDesc", icon: "🎓" },
  { key: "pillarHealth", descKey: "pillarHealthDesc", icon: "🩺" },
  { key: "pillarSports", descKey: "pillarSportsDesc", icon: "⚽" },
  { key: "pillarEmployment", descKey: "pillarEmploymentDesc", icon: "💼" },
];

const EXPLORE_LINKS = [
  { to: "/about", titleKey: "exploreAbout", descKey: "exploreAboutDesc" },
  { to: "/gallery", titleKey: "exploreGallery", descKey: "exploreGalleryDesc" },
  { to: "/projects", titleKey: "exploreProjects", descKey: "exploreProjectsDesc" },
  { to: "/news", titleKey: "exploreNews", descKey: "exploreNewsDesc"},
];

export default function Home() {
  const { t } = useLanguage();
  const { data: messages, loading } = useContent(getMessages);
  const { data: boardMembers, loading: boardLoading } = useContent(getBoardMembers);
  const { data: projects, loading: projectsLoading } = useContent(getProjects);
  const { data: news, loading: newsLoading } = useContent(getNews);
  const { data: notices, loading: noticesLoading } = useContent(getNotices);
  const { data: siteInfo } = useContent(getSiteInfo);

  // Projects/News/Notices come back newest-first already (see
  // contentService.js) — just take the top 3 of each.
  const latestNews = useMemo(() => (news || []).slice(0, UPDATES_COUNT), [news]);
  const latestNotices = useMemo(() => (notices || []).slice(0, UPDATES_COUNT), [notices]);
  const latestProjects = useMemo(() => (projects || []).slice(0, UPDATES_COUNT), [projects]);

  return (
    <>
      {/* Hero now includes the trust strip and the mission section (with the
          homepage stats folded into it) — see Hero.jsx. */}
      <Hero siteInfo={siteInfo} />
      {/* Leadership messages */}
      <LeadershipMessages messages={messages} loading={loading} />

      {/* Board Members — plain photo directory, separate from the
          Founder/President/leadership "Messages" section above. */}
      <BoardMembers members={boardMembers} loading={boardLoading} />

      {/* Latest News / Notices / Projects — three separate teaser sections,
          each using the exact same card component as its own full page
          (NewsCard/NoticeCard/ProjectCard), not a simplified summary — so a
          card here looks identical to the one a visitor sees after clicking
          through. */}
      <section className="relative overflow-hidden bg-cream-100 py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-gilt-200/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-forest-100/40 blur-3xl" aria-hidden="true" />
        <Container className="relative">
          {/* Latest News */}
          <div>
            <SectionHeader title={t("home.updatesNewsTitle")} action={<ViewAllLink to="/news" label={t("home.readMore")} />} />
            {newsLoading || !news ? (
              <CardSkeleton />
            ) : latestNews.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("home.updatesEmptyNews")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {latestNews.map((item, i) => (
                  <Reveal key={item.id} delay={i * 0.08} className="h-full">
                    <NewsCard news={item} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* Important Notices */}
          <div className="mt-20">
            <SectionHeader title={t("home.updatesNoticesTitle")} action={<ViewAllLink to="/news" label={t("home.readMore")} />} />
            {noticesLoading || !notices ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                ))}
              </div>
            ) : latestNotices.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("home.updatesEmptyNotices")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {latestNotices.map((notice, i) => (
                  <Reveal key={notice.id} delay={i * 0.08}>
                    <NoticeCard notice={notice} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* Latest Projects */}
          <div className="mt-20">
            <SectionHeader title={t("home.updatesProjectsTitle")} action={<ViewAllLink to="/projects" label={t("home.readMore")} />} />
            {projectsLoading || !projects ? (
              <CardSkeleton />
            ) : latestProjects.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("home.updatesEmptyProjects")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {latestProjects.map((project, i) => (
                  <Reveal key={project.id} delay={i * 0.08} className="h-full">
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Footer CTA — last section on the page, right above the site Footer */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-forest-700 py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gilt-500/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-forest-400/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />
        <Container className="relative flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">{t("home.ctaTitle")}</h2>
          <p className="max-w-2xl font-body text-base leading-relaxed text-forest-100 sm:text-lg">{t("home.ctaSubtitle")}</p>
          <a
            href={siteInfo?.email ? `mailto:${siteInfo.email}` : "#"}
            className="group mt-2 inline-flex items-center gap-2.5 rounded-full bg-gilt-500 py-3 pl-7 pr-3 font-body text-sm font-semibold text-forest-950 shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-gilt-400"
          >
            {t("home.ctaButton")}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-950/10 transition-transform duration-300 group-hover:translate-x-1">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </Container>
      </section>
    </>
  );
}
