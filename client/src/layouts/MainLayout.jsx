import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import useTrackVisit from "../hooks/useTrackVisit.js";
import { SiteInfoProvider } from "../contexts/SiteInfoContext.jsx";

// Public-site chrome (Navbar/Footer) + visitor tracking, kept separate from
// AdminLayout so the admin panel never shows the public nav/footer and
// browsing it never counts toward the "Website Visitors" dashboard stat.
export default function MainLayout() {
  useTrackVisit();

  return (
    <SiteInfoProvider>
      <div className="flex min-h-screen flex-col bg-cream-100">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SiteInfoProvider>
  );
}
