# Khuma Aryal Foundation — Project Notes

## Stack & architecture
- **Frontend:** React + Vite (`client/`), deployed via GitHub Actions FTP to cPanel `public_html` on push to the `khuma-aryal` branch (`.github/workflows/deploy-client.yml`). Fully automatic — no manual step.
- **Backend:** Node/Express + Mongoose (`server/`), hosted on cPanel via Phusion Passenger ("Setup Node.js App"). **No auto-deploy.**
- **Database:** MongoDB Atlas (remote, not local to cPanel).
- **DNS/CDN:** Cloudflare, proxied.
- **File storage:** Local disk (`server/uploads/`), NOT Cloudinary — deliberately migrated off Cloudinary (see history below). `isCloudinaryConfigured` in `config/cloudinary.js` auto-falls-back to local disk if Cloudinary env vars are unset.

## Repo sync — THREE local clones
This project exists in three separate local folders that must all be kept in sync:
- `C:\Users\Prem Bahadur Khatri\Desktop\Backend\khuma-aryal-project` (primary)
- `C:\Users\Prem Bahadur Khatri\Desktop\Backend\khuma-aryal-foundation-project`
- `C:\Users\Prem Bahadur Khatri\khuma-aryal-foundation-project`

After every push, run `git pull origin khuma-aryal --ff-only` in the other two.

## Deploying the backend (manual, every time)
1. cPanel → **Git™ Version Control** → **Pull or Deploy**.
2. **If `server/package.json` changed:** Setup Node.js App → **Run NPM Install** (skipping this crashes the entire app — "Web application could not be started" on every route — this has happened twice).
3. Setup Node.js App → **Restart**.

cPanel's "Run JS Script" only lists `package.json` `scripts` entries (no arbitrary file paths) — register any one-off script there first.

## Performance & I/O investigation — full history

### Problem 1: "Sleep mode" (MongoDB idle connection) — SOLVED, verified
Root cause: pooled MongoDB Atlas connection went stale after idle periods; first query after idle paid a ~27s reconnect cost. Fixed with a periodic keep-alive ping (`config/db.js`, every 4 min, `mongoose.connection.db.admin().ping()`). Verified with real 20/25/30-min idle tests. Has not recurred.

### Problem 2: General slowness — SOLVED
- In-memory response cache for public GET routes (`middleware/cache.js`), namespaces: `leaders`, `projects`, `news`, `notices`, `board-members`, `settings`. TTL 30 min, cleared instantly on admin writes via `clearCache(namespace)`.
- `.lean()`/`.select()` + indexes on the relevant Mongoose queries/models.
- `compression` (gzip) middleware.
- Frontend: deduped redundant `/settings` call, skip `/auth/refresh` for anonymous visitors.

