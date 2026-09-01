import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  FolderKanban,
  Image,
  Mail,
  Settings as SettingsIcon,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Megaphone,
  CalendarDays,
  Heart,
  Briefcase,
  Video as VideoIcon,
  ClipboardList,
  Users,
  Landmark,
} from "lucide-react";
import useAuth from "../hooks/useAuth.js";
import { ToastProvider } from "../contexts/ToastContext.jsx";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/news", label: "News", icon: Newspaper },
  { to: "/admin/notices", label: "Notices", icon: Megaphone },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/stories", label: "Impact Stories", icon: Heart },
  { to: "/admin/vacancies", label: "Job Vacancies", icon: Briefcase },
  { to: "/admin/applications", label: "Applications", icon: ClipboardList },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/videos", label: "Gallery Videos", icon: VideoIcon },
  { to: "/admin/leadership", label: "Leadership", icon: Users },
  { to: "/admin/board-members", label: "Board Members", icon: Landmark },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("admin-theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const toggleTheme = () => setTheme((current) => (current === "light" ? "dark" : "light"));

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 border-b border-forest-100 p-6 dark:border-gray-800">
        <img src="/images/kaf.png" alt="Khuma Aryal Foundation" className="h-9 w-9 rounded-full object-cover" />
        <span className="font-body text-lg font-bold leading-tight text-ink-900 dark:text-gray-100">
          Khuma Aryal
          <span className="block font-body text-sm font-medium text-forest-600 dark:text-forest-400">Admin</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 font-body text-sm transition-colors ${
                isActive
                  ? "bg-forest-600/15 font-semibold text-forest-700 dark:bg-forest-500/20 dark:text-forest-300"
                  : "text-ink-600 hover:bg-forest-50 dark:text-gray-300 dark:hover:bg-gray-800"
              }`
            }
          >
            <Icon className="h-[18px] w-[18px]" /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-forest-100 p-4 dark:border-gray-800">
        <div className="mb-3 font-body text-xs text-ink-600 dark:text-gray-400">
          Signed in as{" "}
          <span className="font-semibold text-ink-900 dark:text-gray-100">{user?.name}</span> ({user?.role})
        </div>
        <button
          onClick={toggleTheme}
          className="mb-3 flex items-center gap-2 font-body text-sm text-ink-600 hover:text-forest-700 dark:text-gray-300 dark:hover:text-forest-300"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 font-body text-sm text-ink-600 hover:text-forest-700 dark:text-gray-300 dark:hover:text-forest-300"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-cream-100 text-ink-900 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
        {/* Desktop sidebar — always visible at lg+ */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-forest-100 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90 lg:flex">
          {sidebarContent}
        </aside>

        {/* Mobile sidebar — slide-in drawer with backdrop */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="relative z-50 flex w-72 max-w-[80vw] flex-col border-r border-forest-100 bg-white dark:border-gray-800 dark:bg-gray-900">
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                className="absolute right-4 top-4 text-2xl text-ink-600 dark:text-gray-400"
              >
                <X />
              </button>
              {sidebarContent}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between border-b border-forest-100 bg-white/90 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="text-2xl text-ink-700 dark:text-gray-300">
              <Menu />
            </button>
            <span className="font-body font-bold">Khuma Aryal Admin</span>
            <button onClick={toggleTheme} aria-label="Toggle theme" className="text-xl text-ink-700 dark:text-gray-300">
              {theme === "light" ? <Moon /> : <Sun />}
            </button>
          </div>

          <main className="flex-1 overflow-y-auto bg-cream-100/70 p-4 dark:bg-gray-950 sm:p-6 lg:p-8">
            <Outlet context={{ theme, toggleTheme }} />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

export default AdminLayout;
