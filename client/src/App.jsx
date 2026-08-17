import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Gallery from "./pages/Gallery.jsx";
import AlbumDetail from "./pages/AlbumDetail.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import News from "./pages/News.jsx";
import NewsDetail from "./pages/NewsDetail.jsx";
import NoticeDetail from "./pages/NoticeDetail.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import StoryDetail from "./pages/StoryDetail.jsx";
import VacancyDetail from "./pages/VacancyDetail.jsx";
import NotFound from "./pages/NotFound.jsx";

import Login from "./pages/admin/Login.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import NewsManage from "./pages/admin/NewsManage.jsx";
import ProjectsManage from "./pages/admin/ProjectsManage.jsx";
import GalleryManage from "./pages/admin/GalleryManage.jsx";
import MessagesManage from "./pages/admin/MessagesManage.jsx";
import SettingsManage from "./pages/admin/SettingsManage.jsx";
import NoticesManage from "./pages/admin/NoticesManage.jsx";
import EventsManage from "./pages/admin/EventsManage.jsx";
import StoriesManage from "./pages/admin/StoriesManage.jsx";
import DownloadsManage from "./pages/admin/DownloadsManage.jsx";
import VacanciesManage from "./pages/admin/VacanciesManage.jsx";
import VideosManage from "./pages/admin/VideosManage.jsx";
import ApplicationsManage from "./pages/admin/ApplicationsManage.jsx";
import LeadersManage from "./pages/admin/LeadersManage.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
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
          <Route path="downloads" element={<DownloadsManage />} />
          <Route path="vacancies" element={<VacanciesManage />} />
          <Route path="applications" element={<ApplicationsManage />} />
          <Route path="videos" element={<VideosManage />} />
          <Route path="projects" element={<ProjectsManage />} />
          <Route path="gallery" element={<GalleryManage />} />
          <Route path="leadership" element={<LeadersManage />} />
          <Route path="messages" element={<MessagesManage />} />
          <Route path="settings" element={<SettingsManage />} />
        </Route>
      </Routes>
    </>
  );
}