### Problem 3: CloudLinux I/O throttling ("burst problem") — MITIGATED, NOT eliminated
Root cause: this cPanel account has a hard **1MB/s I/O ceiling**. Confirmed repeatedly (matching timestamps between real slow-request logs and cPanel's Resource Usage → Faults page) that short, normal traffic bursts occasionally cross it, stalling the whole account for several seconds — sometimes 10-20s, affecting real visitors. This is NOT fixable purely by code; the ceiling itself is a hosting-plan limit. User has explicitly declined to upgrade the plan; wants to stay at 1MB/s and minimize bursts instead.

**Everything done to reduce it (chronological):**
1. Migrated all originally-Cloudinary-hosted files (325 images) to local disk + updated DB (`scripts/migrateCloudinaryToLocal.js`, one-time, already run).
2. Added 30-day browser cache headers to `/uploads/*` (`server.js`, `express.static` maxAge).
3. Cloudflare Cache Rule for `/uploads/*`, Edge TTL 1 year (images never change — unique timestamped filenames, safe to cache "forever").
4. `middleware/compressImage.js`: every new local-disk upload auto-resized (max 1600px) + converted to WebP via `sharp`.
5. One-time WebP conversion of the 325 already-migrated images (`scripts/convertUploadsToWebp.js`, already run — 334 converted, 0 failures).
6. Trimmed logging: `requestTimer.js` only logs requests ≥500ms; `morgan` skips logging successful automated pings (health checks, UptimeRobot, internal cron) in `server.js`.
7. Full codebase I/O audit — found and fixed a real bug: `client/index.html` favicon linked to a nonexistent `haha.png` (only `haha.webp` existed), causing a 404 disk-lookup on **every single page load** for every visitor. Fixed.
8. Added `client/public/.htaccess` (none existed before) — gzip compression, 1-year cache on Vite's hashed JS/CSS, 30-day cache on images, SPA routing fallback. The frontend site shares the same cPanel I/O quota as the API, so this mattered too.
9. Deleted unused 1.7MB orphaned `khuma.png` (confirmed zero references anywhere).
10. Cloudflare Cache Rule for the six public JSON API routes (`/api/leaders`, `/news`, `/notices`, `/projects`, `/board-members`, `/settings`), Edge TTL 2 hours ("ignore cache-control header and use this TTL" — free plan doesn't offer minutes-level presets for this mode). Purge-on-write wired up via `config/cloudflare.js` (`purgeCloudflareUrls`, called from `clearCache`) using `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` env vars (Zone-level "Cache Purge" permission token). Fire-and-forget, gracefully no-ops if env vars unset.
11. **Caught during verification:** the zone-wide "Browser Cache TTL" setting (set to a fixed long value for images, weeks earlier) was leaking onto the new API cache rule too — visitor browsers were caching JSON for 31 days. Fixed two ways: (a) `cacheGet` in `middleware/cache.js` now explicitly sets `Cache-Control: public, max-age=120` on every response; (b) user changed the zone's Browser Cache TTL setting from a fixed value to **"Respect Existing Headers"** so per-route origin headers actually take effect (images still get their own long 30-day header from `express.static`).
12. Cloudflare **Tiered Cache** enabled (reduces duplicate origin fetches across Cloudflare's global PoPs).

**Confirmed working (verified via `cf-cache-status: HIT`):**
- `/uploads/*` images
- Frontend's own JS/CSS (Cloudflare caches these by default, no custom rule needed)
- The six public JSON API routes (as of the 2cc698a / 8c45720 commits)

**Still open / unresolved:**
- The newest fix (#10-11 above) has NOT yet been tested against a real early-morning incident — every previous documented failure happened before it existed. Next early-morning check is the real test.
- If it still fails: the only remaining lever is asking the host to raise the I/O limit (email drafted, not yet sent — user was waiting to see if the edge-caching fix was enough first) or a plan upgrade (declined so far).
- `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ZONE_ID` env vars — confirmed added to cPanel.

## Known non-issues (already investigated, ruled out)
- NOT Passenger process eviction (process stays alive, same PID, across incidents).
- NOT MongoDB connection staleness recurring (keep-alive ping is unconditional, independent of route traffic).
- NOT a MySQL/Sequelize issue — this project uses MongoDB/Mongoose exclusively, no MySQL anywhere.
- Cloudflare DNS proxying itself is not the cause of anything (ruled out early via `cf-cache-status: DYNAMIC` + selective DB-only slowness pattern).

## Fallback admin login
`utils/fallbackAdmin.js` lets `/admin/login` work via `FALLBACK_ADMIN_EMAIL`/`FALLBACK_ADMIN_PASSWORD` env vars even if MongoDB is unreachable — intentional resilience feature, not a bug.

## Security note
`utils/generateToken.js` has a hardcoded fallback JWT secret (`"local-dev-secret"`) if `JWT_SECRET` env var is unset — silent failure mode, not enforced. Worth periodically confirming `JWT_SECRET`/`JWT_REFRESH_SECRET` are actually set in cPanel's production env vars.
