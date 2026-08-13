import { useLanguage } from "../i18n/LanguageContext.jsx";
import Container from "../components/Container.jsx";
import Button from "../components/Button.jsx";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <section className="flex min-h-[60vh] items-center justify-center py-20">
      <Container className="flex flex-col items-center gap-5 text-center">
        <span className="font-display text-6xl font-semibold text-forest-200">404</span>
        <h1 className="font-display text-2xl font-semibold text-forest-900">{t("notFound.title")}</h1>
        <p className="max-w-md text-sm text-ink-600 sm:text-base">{t("notFound.subtitle")}</p>
        <Button to="/">{t("notFound.backHome")}</Button>
      </Container>
    </section>
  );
}
