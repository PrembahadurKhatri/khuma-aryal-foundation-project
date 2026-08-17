import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PageTransition from "../components/PageTransition.jsx";
import RouteSweep from "../components/RouteSweep.jsx";
import LogoFlipOverlay from "../components/LogoFlipOverlay.jsx";
import useTrackVisit from "../hooks/useTrackVisit.js";
import { SiteInfoProvider } from "../contexts/SiteInfoContext.jsx";

// Public-site chrome (Navbar/Footer) + visitor tracking, kept separate from
// AdminLayout so the admin panel never shows the public nav/footer and
// browsing it never counts toward the "Website Visitors" dashboard stat.
export default function MainLayout() {
  useTrackVisit();
  const location = useLocation();

  return (
    <SiteInfoProvider>
      <div className="flex min-h-screen flex-col bg-cream-100">
        <LogoFlipOverlay />
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
    </SiteInfoProvider>
  );
}
