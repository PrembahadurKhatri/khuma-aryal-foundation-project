import { purgeCloudflareUrls } from "../config/cloudflare.js";

// A minimal in-memory TTL cache for public, rarely-changing GET routes
// (leaders, projects, news, notices, board-members, settings). Cheap and
// process-local by design -- this app runs a single Node process, so there's
// no cross-process staleness to worry about, and it avoids pulling in a
// dependency (or a separate Redis instance) for what's a handful of small
// JSON documents. NEVER apply this to an auth/admin/private route -- it has
// no concept of per-user data, so caching a response tied to a specific
// requester would leak it to the next caller who hits the same URL.
const store = new Map(); // `${namespace}:${originalUrl}` -> { body, expiresAt }

// Every one of these namespaces matches its route path exactly
// (/api/leaders, /api/projects, ...) -- see server.js's route registrations
// -- so the namespace alone is enough to build the public URL Cloudflare's
// edge cache rule would have cached it under.
const API_ORIGIN = process.env.API_ORIGIN || "https://api.khumaaryalfoundation.org.np";

// Admin writes already clear the relevant namespace immediately (see
// clearCache below), so a long TTL costs nothing in staleness -- it only
// cuts how often a visitor's request has to fall through to a real Mongo
// query. That matters on this host: a cold cache hit during a CloudLinux
// I/O throttle window is what turned into multi-second/timeout delays.
const DEFAULT_TTL_MS = 30 * 60 * 1000;

// Keyed by the full originalUrl (not just the path) so query-string
// variations -- /api/projects?status=ongoing vs ?status=completed -- each
// get their own cache entry instead of colliding.
export const cacheGet = (namespace, ttlMs = DEFAULT_TTL_MS) => (req, res, next) => {
  const key = `${namespace}:${req.originalUrl}`;
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    res.set("X-Cache", "HIT");
    return res.json(hit.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      store.set(key, { body, expiresAt: Date.now() + ttlMs });
    }
    res.set("X-Cache", "MISS");
    return originalJson(body);
  };
  next();
};

// Called from a namespace's create/update/delete controllers so an admin
// edit is visible immediately instead of waiting out the TTL -- both this
// process's own in-memory cache AND (if configured) Cloudflare's edge cache
// for the same namespace's plain URL (no query string). A cached query-string
// variant (e.g. /api/projects?status=ongoing) is deliberately left for
// Cloudflare's short Edge TTL to expire on its own rather than tracked and
// purged individually -- the Edge TTL on that rule is short specifically so
// this bounded staleness is an acceptable tradeoff.
export const clearCache = (namespace) => {
  const prefix = `${namespace}:`;
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
  purgeCloudflareUrls([`${API_ORIGIN}/api/${namespace}`]);
};
