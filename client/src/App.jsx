import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// Home is the one page nearly every visitor lands on first, so it stays a
// normal (eager) import — no point deferring the page that's already being
// requested. Everything else below is lazy: this single JS bundle used to
// ship the ENTIRE site (every public page's code, plus the full ~4,500-line
// admin panel with all 11 manage pages) to every visitor before the
// homepage could even render, regardless of whether they'd ever navigate
// anywhere else. React.lazy + Suspense turns each route into its own small
// chunk, fetched only when a visitor actually goes there — the admin panel
// in particular is code no public visitor ever needs at all.
import Home from "./pages/Home.jsx";

const About = lazy(() => import("./pages/About.jsx"));
const Gallery = lazy(() => import("./pages/Gallery.jsx"));
const AlbumDetail = lazy(() => import("./pages/AlbumDetail.jsx"));
const Projects = lazy(() => import("./pages/Projects.jsx"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail.jsx"));
const News = lazy(() => import("./pages/News.jsx"));
const NewsDetail = lazy(() => import("./pages/NewsDetail.jsx"));
const NoticeDetail = lazy(() => import("./pages/NoticeDetail.jsx"));
const EventDetail = lazy(() => import("./pages/EventDetail.jsx"));
const StoryDetail = lazy(() => import("./pages/StoryDetail.jsx"));
const VacancyDetail = lazy(() => import("./pages/VacancyDetail.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const Login = lazy(() => import("./pages/admin/Login.jsx"));
const ForgotPassword = lazy(() => import("./pages/admin/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/admin/ResetPassword.jsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const NewsManage = lazy(() => import("./pages/admin/NewsManage.jsx"));
const ProjectsManage = lazy(() => import("./pages/admin/ProjectsManage.jsx"));
const GalleryManage = lazy(() => import("./pages/admin/GalleryManage.jsx"));
const MessagesManage = lazy(() => import("./pages/admin/MessagesManage.jsx"));
const SettingsManage = lazy(() => import("./pages/admin/SettingsManage.jsx"));
const NoticesManage = lazy(() => import("./pages/admin/NoticesManage.jsx"));
const EventsManage = lazy(() => import("./pages/admin/EventsManage.jsx"));
const StoriesManage = lazy(() => import("./pages/admin/StoriesManage.jsx"));
const VacanciesManage = lazy(() => import("./pages/admin/VacanciesManage.jsx"));
const VideosManage = lazy(() => import("./pages/admin/VideosManage.jsx"));
const ApplicationsManage = lazy(() => import("./pages/admin/ApplicationsManage.jsx"));
const LeadersManage = lazy(() => import("./pages/admin/LeadersManage.jsx"));
const BoardMembersManage = lazy(() => import("./pages/admin/BoardMembersManage.jsx"));

// Small, unbranded fallback — shown only for the fraction of a second a
// lazy chunk takes to download on a route change (and only past the first
// visit, since the browser caches each chunk after that).
function RouteLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-forest-200 border-t-forest-600" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoading />}>
      <Routes>
        {/* Public site */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:id" element={<AlbumDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/notices/:id" element={<NoticeDetail />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/stories/:id" element={<StoryDetail />} />
          <Route path="/vacancies/:id" element={<VacancyDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="news" element={<NewsManage />} />
          <Route path="notices" element={<NoticesManage />} />
          <Route path="events" element={<EventsManage />} />
          <Route path="stories" element={<StoriesManage />} />
          <Route path="vacancies" element={<VacanciesManage />} />
          <Route path="applications" element={<ApplicationsManage />} />
          <Route path="videos" element={<VideosManage />} />
          <Route path="projects" element={<ProjectsManage />} />
          <Route path="gallery" element={<GalleryManage />} />
          <Route path="leadership" element={<LeadersManage />} />
          <Route path="board-members" element={<BoardMembersManage />} />
          <Route path="messages" element={<MessagesManage />} />
          <Route path="settings" element={<SettingsManage />} />
        </Route>
      </Routes>
      </Suspense>
    </>
  );
}
