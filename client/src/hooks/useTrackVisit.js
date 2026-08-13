import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recordVisit } from "../services/visitService.js";

// Fires once per public-page navigation, feeding the "Website Visitors" stat
// on the admin dashboard. Mounted in App.jsx only for the public routes, so
// admin-panel browsing never counts. Fire-and-forget.
const useTrackVisit = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    recordVisit(pathname);
  }, [pathname]);
};

export default useTrackVisit;
