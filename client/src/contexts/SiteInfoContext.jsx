import { createContext, useContext, useEffect, useState } from "react";
import { siteInfo as staticSiteInfo } from "../data/content.js";
import { getSiteInfo } from "../services/contentService.js";

// Provides the live /api/settings document to Navbar/Footer/About/leadership
// cards, which previously all imported the static `siteInfo` object
// directly. Seeded with that same static object so there's no loading flash
// or missing-data state — it silently upgrades to the live value once the
// fetch resolves (and falls back to the static object if the API call
// fails, e.g. backend not running yet).
const SiteInfoContext = createContext(staticSiteInfo);

export function SiteInfoProvider({ children }) {
  const [siteInfo, setSiteInfo] = useState(staticSiteInfo);

  useEffect(() => {
    let active = true;
    getSiteInfo()
      .then((data) => {
        if (active && data) setSiteInfo(data);
      })
      .catch(() => {
        // Backend unreachable — keep showing the static fallback.
      });
    return () => {
      active = false;
    };
  }, []);

  return <SiteInfoContext.Provider value={siteInfo}>{children}</SiteInfoContext.Provider>;
}

export function useSiteInfo() {
  return useContext(SiteInfoContext);
}
