import mongoose from "mongoose";

// Bilingual fields use { en, ne } — matches src/data/content.js's newsItems
// shape exactly, so contentService.js's getNews() can swap to fetch() and
// every page that already renders this via pick(field, language) keeps
// working untouched.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };

// Category pills + emoji shown on the News page (News.jsx) and its
// filter bar. Values stay space-free — same reasoning as ALBUM_CATEGORIES
// in models/Album.js, since these get interpolated into `news.category${value}`
// translation keys.
export const NEWS_CATEGORIES = ["Health", "Education", "Sports", "SelfEmployment", "DisasterRelief", "CommunityDevelopment", "General"];

const newsSchema = new mongoose.Schema(
  {
    title: { type: bilingual, required: true },
    description: { type: bilingual, required: true },
    date: { type: Date, required: true, default: Date.now },
    category: { type: String, enum: NEWS_CATEGORIES, default: "General" },
    image: { type: String },
    // Additional photos for this item's own detail page gallery (up to 6 —
    // same cap/pattern as Project.images) plus an optional link to a full
    // Gallery Album, mirroring models/Project.js exactly.
    images: [{ type: String }],
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

newsSchema.index({ date: -1 });

export default mongoose.model("News", newsSchema);
