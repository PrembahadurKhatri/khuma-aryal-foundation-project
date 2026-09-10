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
import { Shine } from "../components/Button.jsx";

const UPDATES_COUNT = 3;

// Kicker-style heading + optional "View All" action link, used by all four
// teaser sections below. No gold accent bar here — kept plain so the eye
// goes to the button, not a decorative underline.
function SectionHeader({ title, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h2 className="font-body text-2xl font-bold text-forest-900 sm:text-3xl">{title}</h2>
      {action}
    </div>
  );
}

// Pill button (not a plain text link) so "Read More" reads as a real call
// to action, matching the weight of buttons used elsewhere on the site
// (e.g. the "Back to Projects" pill on ProjectDetail). Same forest-600 as
// Hero's primary Button + the same diagonal Shine sweep on hover, so this
// reads as the same CTA treatment rather than a near-miss variant.
function ViewAllLink({ to, label }) {
  return (
    <Link
      to={to}
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-forest-600 py-2.5 pl-5 pr-3 font-body text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-700 hover:shadow-lift"
    >
      <Shine />
      <span className="relative z-10">{label}</span>
      <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-1">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

function CardSkeleton({ count = 3, className = "h-72" }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${className} animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60`} />
      ))}
    </div>
  );
}

// Surfaces a failed fetch instead of leaving the section stuck on its
// skeleton forever (data stays null on error, so a bare `!data` loading
// check never resolves) — visible proof-on-page of what went wrong, so a
// visitor (or admin) can screenshot the actual reason without needing
// devtools, which matters a lot on mobile / in-app browsers.
function LoadFailed({ error }) {
  const reason = error?.response?.status ? `Server responded with status ${error.response.status}.` : error?.message || "Network error.";
  return (
    <p className="rounded-xl2 border border-red-200 bg-red-50 py-8 text-center font-body text-sm text-red-700 shadow-card">
      Couldn't load this section right now. ({reason})
    </p>
  );
}

const PILLARS = [
  { key: "pillarEducation", descKey: "pillarEducationDesc",  },
  { key: "pillarHealth", descKey: "pillarHealthDesc",  },
  { key: "pillarSports", descKey: "pillarSportsDesc", },
  { key: "pillarEmployment", descKey: "pillarEmploymentDesc", },
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
  const { data: projects, loading: projectsLoading, error: projectsError } = useContent(getProjects);
  const { data: news, loading: newsLoading, error: newsError } = useContent(getNews);
  const { data: notices, loading: noticesLoading, error: noticesError } = useContent(getNotices);
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
            {newsLoading || (!news && !newsError) ? (
              <CardSkeleton />
            ) : newsError ? (
              <LoadFailed error={newsError} />
            ) : latestNews.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("home.updatesEmptyNews")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            {noticesLoading || (!notices && !noticesError) ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
                ))}
              </div>
            ) : noticesError ? (
              <LoadFailed error={noticesError} />
            ) : latestNotices.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("home.updatesEmptyNotices")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            {projectsLoading || (!projects && !projectsError) ? (
              <CardSkeleton />
            ) : projectsError ? (
              <LoadFailed error={projectsError} />
            ) : latestProjects.length === 0 ? (
              <p className="rounded-xl2 border border-forest-100 bg-white py-8 text-center font-body text-sm text-ink-600 shadow-card">{t("home.updatesEmptyProjects")}</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Live Facebook feed — only when Settings has a Facebook link saved
          (admin/SettingsManage.jsx's Social Media Links); silently omitted
          otherwise rather than showing an empty/broken embed. Uses Meta's
          own Page Plugin iframe, which needs nothing but the public page
          URL — no API key/token, and it updates itself as new posts go up,
          so this never goes stale the way a manually-copied screenshot
          would. Helmet's CSP (server.js) already allows facebook.com as a
          frame-src, added earlier for the same reason on Gallery's video
          embeds. */}
      {siteInfo?.social?.facebook && (
        <section className="relative overflow-hidden bg-cream-100 py-20 sm:py-24">
          <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-forest-100/50 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-gilt-200/20 blur-3xl" aria-hidden="true" />
          <Container className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Reveal variant="left">
              <span className="font-body text-xs font-bold uppercase tracking-[0.2em] text-gilt-600">{t("home.socialKicker")}</span>
              <h2 className="mt-4 font-body text-2xl font-bold leading-tight text-forest-900 sm:text-3xl lg:text-[2.25rem]">{t("home.socialTitle")}</h2>
              <p className="mt-4 max-w-md font-body text-base leading-relaxed text-ink-600">{t("home.socialSubtitle")}</p>
              <a
                href={siteInfo.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative mt-7 inline-flex w-fit items-center gap-2 overflow-hidden rounded-full bg-forest-600 px-7 py-3 font-body text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-700 hover:shadow-lift"
              >
                <Shine />
                <svg viewBox="0 0 24 24" fill="currentColor" className="relative z-10 h-4 w-4" aria-hidden="true">
                  <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.55c0-.86.24-1.44 1.47-1.44h1.57V4.46A21 21 0 0 0 14.1 4.3c-2.3 0-3.87 1.4-3.87 3.98v2.22H7.67v2.96h2.56V21h3.27Z" />
                </svg>
                <span className="relative z-10">{t("home.socialFollowButton")}</span>
              </a>
            </Reveal>

            <Reveal variant="right" delay={0.1}>
              {/* Meta's plugin isn't fully fluid past ~500px, so it's capped
                  and centered rather than stretched full-width on a wide
                  desktop column. adapt_container_width still lets it shrink
                  down cleanly on mobile. */}
              <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl3 border border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <iframe
                  key={siteInfo.social.facebook}
                  title="Facebook feed"
                  src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(siteInfo.social.facebook)}&tabs=timeline&width=500&height=560&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
                  width="100%"
                  height="560"
                  style={{ border: "none", overflow: "hidden", display: "block" }}
                  scrolling="yes"
                  loading="lazy"
                  allow="encrypted-media"
                />
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      {/* Footer CTA — last section on the page, right above the site Footer */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-850 to-forest-700 py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gilt-500/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-forest-400/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden="true" />
        <Container className="relative flex flex-col items-center gap-5 text-center">
          <h2 className="font-body text-2xl font-bold text-white sm:text-3xl">{t("home.ctaTitle")}</h2>
          <p className="max-w-2xl font-body text-sm leading-relaxed text-forest-100 sm:text-base">{t("home.ctaSubtitle")}</p>
          <a
            href={siteInfo?.email ? `mailto:${siteInfo.email}` : "#"}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-gilt-500 px-7 py-3 font-body text-sm font-semibold text-forest-950 shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-gilt-400"
          >
            {t("home.ctaButton")} →
          </a>
        </Container>
      </section>
    </>
  );
}
