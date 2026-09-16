import { useEffect } from "react";

/**
 * Injects a <script type="application/ld+json"> tag into <head> while the
 * calling page is mounted, removing it on unmount. Separate from useSeo.js
 * (which only ever updates existing tags) because JSON-LD tags are added
 * fresh per page rather than a single site-wide tag being overwritten.
 *
 * Googlebot renders JavaScript before indexing (same reasoning as
 * useSeo.js), so a script tag added here is picked up the same as one
 * present in the raw HTML — this is Google's own documented pattern for
 * JS-rendered sites, unlike the Open Graph/Twitter tags in useSeo.js which
 * only work for crawlers that don't need this trick anyway.
 *
 * @param {object|null|undefined} schema - a schema.org object, or a falsy
 *   value while the page's data hasn't loaded yet (no-op).
 */
export default function useJsonLd(schema) {
  const json = schema ? JSON.stringify(schema) : null;

  useEffect(() => {
    if (!json) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = json;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [json]);
}
