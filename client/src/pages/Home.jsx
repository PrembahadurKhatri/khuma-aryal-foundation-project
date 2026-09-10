import { useMemo } from "react";
import { motion } from "framer-motion";
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

// A grid fixed at 3 columns still defines 3 explicit column tracks even
// when only 1-2 items exist to fill them, leaving a large, awkward blank
// void beside a lone/sparse card (this is exactly what "Latest Projects"
// looked like with a single project). Scaling both the column count and
// a max-width cap to the real item count keeps a sparse row looking
// deliberately centered/sized instead of stranded in a mostly-empty grid.
function updatesGridClass(count, gap = "gap-6") {
  if (count === 1) return `grid grid-cols-1 ${gap} sm:max-w-md sm:mx-auto`;
  if (count === 2) return `grid grid-cols-1 ${gap} sm:grid-cols-2 lg:max-w-2xl lg:mx-auto`;
  return `grid grid-cols-1 ${gap} sm:grid-cols-2 lg:grid-cols-3`;
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

// Small icon set for the Facebook section's feature row below — kept
// local to this file since nothing else on the page needs them.
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M6 10.5a6 6 0 0 1 12 0v3.2l1.6 2.6H4.4L6 13.7v-3.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="9.5" cy="9" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15 8a2.8 2.8 0 1 1 0 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 13.6c2.2.4 3.5 2 3.5 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ThumbsUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M2 10h3v10H2V10Zm6.5-7 .5.2c.6.3.9 1 .7 1.6L8.7 9H18a2 2 0 0 1 1.9 2.7l-2.1 6A2 2 0 0 1 15.9 19H7V10l3-6.5c.3-.6.9-.9 1.5-.5Z" />
    </svg>
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

  // Splits out "Facebook" (English) / "फेसबुक" (Nepali) from the
  // translated social-section title so it can render bigger and in
  // Facebook's own blue on its own line — same substring-split technique
  // PageHero.jsx's `titleHighlight` uses, done here directly since the
  // word to look for differs by language rather than being passed in.
  const socialTitleRaw = t("home.socialTitle");
  const socialHighlightWord = socialTitleRaw.includes("Facebook") ? "Facebook" : socialTitleRaw.includes("फेसबुक") ? "फेसबुक" : null;
  const [socialTitleBefore, socialTitleAfter] = socialHighlightWord ? socialTitleRaw.split(socialHighlightWord) : [socialTitleRaw, null];

  const SOCIAL_FEATURES = [
    { icon: <CameraIcon />, tone: "bg-blue-50 text-blue-600", title: t("home.socialFeature1Title"), desc: t("home.socialFeature1Desc") },
    { icon: <BellIcon />, tone: "bg-forest-50 text-forest-600", title: t("home.socialFeature2Title"), desc: t("home.socialFeature2Desc") },
    { icon: <UsersIcon />, tone: "bg-gilt-100 text-gilt-700", title: t("home.socialFeature3Title"), desc: t("home.socialFeature3Desc") },
  ];

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
              <div className={updatesGridClass(latestNews.length)}>
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
              <div className={updatesGridClass(latestNotices.length, "gap-4")}>
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
              <div className={updatesGridClass(latestProjects.length)}>
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
        // Asymmetric padding on purpose -- this section follows directly
        // after the News/Notices/Projects section (which already ends with
        // its own py-20/24 bottom padding), so matching top padding here
        // stacked into a distractingly large, near-empty gap between them,
        // especially when Projects has few items to fill its row. Full
        // padding is kept on the bottom, before the CTA section.
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-100 via-cream-100 to-forest-50 pb-20 pt-6 sm:pb-24 sm:pt-8">
          {/* Ambient floating blobs — a slow, looping breathe/drift instead
              of sitting static, replacing the flat dot-grid texture that
              was here before. Purely decorative, never interactive. */}
          <motion.div
            className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl"
            aria-hidden="true"
            animate={{ x: [0, -24, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-gilt-200/20 blur-3xl"
            aria-hidden="true"
            animate={{ x: [0, 22, 0], y: [0, -18, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          />

          <Container className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <Reveal variant="left">
              {/* "Stay Connected" is now the main heading — same size as the
                  "Latest News"/"Important Notices"/"Latest Projects"
                  headings above this section (SectionHeader's h2). "Follow
                  Our Journey on Facebook" drops to kicker size beneath it,
                  the reverse of the previous hierarchy. */}
              <h2 className="font-body text-2xl font-bold leading-tight text-forest-900 sm:text-3xl">{t("home.socialKicker")}</h2>

              <p className="mt-3 font-body text-sm font-bold uppercase tracking-wide text-forest-700">
                {socialTitleBefore}
                {socialHighlightWord && <span className="text-blue-600">{socialHighlightWord}</span>}
                {socialTitleAfter}
              </p>
              <p className="mt-4 max-w-md font-body text-base leading-relaxed text-ink-600">{t("home.socialSubtitle")}</p>

              <div className="mt-7 flex items-center gap-3">
                {/* Small diagonal "spark" marks flanking the button, echoing
                    the reference's highlight flourish. */}
                <span className="hidden shrink-0 -rotate-6 gap-0.5 sm:flex" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-4 w-[2.5px] rounded-full bg-blue-300" style={{ opacity: 1 - i * 0.28 }} />
                  ))}
                </span>
                <a
                  href={siteInfo.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex w-fit items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-b from-blue-500 to-blue-700 px-7 py-3.5 font-body text-sm font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(37,99,235,0.45)]"
                >
                  <Shine />
                  <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-600">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.55c0-.86.24-1.44 1.47-1.44h1.57V4.46A21 21 0 0 0 14.1 4.3c-2.3 0-3.87 1.4-3.87 3.98v2.22H7.67v2.96h2.56V21h3.27Z" />
                    </svg>
                  </span>
                  <span className="relative z-10">{t("home.socialFollowButton")}</span>
                  <svg viewBox="0 0 24 24" fill="none" className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>

              {/* Feature row — three small callouts under the CTA, giving the
                  reason to click rather than leaving the button to speak for
                  itself. */}
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-4">
                {SOCIAL_FEATURES.map((f) => (
                  <div key={f.title} className="flex items-center gap-2.5">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${f.tone}`}>{f.icon}</span>
                    <div className="leading-tight">
                      <div className="font-body text-sm font-bold text-forest-900">{f.title}</div>
                      <div className="font-body text-xs text-ink-500">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal variant="right" delay={0.1}>
              <div className="relative mx-auto w-full max-w-md">
                {/* Decorative rings behind the card — purely ornamental, no
                    rotation on the embed itself (see below): a tilted iframe
                    would make its live scroll/click interaction unusable. */}
                <div className="pointer-events-none absolute -left-6 top-10 h-40 w-40 rounded-full border-[10px] border-blue-200/60" aria-hidden="true" />
                <div className="pointer-events-none absolute -right-8 bottom-6 h-28 w-28 rounded-full bg-forest-200/30 blur-2xl" aria-hidden="true" />

                {/* Floating glossy Facebook badge, top-right corner. */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 12 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute -right-5 -top-6 z-20 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-[0_10px_24px_rgba(37,99,235,0.45)] sm:h-20 sm:w-20"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 sm:h-10 sm:w-10">
                    <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.55c0-.86.24-1.44 1.47-1.44h1.57V4.46A21 21 0 0 0 14.1 4.3c-2.3 0-3.87 1.4-3.87 3.98v2.22H7.67v2.96h2.56V21h3.27Z" />
                  </svg>
                </motion.span>

                {/* The iframe is Facebook's own cross-origin document, so its
                    internal scrollbar can't be restyled from here (a hard
                    browser security boundary, not a choice) — it may render
                    faint/thin/hidden depending on the visitor's OS and
                    browser. This hint makes "there's more, scroll inside the
                    box" unmistakable regardless of how prominent Facebook's
                    own scrollbar looks. Placed above the card (not below,
                    where it would collide with the floating "Like · Share ·
                    Support" pill overlapping the card's bottom edge). */}
                <motion.div
                  className="relative z-10 mb-2 flex items-center justify-center gap-1.5 font-body text-xs font-medium text-ink-500"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span>{t("home.socialScrollHint")}</span>
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>

                {/* The live embed itself — kept flat/unrotated so the real
                    Facebook scroll, clicks and links inside it stay usable;
                    all the tilt/depth is confined to the purely decorative
                    elements around it. */}
                <div className="relative overflow-hidden rounded-xl3 border border-forest-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  {/* Meta's plugin isn't fully fluid past ~500px, so it's
                      given a fixed reference width and adapt_container_width
                      shrinks it cleanly to fit on mobile. */}
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

                {/* Floating "Like · Share · Support" pill, bottom-right —
                    decorative only (not wired to the real page), echoing
                    Facebook's own reaction bar for visual flavor. */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="absolute -bottom-5 right-3 z-20 hidden items-center gap-1.5 rounded-full border border-forest-100 bg-white px-4 py-2 font-body text-xs font-semibold text-ink-700 shadow-lift sm:flex"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <ThumbsUpIcon />
                  </span>
                  Like · Share · Support
                </motion.div>
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
