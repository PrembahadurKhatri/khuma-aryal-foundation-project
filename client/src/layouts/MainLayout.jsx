import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PageTransition from "../components/PageTransition.jsx";
import RouteSweep from "../components/RouteSweep.jsx";
import useTrackVisit from "../hooks/useTrackVisit.js";
import { SiteInfoProvider, useSiteInfo } from "../contexts/SiteInfoContext.jsx";
import MaintenancePage from "../pages/MaintenancePage.jsx";

// Needs to be inside SiteInfoProvider to read the live maintenance-mode flag
// (useSiteInfo() requires the provider above it in the tree), so this is
// split out from the default-exported MainLayout below rather than calling
// the hook there directly.
function MainLayoutContent() {
  useTrackVisit();
  const location = useLocation();
  const siteInfo = useSiteInfo();

  // Settings → SEO (see admin/SettingsManage.jsx) overrides index.html's
  // static <title>/<meta name="description"> once an admin fills them in.
  // Site-wide, not per-page — there's no per-route Seo component in this
  // project, and the admin form only exposes one title/description, so
  // this is the whole of what "add SEO" means here. Left untouched
  // (index.html's static defaults keep showing) if the admin hasn't set
  // either field yet, rather than blanking them to an empty string.
  useEffect(() => {
    if (siteInfo?.seo?.metaTitle) {
      document.title = siteInfo.seo.metaTitle;
    }
    if (siteInfo?.seo?.metaDescription) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", siteInfo.seo.metaDescription);
    }
  }, [siteInfo?.seo?.metaTitle, siteInfo?.seo?.metaDescription]);

  // /admin/* never renders through this layout (see App.jsx — it has its
  // own AdminLayout), so this only ever gates the public site, never the
  // dashboard an admin would need to turn maintenance mode back off.
  if (siteInfo?.maintenanceMode?.enabled) {
    return <MaintenancePage message={siteInfo.maintenanceMode.message} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <RouteSweep />
      <Navbar />
      <main className="flex-1">
        {/* mode="wait" so the outgoing page fully finishes its exit
            animation before the next one mounts and animates in — a
            same-time crossfade instead reads as a jarring double-flash. */}
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

// Public-site chrome (Navbar/Footer) + visitor tracking, kept separate from
// AdminLayout so the admin panel never shows the public nav/footer and
// browsing it never counts toward the "Website Visitors" dashboard stat.
export default function MainLayout() {
  return (
    <SiteInfoProvider>
      <MainLayoutContent />
    </SiteInfoProvider>
  );
}
