import mongoose from "mongoose";

// Single-document collection (there is always exactly one Settings row —
// see settingsController.js's getOrCreate helper). Mirrors src/data/
// content.js's `siteInfo` shape so contentService.js's getSiteInfo() can
// swap to fetch() untouched.
const bilingual = { en: { type: String, default: "" }, ne: { type: String, default: "" } };

const settingsSchema = new mongoose.Schema(
  {
    name: { type: bilingual, default: () => ({}) },
    tagline: { type: bilingual, default: () => ({}) },
    address: { type: bilingual, default: () => ({}) },
    officeHours: { type: bilingual, default: () => ({}) },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    // Home page's stat counters (Hero.jsx's "Years of Service" strip) —
    // free text rather than plain numbers so the admin keeps control of
    // formatting (e.g. "5,000+", "10+"). The client parses the leading
    // digits out of each to animate a count-up and re-appends whatever
    // follows (the "+", commas, etc.) unchanged.
    stats: {
      years: { type: String, default: "10+" },
      beneficiaries: { type: String, default: "5,000+" },
      projects: { type: String, default: "40+" },
      volunteers: { type: String, default: "120+" },
    },
    // Public-site maintenance mode (admin panel → Settings). When enabled,
    // MainLayout.jsx shows a full-screen "under maintenance" page instead of
    // the normal public routes; /admin/* is untouched either way so an
    // admin can always log in and turn it back off. Enforced client-side
    // only (see MainLayout.jsx) rather than in the API, since public pages
    // and the admin's own management screens read the same GET endpoints
    // (e.g. GET /api/news) — blocking them server-side would lock the
    // admin out of their own dashboard along with the public site.
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: {
        type: String,
        default: "We're currently performing scheduled maintenance. We'll be back online shortly — thank you for your patience.",
      },
    },
    // Overrides index.html's static <title>/<meta name="description"> once
    // the public site loads (see MainLayout.jsx) — empty by default so an
    // admin who hasn't filled these in yet doesn't blank out the site's
    // real title/description.
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
