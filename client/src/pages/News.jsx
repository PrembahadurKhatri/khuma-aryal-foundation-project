import { useMemo } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useContent } from "../hooks/useContent.js";
import { getNews } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import NewsCard from "../components/NewsCard.jsx";
import Skeleton from "../components/Skeleton.jsx";

export default function News() {
  const { t } = useLanguage();
  const { data: news, loading } = useContent(getNews);

  const sorted = useMemo(() => {
    if (!news) return [];
    return [...news].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [news]);

  return (
    <>
      <PageHero label={t("news.title")} />

      <section className="py-20 sm:py-24">
        <Container>
          {loading || !news ? (
            <Skeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((item, i) => (
                <Reveal key={item.id} delay={(i % 3) * 0.08}>
                  <NewsCard news={item} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
