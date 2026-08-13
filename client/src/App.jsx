import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Gallery from "./pages/Gallery.jsx";
import Projects from "./pages/Projects.jsx";
import News from "./pages/News.jsx";
import NotFound from "./pages/NotFound.jsx";

import Login from "./pages/admin/Login.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import NewsManage from "./pages/admin/NewsManage.jsx";
import ProjectsManage from "./pages/admin/ProjectsManage.jsx";
import GalleryManage from "./pages/admin/GalleryManage.jsx";
import MessagesManage from "./pages/admin/MessagesManage.jsx";
import SettingsManage from "./pages/admin/SettingsManage.jsx";

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
          <Route path="/projects" element={<Projects />} />
          <Route path="/news" element={<News />} />
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
          <Route path="projects" element={<ProjectsManage />} />
          <Route path="gallery" element={<GalleryManage />} />
          <Route path="messages" element={<MessagesManage />} />
          <Route path="settings" element={<SettingsManage />} />
        </Route>
      </Routes>
    </>
  );
}
