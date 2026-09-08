// Generates public/sitemap.xml before every build, so it stays accurate as
// content (news, projects, gallery albums, stories, events, vacancies,
// notices) is added/removed through the admin panel -- a hand-written
// static file would go stale the first time an editor adds a new post.
// Runs as an npm "prebuild" step (see package.json), so it picks up the
// same VITE_API_TARGET env var the real build uses (set directly in
// .github/workflows/deploy-client.yml for CI; falls back to .env locally).
import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Vite only loads .env for the `vite` CLI itself, not for a plain node
// script run via a prebuild hook -- read it by hand so `npm run build`
// still works locally without the value being exported into the shell.
function loadDotEnvVar(name) {
  if (process.env[name]) return process.env[name];
  try {
    const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
    const line = readFileSync(envPath, "utf8")
      .split("\n")
      .find((l) => l.trim().startsWith(`${name}=`));
    return line ? line.split("=").slice(1).join("=").trim() : undefined;
  } catch {
    return undefined;
  }
}

const SITE_URL = "https://khumaaryalfoundation.org.np";
const API = (loadDotEnvVar("VITE_API_TARGET") || "https://api.khumaaryalfoundation.org.np").replace(/\/+$/, "");

// [urlPath prefix for detail pages, API collection endpoint]
const COLLECTIONS = [
  ["/projects", "/api/projects"],
  ["/news", "/api/news"],
  ["/notices", "/api/notices"],
  ["/gallery", "/api/gallery"],
  ["/events", "/api/events"],
  ["/stories", "/api/stories"],
  ["/vacancies", "/api/vacancies"],
];

const STATIC_URLS = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/about", priority: "0.8", changefreq: "monthly" },
  { loc: "/gallery", priority: "0.7", changefreq: "weekly" },
  { loc: "/projects", priority: "0.8", changefreq: "weekly" },
  { loc: "/news", priority: "0.9", changefreq: "daily" },
];

async function fetchIds(endpoint) {
  try {
    const res = await fetch(`${API}${endpoint}`);
    if (!res.ok) throw new Error(`${endpoint} -> ${res.status}`);
    const body = await res.json();
    return (body.data || []).map((doc) => ({ id: doc._id, updatedAt: doc.updatedAt }));
  } catch (err) {
    // A failed fetch (API briefly down during a deploy, etc.) shouldn't
    // break the whole client build -- fall back to just that collection
    // being (temporarily) missing from the sitemap rather than aborting.
    console.warn(`[sitemap] Skipping ${endpoint}: ${err.message}`);
    return [];
  }
}

function urlEntry(loc, { priority, changefreq, lastmod } = {}) {
  return [
    "  <url>",
    `    <loc>${SITE_URL}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

const entries = STATIC_URLS.map((u) => urlEntry(u.loc, u));

for (const [urlPrefix, endpoint] of COLLECTIONS) {
  const items = await fetchIds(endpoint);
  for (const item of items) {
    entries.push(
      urlEntry(`${urlPrefix}/${item.id}`, {
        priority: "0.6",
        changefreq: "monthly",
        lastmod: item.updatedAt ? new Date(item.updatedAt).toISOString().slice(0, 10) : undefined,
      })
    );
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;

const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");
writeFileSync(outPath, xml);
console.log(`[sitemap] Wrote ${entries.length} URLs to ${outPath}`);
