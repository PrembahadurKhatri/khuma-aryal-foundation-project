// Purges specific URLs from Cloudflare's edge cache right when an admin
// changes data, so the short Edge TTL on the public API cache rule
// (see middleware/cache.js's clearCache) doesn't mean waiting out that TTL
// to see your own edit. Optional by design, the same pattern as Cloudinary
// in config/cloudinary.js -- if the token/zone aren't set, purging is
// silently skipped rather than breaking admin writes; the short Edge TTL
// alone still bounds staleness even without it.
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;

export const isCloudflarePurgeConfigured = Boolean(CLOUDFLARE_API_TOKEN && CLOUDFLARE_ZONE_ID);

// Fire-and-forget by design -- an admin saving a leader/news item should
// never wait on (or fail because of) a third-party API call. Errors are
// logged, not thrown; the worst case if this silently fails is the normal
// short Edge TTL still expiring on its own a few minutes later.
export const purgeCloudflareUrls = (urls) => {
  if (!isCloudflarePurgeConfigured || urls.length === 0) return;

  fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ files: urls }),
  })
    .then(async (res) => {
      if (!res.ok) console.error(`Cloudflare cache purge failed (${res.status}): ${await res.text()}`);
    })
    .catch((err) => console.error(`Cloudflare cache purge request failed: ${err.message}`));
};
