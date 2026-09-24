const SITE_URL = "https://khumaaryalfoundation.org.np";

/**
 * Builds a schema.org BreadcrumbList for a detail page, e.g.
 *   buildBreadcrumbSchema([
 *     { name: "News", path: "/news" },
 *     { name: title, path: `/news/${id}` },
 *   ])
 * `items` is the trail AFTER Home, which this always prepends itself --
 * every detail page's breadcrumb starts there. A falsy `name` (title still
 * loading) makes this return null instead of a list with a blank crumb;
 * pass the result straight into useJsonLd, which already no-ops on a
 * falsy schema.
 */
export function buildBreadcrumbSchema(items) {
  if (items.some((item) => !item.name)) return null;

  const trail = [{ name: "Home", path: "/" }, ...items];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
