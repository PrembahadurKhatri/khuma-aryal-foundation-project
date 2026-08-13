import { useState, useMemo } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useContent } from "../hooks/useContent.js";
import { getProjects } from "../services/contentService.js";
import Container from "../components/Container.jsx";
import PageHero from "../components/PageHero.jsx";
import Reveal from "../components/Reveal.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import Skeleton from "../components/Skeleton.jsx";

const FILTERS = [
  { key: "all", labelKey: "projects.filterAll" },
  { key: "ongoing", labelKey: "projects.filterOngoing" },
  { key: "completed", labelKey: "projects.filterPast" },
];

export default function Projects() {
  const { t } = useLanguage();
  const { data: projects, loading } = useContent(getProjects);
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (filter === "all") return projects;
    return projects.filter((p) => p.status === filter);
  }, [projects, filter]);

  return (
    <>
      <PageHero label={t("projects.title")} />

      <section className="py-20 sm:py-24">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-150 ${
                  filter === f.key ? "bg-forest-600 text-white shadow-soft" : "border border-forest-200 text-forest-700 hover:bg-forest-50"
                }`}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>

          {loading || !projects ? (
            <Skeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project, i) => (
                <Reveal key={project.id} delay={(i % 3) * 0.08}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
