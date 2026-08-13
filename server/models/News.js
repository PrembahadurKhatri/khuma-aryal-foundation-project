import mongoose from "mongoose";

// Bilingual fields use { en, ne } — matches src/data/content.js's newsItems
// shape exactly, so contentService.js's getNews() can swap to fetch() and
// every page that already renders this via pick(field, language) keeps
// working untouched.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };

const newsSchema = new mongoose.Schema(
  {
    title: { type: bilingual, required: true },
    description: { type: bilingual, required: true },
    date: { type: Date, required: true, default: Date.now },
    image: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

newsSchema.index({ date: -1 });

export default mongoose.model("News", newsSchema);
