# Khuma Aryal Foundation — Website (Frontend)

A premium, aesthetic, fully bilingual (English / नेपाली) website for **Khuma
Aryal Foundation**. This is the **frontend-only** build — structured so a
Node/Express + MongoDB backend and CMS (add/delete messages, projects, news,
gallery) can be plugged in later without touching the pages or components.

## ✨ Highlights

- Premium visual design: serif display type (Fraunces) + Manrope body font,
  forest-green/gold palette, glassy sticky navbar, scroll-reveal motion
  (Framer Motion), decorative hero motif, elevated card system.
- **Full bilingual coverage** — toggling the navbar language pill switches
  *everything*: nav, headings, buttons, AND all dynamic content (leader
  messages, project titles/descriptions, news, gallery captions). Nothing is
  left in English when Nepali is selected, or vice versa.
- Language toggle shows actual flag icons (UK 🇬🇧 for English, Nepal 🇳🇵) in a
  pill switch, persisted in `localStorage`.
- Pages: **Home** (hero, focus pillars, leadership messages, explore links,
  stats, CTA), **About Us** (Vision, Mission, Foundation Profile, Contact),
  **Gallery** (click-to-enlarge lightbox), **Projects** (Ongoing/Completed
  filter), **News/Notice**.
- Graceful image fallbacks — the site looks finished even before real photos
  are uploaded.

## 🗂️ Project structure

```
client/
├─ public/
│  ├─ logo.svg                # Replace with your real logo
│  └─ images/                 # Drop real photos here (see images/README.md)
├─ src/
│  ├─ components/              # Reusable UI (Navbar, Footer, Hero, cards, icons/Flags, gallery/)
│  ├─ pages/                   # Home, About, Gallery, Projects, News, NotFound
│  ├─ data/content.js          # ⭐ All editable bilingual content
│  ├─ services/contentService.js  # Data-access seam — swap for API calls later
│  ├─ hooks/useContent.js      # Loading-state hook used by every page
│  ├─ i18n/                    # translations.js (UI strings) + LanguageContext
│  ├─ utils/localize.js        # pick(field, language) helper for bilingual content
│  ├─ App.jsx / main.jsx
├─ tailwind.config.js          # Colors, fonts, shadows, motion tokens
└─ package.json
```

## 🚀 Getting started

```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build       # production build -> client/dist
npm run preview     # preview the production build locally
```

## ✏️ Editing content

Everything editable lives in **`src/data/content.js`**. Text that must appear
in both languages uses the shape:

```js
{ en: "Founder", ne: "संस्थापक" }
```

- `siteInfo` — foundation name, tagline, address, phone, email, social links
- `leaderMessages` — Founder, President, Past President, Secretary,
  Advisor(s), Patron/Spouse — the exact list a future "Messages" CMS screen
  would let an admin add to / delete from
- `projects` — title, status (`ongoing` / `completed`), description, images
- `newsItems` — title, date, description
- `galleryImages` — src, bilingual caption

All sample names/messages are **placeholders** — replace them with the real
people and content before publishing.

## 🖼️ Adding real photos

Photo paths point at `/public/images/...` (see `public/images/README.md`).
Add a file with the matching name and it appears automatically — no missing
photo ever shows as a broken image, it falls back to a soft placeholder.

## 🌐 How the bilingual system works

- **UI strings** (nav, section titles, buttons, footer) live in
  `src/i18n/translations.js`, grouped by page, and are read with
  `t("home.heroTitle")` from `useLanguage()`.
- **Dynamic content** (messages, projects, news, gallery captions) lives in
  `src/data/content.js` as `{ en, ne }` pairs and is resolved with
  `pick(field, language)` from `src/utils/localize.js`.
- The navbar's flag toggle (`src/components/LanguageSwitcher.jsx`) flips
  `language` in `LanguageContext`, instantly re-rendering both systems — no
  page reload, no partially-translated screens.

## 🔌 Connecting the future backend / CMS

`src/services/contentService.js` is the seam. Every page already calls it
through `useContent()` (a small loading-state hook), e.g.:

```js
const { data: messages, loading } = useContent(getMessages);
```

When the Express + MongoDB API exists, change only the function bodies in
`contentService.js` to `fetch("/api/messages")` etc. (keeping the same
`{ en, ne }` shape in each document), and add the write operations the CMS
needs (`createMessage`, `deleteMessage`, ...). No page or component changes
required.

## 🎨 Design tokens

Colors (`forest` = green, `gilt` = gold, `cream`/`ink` = neutrals), fonts and
shadows are defined once in `tailwind.config.js` — change them there to
re-theme the whole site.

## 📦 Deployment

Static site after `npm run build` (`client/dist`) — deploy to any static
host. Since routing uses `BrowserRouter`, configure the host to fall back
unknown paths to `index.html` (standard SPA rewrite rule).
