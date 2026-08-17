import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { getNotice } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

const PRIORITY_TONE = {
  important: { border: "border-l-forest-600", badge: "bg-forest-50 text-forest-700" },
  new: { border: "border-l-gilt-500", badge: "bg-gilt-50 text-gilt-700" },
  urgent: { border: "border-l-red-500", badge: "bg-red-50 text-red-600" },
};

function ClipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M8 12.5V7a4 4 0 0 1 8 0v9a2.5 2.5 0 0 1-5 0V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function NoticeDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  // Not useContent() here on purpose — same reasoning as ProjectDetail.jsx:
  // this page's data is keyed by the :id route param.
  useEffect(() => {
    let active = true;
    setLoading(true);
    getNotice(id)
      .then((result) => {
        if (active) {
          setNotice(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setNotice(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!loading && !notice) {
    return <Navigate to="/news" replace />;
  }

  const title = notice ? pick(notice.title, language) : "";
  const description = notice ? pick(notice.description, language) : "";
  const priority = notice?.priority || "important";
  const tone = PRIORITY_TONE[priority] || PRIORITY_TONE.important;

  let formatted = notice?.date;
  try {
    formatted = notice?.date ? new Date(notice.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  } catch {
    formatted = notice?.date;
  }

  return (
    <>
      <PageHero label={loading ? t("news.sectionNotices") : title} />

      <section className="relative overflow-hidden py-20 sm:py-24">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gilt-400/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-forest-100/40 blur-3xl" aria-hidden="true" />

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

          {loading || !notice ? (
            <div className="h-64 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
          ) : (
            <Reveal>
              <div className={`flex flex-col gap-5 rounded-xl3 border border-l-4 border-forest-100 bg-white p-7 shadow-card sm:p-9 ${tone.border}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 font-body text-xs font-bold uppercase tracking-wide ${tone.badge}`}>
                    {t(`news.priority${priority.charAt(0).toUpperCase()}${priority.slice(1)}`)}
                  </span>
                  <span className="font-body text-sm text-ink-400">{formatted}</span>
                </div>

                <h1 className="font-body text-2xl font-bold leading-tight text-forest-900 sm:text-3xl">{title}</h1>
                

                {description && <p className="whitespace-pre-line font-body text-base leading-relaxed text-ink-600">{description}</p>}

                {notice.attachment && (
                  <a
                    href={notice.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-forest-50 px-4 py-2.5 font-body text-sm font-semibold text-forest-700 transition-all duration-300 hover:bg-forest-700 hover:text-white"
                  >
                    <ClipIcon />
                    {t("news.viewAttachment")}
                  </a>
                )}
              </div>
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
