# Khuma Aryal Foundation

A full-stack site + admin CMS for Khuma Aryal Foundation, a Nepal-based NGO working in
Education, Healthcare, Sports & Employment. Bilingual public site (English / Nepali) backed
by a custom Express + MongoDB API, with an admin dashboard for managing every piece of
content — news, notices, events, impact stories, projects, gallery, job vacancies, board
members, leadership messages, and site-wide settings.

## Project Overview

- **Public site**: Home, About, Gallery (photo albums + videos), Projects, News/Notices,
  Event/Story/Vacancy detail pages, a contact form, and job applications with file uploads.
- **Admin panel** (`/admin`): full CRUD for every content type above, a visitor-stats
  dashboard, and site settings (organization info, social links, homepage stats, SEO,
  maintenance mode, and the admin's own login credentials).
- **Auth**: JWT access + refresh tokens (httpOnly cookies), role-based access
  (`admin` / `editor`), change password, change email, and email-based forgot/reset
  password — all built around a single admin user model.
- **Maintenance mode**: a Settings toggle that swaps the entire public site for a
  "we'll be back soon" page while leaving `/admin` fully reachable.

This is a **split deployment**: the client (Vite/React) and server (Express) deploy and run
as two independent services, not one combined app — see [Deployment](#deployment).

## Technologies Used

**Backend** (`server/`)
- Node.js + Express 4, ES modules
- MongoDB + Mongoose 8
- JWT (`jsonwebtoken`) for auth, `bcryptjs` for password hashing
- `express-validator` for request validation
- `multer` + `multer-storage-cloudinary` for file uploads (photos, videos, documents),
  with automatic fallback to local disk storage if Cloudinary isn't configured
- `helmet`, `cors`, `express-mongo-sanitize`, `xss-clean`, `express-rate-limit` for security
- Resend HTTP API for transactional email (password resets, contact-form notifications) —
  not SMTP, since most hosts block outbound SMTP ports

**Frontend** (`client/`)
- React 18 + Vite
- React Router 6
- TanStack Query (`@tanstack/react-query`) for server-state fetching/caching
- Tailwind CSS
- Framer Motion for page transitions and scroll animations
- Axios (`services/api.js`) with an interceptor that transparently refreshes an expired
  access token and retries the original request once
- `lucide-react` for icons

## Repository Structure

```
khuma-aryal-project/
├── client/                  # React + Vite frontend
│   ├── public/               # Static assets (images, favicon)
│   ├── src/
│   │   ├── components/       # Shared UI (Navbar, Footer, Button, Avatar, gallery/, leadership/, admin layout pieces)
│   │   ├── contexts/          # AuthContext, SiteInfoContext, ToastContext
│   │   ├── hooks/              # useAuth, useToast, useTrackVisit, useContent
│   │   ├── layouts/            # MainLayout (public), AdminLayout
│   │   ├── i18n/                # Bilingual (en/ne) translation strings
│   │   ├── pages/                # Public route pages
│   │   │   └── admin/             # Admin panel pages (one *Manage.jsx per resource)
│   │   └── services/              # One thin API-wrapper file per resource
│   └── vercel.json           # SPA rewrite rule for Vercel
└── server/
    ├── config/               # db.js (Mongo connection), cloudinary.js
    ├── controllers/          # Business logic, one file per resource
    ├── middleware/           # auth (protect/authorize), upload, validate, errorHandler
    ├── models/               # Mongoose schemas
    ├── routes/               # Express routers, one file per resource
    ├── utils/                # fallbackAdmin, generateToken, sendEmail, emailTemplate, seedData
    └── server.js              # App entry point
```

## Installation

Requires Node.js 18+ and a MongoDB connection (local or Atlas).

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd khuma-aryal-project

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
# then fill in the real values — see Environment Variables below
```

The client only needs one local env var, in `client/.env`:

```
VITE_API_TARGET=http://localhost:5001
```

### 3. Seed the database (optional but recommended)

```bash
cd server
npm run seed
```

This wipes and reseeds demo content plus a default admin login. Check
`server/utils/seedData.js` for the exact credentials it creates — or just log in with the
hardcoded **fallback admin** below before seeding, since that always works.

### 4. Run both apps

```bash
# terminal 1
cd server && npm run dev      # nodemon, http://localhost:5001

# terminal 2
cd client && npm run dev      # Vite dev server, http://localhost:5173
```

Visit `http://localhost:5173` for the public site, `http://localhost:5173/admin/login` for
the admin panel.

**Fallback admin login** — works even before MongoDB is seeded or reachable (see
`server/utils/fallbackAdmin.js`):
```
email:    admin@khumaaryalfoundation.org   (or FALLBACK_ADMIN_EMAIL)
password: ChangeMe123!                      (or FALLBACK_ADMIN_PASSWORD)
```
The first time you change this account's password or email from the Settings page, it
provisions a real `User` document in MongoDB — from then on, that real document's
credentials are authoritative and the hardcoded fallback stops being a valid login for that
email.

## Environment Variables

All server config lives in `server/.env` (see `server/.env.example` for the annotated
template). **Never commit `.env`.**

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas (or local) connection string, including the database name. |
| `JWT_SECRET` | Yes | Signs access tokens. Any long random string. |
| `JWT_REFRESH_SECRET` | Yes | Signs refresh tokens. Must differ from `JWT_SECRET`. |
| `JWT_EXPIRE` | No | Access token lifetime. Default `15m`. |
| `JWT_REFRESH_EXPIRE` | No | Refresh token lifetime. Default `7d`. |
| `CLIENT_URL` | Yes | Origin(s) allowed by CORS, comma-separated if more than one. |
| `PORT` | No | Server port. Default `5001`. |
| `NODE_ENV` | No | `development` or `production`. |
| `FALLBACK_ADMIN_EMAIL` | No | Overrides the hardcoded bootstrap admin email. |
| `FALLBACK_ADMIN_PASSWORD` | No | Overrides the hardcoded bootstrap admin password. |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary dashboard → API Keys. Uploads fall back to local disk if unset. |
| `CLOUDINARY_API_KEY` | No | See above. |
| `CLOUDINARY_API_SECRET` | No | See above. |
| `RESEND_API_KEY` | No | [resend.com](https://resend.com) API key. Without it, emails (password reset, contact-form notification) silently don't send — everything else still works. |
| `EMAIL_FROM` | No | `"Display Name <address@yourdomain.com>"`. The domain **must** be verified in your Resend account or sends will fail. |

Client (`client/.env`):

| Variable | Required | Description |
|---|---|---|
| `VITE_API_TARGET` | Local dev only | Backend URL the Vite dev server proxies `/api` to. Not used in production builds — the deployed client calls the API's real URL directly (see `services/api.js`). |

## Deployment

Client and server deploy **independently** — this is not a combined single-service app.

### Server (Express API)

Deployed on Render (or any Node host):
- **Build command**: `npm install`
- **Start command**: `npm start`
- Set all the server environment variables above in the host's dashboard.
- `CLIENT_URL` must be the deployed client's real URL (or a comma-separated list including
  it) or the browser will get CORS errors on every request.
- Health check: `GET /api/health` → `{ "success": true, "message": "API is running" }`

### Client (React SPA)

Deployed on Vercel:
- **Build command**: `npm run build` (from `client/`)
- **Output directory**: `client/dist`
- `client/vercel.json` provides the SPA rewrite rule (`/* → /index.html`) so client-side
  routes don't 404 on a hard refresh/direct link.
- The production build reads the API's base URL from `services/api.js` — update that (or
  wire it to a build-time env var) if the API's URL changes.

### After any deploy

- Confirm `GET /api/health` on the live API.
- Confirm the admin can log in at `/admin/login` (fallback admin credentials work as a
  last resort).
- If email isn't arriving (forgot-password, contact form), check `RESEND_API_KEY` and that
  `EMAIL_FROM`'s domain is verified in Resend — the API returns a clear error in the
  response body when a send fails, rather than silently claiming success.

## API Documentation

Base URL: `/api`. All list/detail `GET` endpoints are public unless noted. Every JSON
response follows `{ success: boolean, data?, message?, errors? }`.

**Auth** (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | admin | Create a new admin/editor user. |
| POST | `/login` | — | Returns access token (body) + sets refresh/access cookies. |
| POST | `/refresh` | — | Rotates the refresh token, returns a new access token. |
| POST | `/logout` | — | Clears auth cookies, revokes the refresh token. |
| GET | `/me` | any logged-in user | Current user's profile. |
| PUT | `/change-password` | any logged-in user | Requires current password. |
| PUT | `/change-email` | any logged-in user | Requires current password; changes the login email. |
| POST | `/forgot-password` | — | Sends a reset link to the account's own login email (not any public contact address). |
| POST | `/reset-password/:token` | — | Sets a new password using the emailed token (15 min expiry). |

**Content resources** — News, Notices, Events, Stories, Projects, Vacancies, Downloads,
Videos, Leaders, Board Members, Gallery Albums all follow the same shape:
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/<resource>` | — | List, with query-based filtering (varies per resource). |
| GET | `/<resource>/:id` | — | Single item. |
| POST | `/<resource>` | admin/editor | Create (multipart/form-data where file uploads apply). |
| PUT | `/<resource>/:id` | admin/editor | Update. |
| DELETE | `/<resource>/:id` | admin | Delete. |

Resource path names: `/news`, `/notices`, `/events`, `/stories`, `/projects`,
`/vacancies`, `/downloads`, `/videos`, `/leaders`, `/board-members`, `/gallery`.

**Other endpoints**
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/vacancies/:id/apply` | — | Public job application submission (`coverLetter` required, `resume` optional — both file uploads). |
| GET | `/applications` | admin/editor | List job applications. |
| PUT | `/applications/:id` | admin/editor | Update an application's status. |
| DELETE | `/applications/:id` | admin | Delete an application. |
| POST | `/messages` | — | Public contact-form submission. |
| GET | `/messages` | admin/editor | List contact messages. |
| PUT | `/messages/:id` | admin/editor | Update a message's status (e.g. mark read). |
| DELETE | `/messages/:id` | admin | Delete a message. |
| GET | `/settings` | — | Site-wide settings (org info, social links, homepage stats, SEO, maintenance mode). |
| PUT | `/settings` | admin/editor | Update settings. |
| POST | `/visits` | — | Fire-and-forget page-view tracker, called by the public site. |
| GET | `/visits/stats` | admin/editor | Total / last-7-days / last-30-days visit counts, for the dashboard. |
| DELETE | `/visits` | admin | Resets the visitor counter to 0 by deleting every recorded visit. Irreversible. |
| GET | `/health` | — | Liveness check. |

**Auth model**: `protect` middleware reads the access token from an `Authorization: Bearer`
header or the `accessToken` httpOnly cookie. `authorize("admin", "editor")` then checks
`req.user.role`. Endpoints marked "admin" only accept the `admin` role — `editor`s can
create/edit most content but can't delete or touch destructive/account-level actions.
