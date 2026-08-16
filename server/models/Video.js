import mongoose from "mongoose";
import { ALBUM_CATEGORIES } from "./Album.js";

// A gallery video — either an embedded link (YouTube/Vimeo/etc, the common
// case) or a directly-uploaded video file. Shown on the Gallery page
// alongside photo Albums, same category taxonomy so the filter pills match.
const bilingual = { en: { type: String, required: true, trim: true }, ne: { type: String, required: true, trim: true } };
const optionalBilingual = { en: { type: String, trim: true, default: "" }, ne: { type: String, trim: true, default: "" } };

const videoSchema = new mongoose.Schema(
  {
    title: { type: bilingual, required: true },
    description: { type: optionalBilingual, default: () => ({}) },
    category: { type: String, enum: ALBUM_CATEGORIES, default: "Event" },
    // Exactly one of these is required (enforced in the controller, not
    // here, since a plain "required" would fight with whichever one is
    // absent on a given video).
    embedUrl: { type: String, trim: true, default: "" },
    videoFile: { type: String, trim: true, default: "" },
    // Auto-derived from a YouTube embedUrl if not explicitly uploaded —
    // see videoController.js's youtubeThumbnail().
    thumbnail: { type: String, trim: true, default: "" },
    // Free text display duration (e.g. "2 hr 44 min") rather than a strict
    // seconds count — same reasoning as Project's `duration` field.
    duration: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);
