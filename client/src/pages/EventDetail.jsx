import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { pick } from "../utils/localize.js";
import { getEvent } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import GalleryGrid from "../components/gallery/GalleryGrid.jsx";
import LinkedAlbumCard from "../components/LinkedAlbumCard.jsx";

const DATE_LOCALES = { en: "en-US", ne: "ne-NP" };

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M12 21s-6.5-5.86-6.5-11A6.5 6.5 0 0 1 18.5 10c0 5.14-6.5 11-6.5 11Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getEvent(id)
      .then((result) => {
        if (active) {
          setEvent(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setEvent(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!loading && !event) {
    return <Navigate to="/news" replace />;
  }

  const name = event ? pick(event.name, language) : "";
  const location = event ? pick(event.location, language) : "";
  const album = event?.album;
  const photos = event?.images ? event.images.map((src, i) => ({ id: `${event.id}-${i}`, src, alt: name })) : [];

  let formatted = event?.date;
  try {
    formatted = event?.date ? new Date(event.date).toLocaleDateString(DATE_LOCALES[language] || "en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  } catch {
    formatted = event?.date;
  }

  return (
    <>
      {/* Same pattern as NewsDetail: the event's own photo becomes the hero
          background (falls back to the Foundation's logo when there isn't
          one), no title text overlaid since the headline is already shown
          right below in the card. */}
      <PageHero label={loading ? t("news.sectionEvents") : name} images={event?.image ? [event.image] : undefined} hideLabel />

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

          {loading || !event ? (
            <div className="h-96 animate-pulse rounded-xl3 border border-forest-100 bg-forest-50/60" />
          ) : (
            <Reveal>
              <div className="overflow-hidden rounded-xl3 border border-forest-100 bg-white shadow-card">
                <div className="flex flex-col gap-5 p-7 sm:p-9">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-sm text-ink-600">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarIcon />
                      <strong className="font-semibold text-ink-800">{formatted}</strong>
                    </span>
                    {event.time && (
                      <span className="inline-flex items-center gap-1.5">
                        <ClockIcon />
                        {event.time}
                      </span>
                    )}
                    {location && (
                      <span className="inline-flex items-center gap-1.5">
                        <PinIcon />
                        {location}
                      </span>
                    )}
                  </div>

                  <h1 className="font-body text-2xl font-bold leading-tight text-forest-900 sm:text-3xl">{name}</h1>

                  {event.registerLink && (
                    <a
                      href={event.registerLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-forest-700 px-6 py-3 font-body text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-lift"
                    >
                      {t("news.register")} →
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {!loading && event && photos.length > 0 && (
            <Reveal delay={0.05}>
              <div className="mt-6 flex flex-col gap-5 rounded-xl3 border border-forest-100 bg-white p-6 shadow-card sm:p-7">
                <div className="flex items-center justify-between">
                  <h2 className="font-body text-xl font-bold text-forest-900">{t("gallery.photosLabel")}</h2>
                  <span className="rounded-full bg-forest-50 px-3 py-1 font-body text-xs font-semibold text-forest-600">{photos.length}</span>
                </div>
                <GalleryGrid images={photos} />
              </div>
            </Reveal>
          )}

          {!loading && album && (
            <Reveal delay={0.1} className="mt-6">
              <LinkedAlbumCard album={album} />
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
