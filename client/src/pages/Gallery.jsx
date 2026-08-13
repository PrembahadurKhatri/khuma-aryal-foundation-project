import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useContent } from "../hooks/useContent.js";
import { getGalleryImages } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import GalleryGrid from "../components/gallery/GalleryGrid.jsx";

export default function Gallery() {
  const { t } = useLanguage();
  const { data: images, loading } = useContent(getGalleryImages);

  return (
    <>
      <PageHero label={t("gallery.title")} />

      <section className="py-20 sm:py-24">
        <Container>
          {loading || !images ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl2 border border-forest-100 bg-forest-50/60" />
              ))}
            </div>
          ) : (
            <Reveal>
              <GalleryGrid images={images} />
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
