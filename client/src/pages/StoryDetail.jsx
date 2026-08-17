import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { getStory } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import PlaceholderImage from "../components/PlaceholderImage.jsx";

export default function StoryDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getStory(id)
      .then((result) => {
        if (active) {
          setStory(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setStory(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!loading && !story) {
    return <Navigate to="/news" replace />;
  }

  const summary = story ? pick(story.summary, language) : "";

  return (
    <>
      <PageHero label={loading ? t("news.sectionStories") : story?.name || t("news.sectionStories")} />

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

          {loading || !story ? (
            <div className="h-96 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
          ) : (
            <Reveal>
              <div className="overflow-hidden rounded-xl3 border border-forest-100 bg-white shadow-card">
                <div className="relative h-72 w-full overflow-hidden sm:h-96">
                  <PlaceholderImage src={story.photo} alt={story.name || "Impact story"} label={story.name} />
                  <span className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />
                  {story.name && (
                    <span className="absolute bottom-5 left-6 font-body text-xl font-bold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">{story.name}</span>
                  )}
                </div>
                <div className="flex flex-col gap-5 p-7 sm:p-9">
             
                  <p className="whitespace-pre-line font-body text-base leading-relaxed text-ink-600">{summary}</p>
                </div>
              </div>
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
