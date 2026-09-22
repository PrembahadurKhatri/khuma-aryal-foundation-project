// A minimal in-memory TTL cache for public, rarely-changing GET routes
// (leaders, projects, news, notices, board-members, settings). Cheap and
// process-local by design -- this app runs a single Node process, so there's
// no cross-process staleness to worry about, and it avoids pulling in a
// dependency (or a separate Redis instance) for what's a handful of small
// JSON documents. NEVER apply this to an auth/admin/private route -- it has
// no concept of per-user data, so caching a response tied to a specific
// requester would leak it to the next caller who hits the same URL.
const store = new Map(); // `${namespace}:${originalUrl}` -> { body, expiresAt }

const DEFAULT_TTL_MS = 5 * 60 * 1000;

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
// edit is visible immediately instead of waiting out the TTL.
export const clearCache = (namespace) => {
  const prefix = `${namespace}:`;
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};
