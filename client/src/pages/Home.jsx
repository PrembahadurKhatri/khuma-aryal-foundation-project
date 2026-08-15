import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useContent } from "../hooks/useContent.js";
import { getMessages } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import Hero from "../components/Hero.jsx";
import Reveal from "../components/Reveal.jsx";
import Button from "../components/Button.jsx";
import LeadershipMessages from "../components/leadership/LeadershipMessages.jsx";

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

const STATS = [
  { key: "statYears", value: "10+" },
  { key: "statBeneficiaries", value: "5,000+" },
  { key: "statProjects", value: "40+" },
  { key: "statVolunteers", value: "120+" },
];

export default function Home() {
  const { t } = useLanguage();
  const { data: messages, loading } = useContent(getMessages);

  return (
    <>
      <Hero />
      {/* Stats */}
      <section className="bg-forest-800  py-20">
        <Container>
          <div className="grid grid-cols-2  text-center sm:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal key={stat.key} delay={i * 0.06} className="flex flex-col gap-1">
                <span className="font-display text-3xl font-semibold text-white sm:text-4xl">{stat.value}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-forest-200 sm:text-sm">{t(`home.${stat.key}`)}</span>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      {/* Leadership messages */}
      <LeadershipMessages messages={messages} loading={loading} />



    </>
  );
}
