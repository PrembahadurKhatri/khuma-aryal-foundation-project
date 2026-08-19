import mongoose from "mongoose";
import { ALBUM_CATEGORIES } from "./Album.js";

// Matches src/data/content.js's `projects` shape — see models/News.js for
// why bilingual fields are stored as { en, ne }.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };
// Same shape but optional — for fields added after the original projects
// were created (location/beneficiaries/objective), so existing documents
// without them don't fail validation.
const optionalBilingual = { en: { type: String, trim: true, default: "" }, ne: { type: String, trim: true, default: "" } };

const projectSchema = new mongoose.Schema(
  {
    title: { type: bilingual, required: true },
    description: { type: bilingual, required: true },
    status: { type: String, enum: ["ongoing", "completed", "upcoming"], default: "ongoing" },
    // Reuses the same category list as gallery Albums (see models/Album.js)
    // so the Projects page's category filter pills match Gallery's exactly.
    category: { type: String, enum: ALBUM_CATEGORIES, default: "Event" },
    date: { type: Date },
    // Optional — most projects (e.g. "Ongoing since 2024") don't have one
    // yet, so this stays unset rather than required.
    endDate: { type: Date },
    // Free text on purpose (e.g. "6 Months", "Jan - Jun 2026", "Ongoing
    // since 2024") rather than a strict start/end date pair — matches how
    // `beneficiaries` is also loose text instead of a strict number, so
    // admins aren't forced into a rigid format that doesn't fit every project.
    duration: { type: optionalBilingual, default: () => ({}) },
    location: { type: optionalBilingual, default: () => ({}) },
    beneficiaries: { type: optionalBilingual, default: () => ({}) },
    objective: { type: optionalBilingual, default: () => ({}) },
    // Optional link to a gallery Album (see models/Album.js) so a project's
    // detail page can point visitors to that program's full photo
    // collection, not just the few images uploaded directly on the project.
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", default: null },
    images: [{ type: String }],
    // A dedicated photo for the project's hero banner / card cover, set
    // independently of the gallery `images` array — lets an admin pick
    // exactly which shot represents the project instead of it defaulting to
    // whatever happens to be first in `images`. Falls back to `images[0]`
    // on the frontend when unset (see ProjectCard.jsx/ProjectDetail.jsx).
    thumbnail: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
