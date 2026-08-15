import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { fetchNews } from "../../services/newsService.js";
import { fetchProjects } from "../../services/projectService.js";
import { fetchAlbums } from "../../services/galleryService.js";
import { fetchMessages } from "../../services/messageService.js";
import { fetchVisitStats } from "../../services/visitService.js";

const StatCard = ({ label, value, sublabel, theme }) => (
  <div className={`rounded-xl border p-6 ${theme === "dark" ? "border-gray-800 bg-gray-900" : "border-forest-100 bg-white shadow-sm"}`}>
    <p className={`font-body text-sm ${theme === "dark" ? "text-gray-400" : "text-ink-600"}`}>{label}</p>
    <p className="mt-2 font-display text-3xl font-bold text-forest-700 dark:text-forest-400">{value}</p>
    {sublabel && <p className={`mt-1 font-body text-xs ${theme === "dark" ? "text-gray-500" : "text-ink-400"}`}>{sublabel}</p>}
  </div>
);

const Dashboard = () => {
  const { theme } = useOutletContext();

  const { data: newsData } = useQuery({ queryKey: ["admin-news"], queryFn: fetchNews });
  const { data: projectsData } = useQuery({ queryKey: ["admin-projects"], queryFn: fetchProjects });
  const { data: galleryData } = useQuery({ queryKey: ["admin-gallery"], queryFn: fetchAlbums });
  const { data: newMessagesData } = useQuery({
    queryKey: ["admin-new-messages-count"],
    queryFn: () => fetchMessages({ status: "new" }),
  });
  const { data: visitsData } = useQuery({ queryKey: ["admin-visit-stats"], queryFn: fetchVisitStats });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-body text-2xl font-bold">Dashboard</h1>
        <p className={`font-body text-sm ${theme === "dark" ? "text-gray-400" : "text-ink-600"}`}>CMS overview</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Website Visitors"
          value={visitsData?.data?.total ?? "—"}
          sublabel={visitsData?.data ? `${visitsData.data.last7Days} in the last 7 days` : undefined}
          theme={theme}
        />
        <StatCard label="News / Notices" value={newsData?.count ?? "—"} theme={theme} />
        <StatCard label="Projects" value={projectsData?.count ?? "—"} theme={theme} />
        <StatCard label="New Messages" value={newMessagesData?.count ?? "—"} theme={theme} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <StatCard label="Gallery Albums" value={galleryData?.count ?? "—"} theme={theme} />
      </div>

      <div className={`mt-10 rounded-xl border p-6 ${theme === "dark" ? "border-gray-800 bg-gray-900" : "border-forest-100 bg-white shadow-sm"}`}>
        <h2 className="mb-2 font-body font-semibold">Getting Started</h2>
        <p className={`font-body text-sm leading-relaxed ${theme === "dark" ? "text-gray-400" : "text-ink-600"}`}>
          This dashboard is wired to the live API. Use the sidebar to manage News/Notice, Projects, Gallery and site
          Settings, and check Messages for new contact-form submissions from the public site.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
