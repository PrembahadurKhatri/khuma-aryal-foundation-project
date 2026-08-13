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
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
