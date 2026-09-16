import { useEffect } from "react";

const SITE_NAME = "Khuma Aryal Foundation";
const SITE_URL = "https://khumaaryalfoundation.org.np";
const DEFAULT_DESCRIPTION =
  "Khuma Aryal Foundation — working for Education, Healthcare, Sports & Employment, guiding young people away from problems through good counselling.";
const DEFAULT_IMAGE = `${SITE_URL}/images/og-share.jpg`;

// Every meta tag this hook manages, alongside its selector. All are plain
// <meta ... content="..."> tags (index.html already creates all of these
// statically — see the Open Graph/Twitter Card block there — so this hook
// only ever updates an existing tag's `content`, never creates new ones).
const META_SELECTORS = {
  description: 'meta[name="description"]',
  ogTitle: 'meta[property="og:title"]',
  ogDescription: 'meta[property="og:description"]',
  ogImage: 'meta[property="og:image"]',
  ogUrl: 'meta[property="og:url"]',
  twitterTitle: 'meta[name="twitter:title"]',
  twitterDescription: 'meta[name="twitter:description"]',
  twitterImage: 'meta[name="twitter:image"]',
};

function setMetaContent(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute("content", value);
}

/**
 * Per-page <title> + <meta name="description"> + Open Graph/Twitter tags,
 * restoring whatever was there before on unmount (i.e. when the visitor
 * navigates away) so a page that doesn't call this hook never inherits a
 * stale article title left over from the previous route.
 *
 * IMPORTANT SCOPE NOTE (don't oversell what this fixes): this only
 * changes the live DOM, which is exactly what Google's own crawler reads
 * — Googlebot renders JavaScript before indexing, so this genuinely fixes
 * the "every page has the same title" SEO problem. It does NOT reliably
 * change what WhatsApp/Facebook/Twitter show when *this specific page's*
 * link is shared — those crawlers read the raw server-delivered HTML
 * without running JavaScript, so they only ever see index.html's static,
 * site-wide tags regardless of what this hook sets client-side. Fixing
 * that would need server-side rendering per route, which this project
 * doesn't have. The og/twitter updates here still run (harmless, and
 * correct for the crawlers that *do* render JS), just don't expect a
 * shared news-article link to show that article's own photo on WhatsApp.
 *
 * @param {{ title?: string, description?: string, image?: string, path?: string }} seo
 *   `title` gated on truthiness on purpose — while a detail page is still
 *   loading (title undefined), this is a no-op rather than briefly
 *   flashing a blank/generic title over real content.
 */
export default function useSeo({ title, description, image, path } = {}) {
  useEffect(() => {
    if (!title) return;

    // Capture whatever's currently set so unmounting restores it exactly
    // — correctly cascades back to either the true index.html default or
    // an admin-customized site-wide title (see MainLayout.jsx), not a
    // hardcoded guess at what the default "should" be.
    const prevTitle = document.title;
    const prevMeta = {};
    for (const [key, selector] of Object.entries(META_SELECTORS)) {
      const el = document.querySelector(selector);
      prevMeta[key] = el ? el.getAttribute("content") : null;
    }

    const fullTitle = `${title} | ${SITE_NAME}`;
    const desc = description?.trim() || DEFAULT_DESCRIPTION;
    const img = image || DEFAULT_IMAGE;
    const url = path ? `${SITE_URL}${path}` : SITE_URL;

    document.title = fullTitle;
    setMetaContent(META_SELECTORS.description, desc);
    setMetaContent(META_SELECTORS.ogTitle, fullTitle);
    setMetaContent(META_SELECTORS.ogDescription, desc);
    setMetaContent(META_SELECTORS.ogImage, img);
    setMetaContent(META_SELECTORS.ogUrl, url);
    setMetaContent(META_SELECTORS.twitterTitle, fullTitle);
    setMetaContent(META_SELECTORS.twitterDescription, desc);
    setMetaContent(META_SELECTORS.twitterImage, img);

    return () => {
      document.title = prevTitle;
      for (const [key, selector] of Object.entries(META_SELECTORS)) {
        if (prevMeta[key] != null) setMetaContent(selector, prevMeta[key]);
      }
    };
  }, [title, description, image, path]);
}
